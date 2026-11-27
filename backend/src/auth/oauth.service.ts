import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from "@nestjs/common";
import { OAuthPlatform, OAuthProvider } from "@prisma/client";
import {
  createHash,
  createPrivateKey,
  createPublicKey,
  randomBytes,
  sign as signJwt,
  timingSafeEqual,
  verify as verifyJwt,
} from "node:crypto";
import { AuthRateLimitService } from "./auth-rate-limit.service";
import { AuthService } from "./auth.service";
import { PrismaService } from "../prisma/prisma.service";

type ProviderKey = "google" | "facebook" | "apple";
type OAuthIdentity = {
  providerUserId: string;
  email?: string;
  emailVerified: boolean;
  displayName?: string;
};
type ProviderConfig = { provider: OAuthProvider; clientId: string; clientSecret?: string };
type JsonRecord = Record<string, unknown>;

const PROVIDERS: Record<ProviderKey, OAuthProvider> = {
  google: OAuthProvider.GOOGLE,
  facebook: OAuthProvider.FACEBOOK,
  apple: OAuthProvider.APPLE,
};
const GOOGLE_KEYS_URL = "https://www.googleapis.com/oauth2/v3/certs";
const APPLE_KEYS_URL = "https://appleid.apple.com/auth/keys";

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function base64Url(value: Buffer | string) {
  return Buffer.from(value).toString("base64url");
}

function readString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function readJson(value: string) {
  try {
    return JSON.parse(value) as JsonRecord;
  } catch {
    throw new UnauthorizedException("Unable to complete social sign-in. Please try again.");
  }
}

function isVerified(value: unknown) {
  return value === true || value === "true";
}

