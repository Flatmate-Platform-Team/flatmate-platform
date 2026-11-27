import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query, Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";
import { AuthRateLimitService } from "./auth-rate-limit.service";
import { AuthService } from "./auth.service";
import { OAuthService } from "./oauth.service";

const COOKIE = "flatmate_session";
const cookieOptions = `HttpOnly; Path=/; SameSite=Lax; Max-Age=${14 * 24 * 60 * 60}`;

function bearerToken(authorization?: string) {
  const [scheme, token] = authorization?.trim().split(/\s+/, 2) ?? [];
  return scheme?.toLowerCase() === "bearer" ? token : undefined;
}

@Controller("auth")
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly rateLimits: AuthRateLimitService,
    private readonly oauth: OAuthService,
  ) {}

  private setSessionCookie(res: Response, token: string) {
    const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
    res.setHeader("Set-Cookie", `${COOKIE}=${encodeURIComponent(token)}; ${cookieOptions}${secure}`);
  }

  @Post("register")
  @HttpCode(HttpStatus.ACCEPTED)
  async register(@Body() body: Record<string, unknown>, @Req() req: Request) {
    this.rateLimits.consume({ scope: "registration", ip: req.ip ?? "unknown", identifier: body.email as string, ipLimit: 20, accountLimit: 6, windowMs: 60 * 60 * 1000 });
    await this.auth.register(body);
    return { message: "If this address is eligible, the account is ready. Try signing in to continue." };
  }

  @Post("mobile/register")
  @HttpCode(HttpStatus.ACCEPTED)
  async mobileRegister(@Body() body: Record<string, unknown>, @Req() req: Request) {
    this.rateLimits.consume({ scope: "registration", ip: req.ip ?? "unknown", identifier: body.email as string, ipLimit: 20, accountLimit: 6, windowMs: 60 * 60 * 1000 });
    await this.auth.register(body);
    return { message: "If this address is eligible, the account is ready. Try signing in to continue." };
  }

  @Post("login")
  async login(@Body() body: Record<string, unknown>, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    this.rateLimits.consume({ scope: "password-login", ip: req.ip ?? "unknown", identifier: body.email as string, ipLimit: 60, accountLimit: 12 });
    const result = await this.auth.login(body);
    this.setSessionCookie(res, result.token);
    return { user: result.user };
  }

  @Post("mobile/login")
  async mobileLogin(@Body() body: Record<string, unknown>, @Req() req: Request) {
    this.rateLimits.consume({ scope: "password-login", ip: req.ip ?? "unknown", identifier: body.email as string, ipLimit: 60, accountLimit: 12 });
    return this.auth.login(body);
  }

  @Get("oauth/:provider/start")
  async oauthStart(
    @Param("provider") provider: string,
    @Query("platform") platform: string,
    @Query("handoff_challenge") handoffChallenge: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const result = await this.oauth.start(provider, platform, req.ip ?? "unknown", handoffChallenge);
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Referrer-Policy", "no-referrer");
    if (result.verifierCookie) {
      const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
      res.setHeader("Set-Cookie", `${result.verifierCookie.name}=${result.verifierCookie.value}; HttpOnly; Path=${result.verifierCookie.path}; SameSite=Lax; Max-Age=600${secure}`);
    }
    return res.redirect(302, result.authorizationUrl);
  }

  @Get("oauth/:provider/callback")
  async oauthCallback(
    @Param("provider") provider: string,
    @Query() query: Record<string, unknown>,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const result = await this.oauth.callback(provider, query, req.headers.cookie, req.ip ?? "unknown");
    const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
    const cookies: string[] = [];
    if (result.clearVerifierCookie) {
      cookies.push(`${result.clearVerifierCookie}=; HttpOnly; Path=${result.verifierCookiePath}; SameSite=Lax; Max-Age=0${secure}`);
    }
    if (result.token) {
      cookies.push(`${COOKIE}=${encodeURIComponent(result.token)}; ${cookieOptions}${secure}`);
    }
    if (cookies.length) res.setHeader("Set-Cookie", cookies);
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Referrer-Policy", "no-referrer");
    return res.redirect(303, result.redirectUrl);
  }

  @Post("oauth/mobile/complete")
  async completeMobileOAuth(@Body() body: Record<string, unknown>, @Req() req: Request) {
    return this.oauth.completeMobile({ handoff: body.handoff, verifier: body.verifier }, req.ip ?? "unknown");
  }

  @Get("mobile/me")
  async mobileMe(@Req() req: Request) {
    return { user: await this.auth.getUserFromToken(bearerToken(req.headers.authorization)) };
  }

  @Post("mobile/logout")
  async mobileLogout(@Req() req: Request) {
    this.rateLimits.consume({ scope: "logout", ip: req.ip ?? "unknown", ipLimit: 120 });
    await this.auth.logoutToken(bearerToken(req.headers.authorization));
    return { success: true };
  }

  @Post("admin/login")
  async adminLogin(@Body() body: Record<string, unknown>, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    this.rateLimits.consume({ scope: "password-login", ip: req.ip ?? "unknown", identifier: body.email as string, ipLimit: 60, accountLimit: 12 });
    const result = await this.auth.login(body, true);
    this.setSessionCookie(res, result.token);
    return { user: result.user };
  }

  @Post("logout")
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    this.rateLimits.consume({ scope: "logout", ip: req.ip ?? "unknown", ipLimit: 120 });
    await this.auth.logout(req.headers.cookie);
    res.setHeader("Set-Cookie", `${COOKIE}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`);
    return { success: true };
  }

  @Get("me")
  async me(@Req() req: Request) {
    return { user: await this.auth.getUserFromCookie(req.headers.cookie) };
  }
}