@Injectable()
export class OAuthService {
  private cachedJwks = new Map<string, { keys: JsonRecord[]; expiresAt: number }>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly auth: AuthService,
    private readonly rateLimits: AuthRateLimitService,
  ) {}

  supports(provider: string): provider is ProviderKey {
    return Object.prototype.hasOwnProperty.call(PROVIDERS, provider);
  }

  async start(providerName: string, platformName: string, ip: string, handoffChallenge?: string) {
    if (!this.supports(providerName)) throw new BadRequestException("This sign-in provider is not supported.");
    if (platformName !== "web" && platformName !== "mobile") throw new BadRequestException("Choose a supported sign-in platform.");
    const platform = platformName === "web" ? OAuthPlatform.WEB : OAuthPlatform.MOBILE;
    if (platform === OAuthPlatform.MOBILE) this.mobileCallbackUrl();
    else {
      this.webReturnUrl(true);
      this.webReturnUrl(false);
    }
    if (platform === OAuthPlatform.MOBILE && !/^[a-f0-9]{64}$/i.test(handoffChallenge ?? "")) {
      throw new BadRequestException("Could not start secure mobile sign-in.");
    }

    this.rateLimits.consume({ scope: "oauth-start", ip, ipLimit: 24, windowMs: 15 * 60 * 1000 });
    const provider = providerName as ProviderKey;
    const config = this.providerConfig(provider);
    const callbackUri = this.apiCallbackUrl(provider);
    const state = randomBytes(32).toString("base64url");
    const nonce = provider === "apple" ? randomBytes(32).toString("base64url") : null;
    const verifier = provider === "google" ? randomBytes(32).toString("base64url") : null;
    const codeChallenge = verifier ? base64Url(createHash("sha256").update(verifier).digest()) : null;

    await this.prisma.oAuthTransaction.create({
      data: {
        stateHash: sha256(state),
        provider: config.provider,
        platform,
        redirectUri: callbackUri,
        codeChallenge,
        nonce,
        handoffChallenge: platform === OAuthPlatform.MOBILE ? handoffChallenge!.toLowerCase() : null,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    const authorizationUrl = this.authorizationUrl(provider, config, callbackUri, state, codeChallenge, nonce);
    return {
      authorizationUrl,
      verifierCookie: verifier
        ? {
            name: this.verifierCookieName(state),
            value: verifier,
            path: new URL(callbackUri).pathname,
          }
        : undefined,
    };
  }

  async callback(providerName: string, query: JsonRecord, cookieHeader: string | undefined, ip: string) {
    if (!this.supports(providerName)) throw new BadRequestException("This sign-in provider is not supported.");
    this.rateLimits.consume({ scope: "oauth-callback", ip, ipLimit: 80, windowMs: 15 * 60 * 1000 });

    const state = readString(query.state);
    if (!state || state.length > 256) throw new UnauthorizedException("Unable to complete social sign-in. Please try again.");
    const provider = providerName as ProviderKey;
    const transaction = await this.prisma.oAuthTransaction.findUnique({ where: { stateHash: sha256(state) } });
    if (
      !transaction || transaction.provider !== PROVIDERS[provider] || transaction.consumedAt ||
      transaction.expiresAt <= new Date()
    ) {
      throw new UnauthorizedException("Unable to complete social sign-in. Please try again.");
    }

    if (transaction.platform === OAuthPlatform.MOBILE) this.mobileCallbackUrl();
    else {
      this.webReturnUrl(true);
      this.webReturnUrl(false);
    }
    const callbackUrl = this.returnUrl(transaction.platform, "oauth_failed");
    const cookieName = transaction.codeChallenge ? this.verifierCookieName(state) : undefined;
    const verifierCookiePath = new URL(transaction.redirectUri).pathname;
    const verifier = cookieName ? this.cookieValue(cookieHeader, cookieName) : undefined;
    if (transaction.codeChallenge && (!verifier || !this.sameHash(transaction.codeChallenge, base64Url(createHash("sha256").update(verifier).digest())))) {
      await this.consumeTransaction(transaction.id);
      return { platform: transaction.platform, redirectUrl: callbackUrl, clearVerifierCookie: cookieName, verifierCookiePath };
    }

    if (readString(query.error)) {
      await this.consumeTransaction(transaction.id);
      return { platform: transaction.platform, redirectUrl: callbackUrl, clearVerifierCookie: cookieName, verifierCookiePath };
    }
    const code = readString(query.code);
    if (!code || code.length > 2048) {
      await this.consumeTransaction(transaction.id);
      return { platform: transaction.platform, redirectUrl: callbackUrl, clearVerifierCookie: cookieName, verifierCookiePath };
    }

    let identity: OAuthIdentity;
    try {
      identity = await this.exchangeAndVerify(provider, code, transaction.redirectUri, verifier, transaction.nonce ?? undefined);
    } catch {
      await this.consumeTransaction(transaction.id);
      return { platform: transaction.platform, redirectUrl: callbackUrl, clearVerifierCookie: cookieName, verifierCookiePath };
    }

    this.rateLimits.consume({
      scope: "oauth-account",
      ip,
      identifier: identity.email ?? `${provider}:${identity.providerUserId}`,
      ipLimit: 100,
      accountLimit: 20,
      windowMs: 15 * 60 * 1000,
    });

    if (!(await this.consumeTransaction(transaction.id))) {
      return { platform: transaction.platform, redirectUrl: callbackUrl, clearVerifierCookie: cookieName, verifierCookiePath };
    }

    let user;
    try {
      user = await this.auth.resolveOAuthUser({ provider: PROVIDERS[provider], ...identity });
    } catch {
      return { platform: transaction.platform, redirectUrl: callbackUrl, clearVerifierCookie: cookieName, verifierCookiePath };
    }

    if (transaction.platform === OAuthPlatform.WEB) {
      const token = await this.auth.createSession(user.id);
      return {
        platform: transaction.platform,
        redirectUrl: this.webReturnUrl(true),
        clearVerifierCookie: cookieName,
        verifierCookiePath,
        token,
      };
    }

    const handoff = randomBytes(32).toString("base64url");
    const updated = await this.prisma.oAuthTransaction.updateMany({
      where: { id: transaction.id, consumedAt: { not: null }, handoffHash: null },
      data: {
        userId: user.id,
        handoffHash: sha256(handoff),
        handoffExpiresAt: new Date(Date.now() + 2 * 60 * 1000),
      },
    });
    if (updated.count !== 1) return { platform: transaction.platform, redirectUrl: callbackUrl, clearVerifierCookie: cookieName, verifierCookiePath };
    const redirectUrl = new URL(this.mobileCallbackUrl());
    redirectUrl.searchParams.set("handoff", handoff);
    return {
      platform: transaction.platform,
      redirectUrl: redirectUrl.toString(),
      clearVerifierCookie: cookieName,
      verifierCookiePath,
    };
  }

  async completeMobile(input: { handoff?: unknown; verifier?: unknown }, ip: string) {
    this.rateLimits.consume({ scope: "oauth-mobile-complete", ip, ipLimit: 40, windowMs: 15 * 60 * 1000 });
    const handoff = readString(input.handoff);
    const verifier = readString(input.verifier);
    if (!handoff || handoff.length > 256 || !verifier || !/^[a-f0-9]{64}$/i.test(verifier)) {
      throw new UnauthorizedException("Unable to complete social sign-in. Please try again.");
    }

    const handoffHash = sha256(handoff);
    const transaction = await this.prisma.oAuthTransaction.findUnique({
      where: { handoffHash },
      include: { user: { select: { id: true, email: true, displayName: true, status: true } } },
    });
    if (
      !transaction || transaction.platform !== OAuthPlatform.MOBILE || transaction.handoffConsumedAt ||
      !transaction.handoffExpiresAt || transaction.handoffExpiresAt <= new Date() || !transaction.handoffChallenge ||
      !this.sameHash(transaction.handoffChallenge, sha256(verifier)) || !transaction.user || transaction.user.status === "SUSPENDED"
    ) {
      throw new UnauthorizedException("Unable to complete social sign-in. Please try again.");
    }

    this.rateLimits.consume({
      scope: "oauth-account",
      ip,
      identifier: transaction.user.email,
      ipLimit: 100,
      accountLimit: 20,
      windowMs: 15 * 60 * 1000,
    });

    const consumed = await this.prisma.oAuthTransaction.updateMany({
      where: { id: transaction.id, handoffConsumedAt: null, handoffExpiresAt: { gt: new Date() } },
      data: { handoffConsumedAt: new Date() },
    });
    if (consumed.count !== 1) throw new UnauthorizedException("Unable to complete social sign-in. Please try again.");

    const token = await this.auth.createSession(transaction.user.id);
    return { user: transaction.user, token };
  }

  private returnUrl(platform: OAuthPlatform, result: "oauth_failed") {
    if (platform === OAuthPlatform.WEB) return this.webReturnUrl(false);
    const callback = new URL(this.mobileCallbackUrl());
    callback.searchParams.set("error", result);
    return callback.toString();
  }

  private async consumeTransaction(id: string) {
    const result = await this.prisma.oAuthTransaction.updateMany({
      where: { id, consumedAt: null, expiresAt: { gt: new Date() } },
      data: { consumedAt: new Date() },
    });
    return result.count === 1;
  }

  private providerConfig(provider: ProviderKey): ProviderConfig {
    const required = (...values: Array<string | undefined>) => values.every((value) => value?.trim());
    if (provider === "google") {
      if (!required(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET)) throw new ServiceUnavailableException("Google sign-in is not configured on the API yet.");
      return { provider: OAuthProvider.GOOGLE, clientId: process.env.GOOGLE_CLIENT_ID!.trim(), clientSecret: process.env.GOOGLE_CLIENT_SECRET!.trim() };
    }
    if (provider === "facebook") {
      if (!required(process.env.FACEBOOK_APP_ID, process.env.FACEBOOK_APP_SECRET)) throw new ServiceUnavailableException("Facebook sign-in is not configured on the API yet.");
      return { provider: OAuthProvider.FACEBOOK, clientId: process.env.FACEBOOK_APP_ID!.trim(), clientSecret: process.env.FACEBOOK_APP_SECRET!.trim() };
    }
    if (!required(process.env.APPLE_SERVICE_ID, process.env.APPLE_TEAM_ID, process.env.APPLE_KEY_ID, process.env.APPLE_PRIVATE_KEY)) {
      throw new ServiceUnavailableException("Apple sign-in is not configured on the API yet.");
    }
    return { provider: OAuthProvider.APPLE, clientId: process.env.APPLE_SERVICE_ID!.trim() };
  }

  private authorizationUrl(provider: ProviderKey, config: ProviderConfig, redirectUri: string, state: string, challenge: string | null, nonce: string | null) {
    const endpoints: Record<ProviderKey, string> = {
      google: "https://accounts.google.com/o/oauth2/v2/auth",
      facebook: "https://www.facebook.com/dialog/oauth",
      apple: "https://appleid.apple.com/auth/authorize",
    };
    const url = new URL(endpoints[provider]);
    url.searchParams.set("client_id", config.clientId);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("state", state);
    if (provider === "google") url.searchParams.set("scope", "openid email profile");
    if (provider === "facebook") url.searchParams.set("scope", "email,public_profile");
    if (provider === "apple") {
      url.searchParams.set("scope", "name email");
      url.searchParams.set("response_mode", "query");
      if (nonce) url.searchParams.set("nonce", nonce);
    }
    if (challenge) {
      url.searchParams.set("code_challenge", challenge);
      url.searchParams.set("code_challenge_method", "S256");
    }
    return url.toString();
  }

  private async exchangeAndVerify(provider: ProviderKey, code: string, redirectUri: string, verifier?: string, nonce?: string): Promise<OAuthIdentity> {
    if (provider === "google") return this.googleIdentity(await this.exchangeGoogle(code, redirectUri, verifier));
    if (provider === "facebook") return this.facebookIdentity(await this.exchangeFacebook(code, redirectUri));
    return this.appleIdentity(await this.exchangeApple(code, redirectUri), nonce);
  }

  private async exchangeGoogle(code: string, redirectUri: string, verifier?: string) {
    const config = this.providerConfig("google");
    const body = new URLSearchParams({
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret!,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
      ...(verifier ? { code_verifier: verifier } : {}),
    });
    return this.postJson("https://oauth2.googleapis.com/token", body);
  }

  private async exchangeFacebook(code: string, redirectUri: string) {
    const config = this.providerConfig("facebook");
    const url = new URL("https://graph.facebook.com/oauth/access_token");
    url.search = new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret!,
      redirect_uri: redirectUri,
      code,
    }).toString();
    return this.getJson(url);
  }

  private async exchangeApple(code: string, redirectUri: string) {
    const config = this.providerConfig("apple");
    const body = new URLSearchParams({
      client_id: config.clientId,
      client_secret: await this.appleClientSecret(config.clientId),
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    });
    return this.postJson("https://appleid.apple.com/auth/token", body);
  }

  private async googleIdentity(tokenResponse: JsonRecord): Promise<OAuthIdentity> {
    const idToken = readString(tokenResponse.id_token);
    if (!idToken) throw new UnauthorizedException();
    const config = this.providerConfig("google");
    const claims = await this.verifyJwt(idToken, GOOGLE_KEYS_URL, ["accounts.google.com", "https://accounts.google.com"], config.clientId);
    const providerUserId = readString(claims.sub);
    const email = readString(claims.email);
    if (!providerUserId) throw new UnauthorizedException();
    return { providerUserId, email, emailVerified: isVerified(claims.email_verified), displayName: readString(claims.name) };
  }

  private async facebookIdentity(tokenResponse: JsonRecord): Promise<OAuthIdentity> {
    const accessToken = readString(tokenResponse.access_token);
    if (!accessToken) throw new UnauthorizedException();
    const config = this.providerConfig("facebook");
    const debugUrl = new URL("https://graph.facebook.com/debug_token");
    debugUrl.search = new URLSearchParams({
      input_token: accessToken,
      access_token: `${config.clientId}|${config.clientSecret}`,
    }).toString();
    const debugResponse = await this.getJson(debugUrl);
    const data = debugResponse.data as JsonRecord | undefined;
    const providerUserId = readString(data?.user_id);
    if (data?.is_valid !== true || readString(data.app_id) !== config.clientId || !providerUserId) throw new UnauthorizedException();

    const profileResponse = await this.getJson(new URL("https://graph.facebook.com/me?fields=id,name,email"), accessToken);
    const profileId = readString(profileResponse.id);
    if (!profileId || profileId !== providerUserId) throw new UnauthorizedException();
    const email = readString(profileResponse.email);
    return { providerUserId, email, emailVerified: Boolean(email), displayName: readString(profileResponse.name) };
  }

  private async appleIdentity(tokenResponse: JsonRecord, nonce?: string): Promise<OAuthIdentity> {
    const idToken = readString(tokenResponse.id_token);
    if (!idToken || !nonce) throw new UnauthorizedException();
    const config = this.providerConfig("apple");
    const claims = await this.verifyJwt(idToken, APPLE_KEYS_URL, ["https://appleid.apple.com"], config.clientId, nonce);
    const providerUserId = readString(claims.sub);
    const email = readString(claims.email);
    if (!providerUserId) throw new UnauthorizedException();
    return { providerUserId, email, emailVerified: isVerified(claims.email_verified) };
  }

  private async verifyJwt(token: string, keysUrl: string, issuers: string[], audience: string, expectedNonce?: string) {
    const parts = token.split(".");
    if (parts.length !== 3) throw new UnauthorizedException();
    const header = readJson(Buffer.from(parts[0], "base64url").toString("utf8"));
    const claims = readJson(Buffer.from(parts[1], "base64url").toString("utf8"));
    if (header.alg !== "RS256" || typeof header.kid !== "string") throw new UnauthorizedException();
    const jwk = await this.findJwk(keysUrl, header.kid);
    const publicKey = createPublicKey({ key: jwk, format: "jwk" });
    const signature = Buffer.from(parts[2], "base64url");
    const signedData = Buffer.from(`${parts[0]}.${parts[1]}`);
    if (!verifyJwt("RSA-SHA256", signedData, publicKey, signature)) throw new UnauthorizedException();

    const now = Math.floor(Date.now() / 1000);
    const exp = typeof claims.exp === "number" ? claims.exp : 0;
    const aud = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
    const authorizedParty = readString(claims.azp);
    if (
      !issuers.includes(String(claims.iss)) || !aud.includes(audience) || exp <= now ||
      (typeof claims.nbf === "number" && claims.nbf > now) || !readString(claims.sub) ||
      (aud.length > 1 && authorizedParty !== audience) ||
      (expectedNonce !== undefined && claims.nonce !== expectedNonce)
    ) {
      throw new UnauthorizedException();
    }
    return claims;
  }

  private async findJwk(url: string, kid: string) {
    const cached = this.cachedJwks.get(url);
    if (cached && cached.expiresAt > Date.now()) {
      const key = cached.keys.find((candidate) => candidate.kid === kid && candidate.kty === "RSA");
      if (key) return key;
    }

    const response = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    if (!response.ok) throw new UnauthorizedException();
    const payload = await response.json() as { keys?: JsonRecord[] };
    if (!Array.isArray(payload.keys)) throw new UnauthorizedException();
    this.cachedJwks.set(url, { keys: payload.keys, expiresAt: Date.now() + 60 * 60 * 1000 });
    const key = payload.keys.find((candidate) => candidate.kid === kid && candidate.kty === "RSA");
    if (!key) throw new UnauthorizedException();
    return key;
  }

  private async appleClientSecret(serviceId: string) {
    const privateKeyPem = process.env.APPLE_PRIVATE_KEY?.replace(/\\n/g, "\n").trim();
    const teamId = process.env.APPLE_TEAM_ID?.trim();
    const keyId = process.env.APPLE_KEY_ID?.trim();
    if (!privateKeyPem || !teamId || !keyId) throw new ServiceUnavailableException("Apple sign-in is not configured on the API yet.");
    const now = Math.floor(Date.now() / 1000);
    const header = base64Url(Buffer.from(JSON.stringify({ alg: "ES256", kid: keyId, typ: "JWT" })));
    const payload = base64Url(Buffer.from(JSON.stringify({ iss: teamId, iat: now, exp: now + 5 * 60, aud: "https://appleid.apple.com", sub: serviceId })));
    const unsigned = `${header}.${payload}`;
    const signature = signJwt("sha256", Buffer.from(unsigned), { key: createPrivateKey(privateKeyPem), dsaEncoding: "ieee-p1363" });
    return `${unsigned}.${base64Url(signature)}`;
  }

  private async getJson(url: URL, bearerToken?: string): Promise<JsonRecord> {
    const response = await fetch(url, {
      headers: { Accept: "application/json", ...(bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {}) },
      signal: AbortSignal.timeout(10_000),
    });
    return this.parseProviderResponse(response);
  }

  private async postJson(url: string, body: URLSearchParams): Promise<JsonRecord> {
    const response = await fetch(url, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" },
      body,
      signal: AbortSignal.timeout(10_000),
    });
    return this.parseProviderResponse(response);
  }

  private async parseProviderResponse(response: Response): Promise<JsonRecord> {
    let payload: JsonRecord;
    try {
      payload = await response.json() as JsonRecord;
    } catch {
      throw new UnauthorizedException();
    }
    if (!response.ok) throw new UnauthorizedException();
    return payload;
  }

  private apiCallbackUrl(provider: ProviderKey) {
    const base = this.validateHttpBase(process.env.OAUTH_API_BASE_URL, "OAUTH_API_BASE_URL");
    return new URL(`/auth/oauth/${provider}/callback`, base).toString();
  }

  private webReturnUrl(success: boolean) {
    const value = success ? process.env.WEB_OAUTH_SUCCESS_URL : process.env.WEB_OAUTH_FAILURE_URL;
    const label = success ? "WEB_OAUTH_SUCCESS_URL" : "WEB_OAUTH_FAILURE_URL";
    const url = this.validateHttpBase(value, label, true);
    return url.toString();
  }

  private mobileCallbackUrl() {
    const value = process.env.MOBILE_OAUTH_CALLBACK_URL;
    if (!value) throw new ServiceUnavailableException("Mobile social sign-in is not configured on the API yet.");
    let url: URL;
    try {
      url = new URL(value);
    } catch {
      throw new ServiceUnavailableException("Mobile social sign-in callback URL is not valid.");
    }
    if (url.protocol !== "flatmate:" || url.hostname !== "auth" || url.pathname !== "/callback" || url.search || url.hash || url.username || url.password) {
      throw new ServiceUnavailableException("Mobile social sign-in callback URL must match flatmate://auth/callback.");
    }
    return url.toString();
  }

  private validateHttpBase(value: string | undefined, label: string, allowPath = false) {
    if (!value) throw new ServiceUnavailableException(`${label} is not configured on the API yet.`);
    let url: URL;
    try {
      url = new URL(value);
    } catch {
      throw new ServiceUnavailableException(`${label} is not a valid URL.`);
    }
    const loopback = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
    const allowedProtocol = url.protocol === "https:" || (process.env.NODE_ENV !== "production" && url.protocol === "http:" && loopback);
    if (
      !allowedProtocol || url.username || url.password || url.hash || (!allowPath && (url.pathname !== "/" || url.search)) ||
      (allowPath && url.pathname === "/")
    ) {
      throw new ServiceUnavailableException(`${label} must use HTTPS, or localhost HTTP during development, with a fixed path.`);
    }
    return url;
  }

  private verifierCookieName(state: string) {
    return `flatmate_oauth_${sha256(state)}`;
  }

  private cookieValue(cookieHeader: string | undefined, name: string) {
    return cookieHeader
      ?.split(";")
      .map((item) => item.trim())
      .find((item) => item.startsWith(`${name}=`))
      ?.slice(name.length + 1);
  }

  private sameHash(left: string, right: string) {
    const leftBuffer = Buffer.from(left);
    const rightBuffer = Buffer.from(right);
    return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
  }
}
