import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from "@nestjs/common";
import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

const SESSION_DAYS = 14;

function deriveKey(password: string, salt: Buffer, length: number, options: { N: number; r: number; p: number }) {
  return new Promise<Buffer>((resolve, reject) => {
    scryptCallback(password, salt, length, { ...options, maxmem: 64 * 1024 * 1024 }, (error, key) => error ? reject(error) : resolve(key as Buffer));
  });
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const derived = await deriveKey(password, salt, 64, { N: 32768, r: 8, p: 1 });
  return `scrypt$32768$8$1$${salt.toString("hex")}$${derived.toString("hex")}`;
}

const DUMMY_PASSWORD_HASH = hashPassword("flatmate-nonexistent-account-password");

async function verifyPassword(password: string, stored: string) {
  const [algorithm, n, r, p, saltHex, keyHex] = stored.split("$");
  if (algorithm !== "scrypt" || !n || !r || !p || !saltHex || !keyHex) return false;
  const expected = Buffer.from(keyHex, "hex");
  const actual = await deriveKey(password, Buffer.from(saltHex, "hex"), expected.length, {
    N: Number(n), r: Number(r), p: Number(p),
  });
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function cookieToken(cookieHeader?: string) {
  return cookieHeader
    ?.split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith("flatmate_session="))
    ?.slice("flatmate_session=".length);
}

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async register(input: Record<string, unknown>) {
    const displayName = typeof input.displayName === "string" ? input.displayName.trim() : "";
    const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
    const password = typeof input.password === "string" ? input.password : "";
    if (displayName.length < 2 || displayName.length > 80) throw new BadRequestException("Enter a name between 2 and 80 characters.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) throw new BadRequestException("Enter a valid email address.");
    if (password.length < 12 || password.length > 128) throw new BadRequestException("Password must be 12 to 128 characters.");
    const passwordHash = await hashPassword(password);
    if (await this.prisma.user.findUnique({ where: { email }, select: { id: true } })) return;

    try {
      await this.prisma.user.create({
        data: { email, displayName, passwordHash, profile: { create: {} } },
        select: { id: true },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return;
      throw error;
    }
  }

  async login(input: Record<string, unknown>, adminOnly = false) {
    const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
    const password = typeof input.password === "string" ? input.password : "";
    const user = await this.prisma.user.findUnique({ where: { email } });
    const passwordHash = user?.passwordHash ?? await DUMMY_PASSWORD_HASH;
    const passwordIsValid = await verifyPassword(password, passwordHash);
    if (!user?.passwordHash || !passwordIsValid || user.status === "SUSPENDED") {
      throw new UnauthorizedException("Email or password is incorrect.");
    }
    if (adminOnly && user.role !== "ADMIN") throw new UnauthorizedException("Email or password is incorrect.");
    const token = await this.createSession(user.id);
    return { user: { id: user.id, email: user.email, displayName: user.displayName }, token };
  }

  async resolveOAuthUser(input: {
    provider: "GOOGLE" | "FACEBOOK" | "APPLE";
    providerUserId: string;
    email?: string;
    emailVerified: boolean;
    displayName?: string;
  }) {
    const identity = await this.prisma.oAuthIdentity.findUnique({
      where: { provider_providerUserId: { provider: input.provider, providerUserId: input.providerUserId } },
      include: { user: { select: { id: true, email: true, displayName: true, status: true } } },
    });
    if (identity) {
      if (identity.user.status === "SUSPENDED") throw new UnauthorizedException("Unable to complete social sign-in. Try your existing sign-in method.");
      return identity.user;
    }

    const email = input.email?.trim().toLowerCase() ?? "";
    const displayName = input.displayName?.trim().slice(0, 80) || email.split("@")[0] || "Flatmate member";
    if (!input.emailVerified || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      throw new UnauthorizedException("Unable to complete social sign-in. Try another sign-in method.");
    }

    if (await this.prisma.user.findUnique({ where: { email }, select: { id: true } })) {
      throw new UnauthorizedException("Unable to complete social sign-in. Try your existing sign-in method.");
    }

    try {
      return await this.prisma.user.create({
        data: {
          email,
          displayName,
          status: "ACTIVE",
          profile: { create: {} },
          oauthIdentities: { create: { provider: input.provider, providerUserId: input.providerUserId } },
        },
        select: { id: true, email: true, displayName: true, status: true },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        const racedIdentity = await this.prisma.oAuthIdentity.findUnique({
          where: { provider_providerUserId: { provider: input.provider, providerUserId: input.providerUserId } },
          include: { user: { select: { id: true, email: true, displayName: true, status: true } } },
        });
        if (racedIdentity && racedIdentity.user.status !== "SUSPENDED") return racedIdentity.user;
        throw new UnauthorizedException("Unable to complete social sign-in. Try your existing sign-in method.");
      }
      throw error;
    }
  }

  async createSession(userId: string) {
    const token = randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
    await this.prisma.session.create({ data: { userId, tokenHash: hashToken(token), expiresAt } });
    return token;
  }

  async getUserFromCookie(cookieHeader?: string) {
    const encodedToken = cookieToken(cookieHeader);
    return this.getUserFromToken(encodedToken ? decodeURIComponent(encodedToken) : undefined);
  }

  async getUserFromRequest(cookieHeader?: string, authorizationHeader?: string) {
    if (!authorizationHeader) return this.getUserFromCookie(cookieHeader);
    const match = /^Bearer\s+(\S+)$/i.exec(authorizationHeader.trim());
    if (!match) throw new UnauthorizedException("Please sign in to continue.");
    return this.getUserFromToken(match[1]);
  }

  async getUserFromToken(token?: string) {
    if (!token) throw new UnauthorizedException("Please sign in to continue.");
    const session = await this.prisma.session.findUnique({
      where: { tokenHash: hashToken(token) },
      include: { user: { select: { id: true, email: true, displayName: true, status: true, role: true } } },
    });
    if (!session || session.expiresAt <= new Date() || session.user.status === "SUSPENDED") {
      if (session) await this.prisma.session.delete({ where: { id: session.id } });
      throw new UnauthorizedException("Your session has expired. Please sign in again.");
    }
    return session.user;
  }

  async logoutToken(token?: string) {
    if (token) await this.prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  }

  async logout(cookieHeader?: string) {
    const encodedToken = cookieToken(cookieHeader);
    await this.logoutToken(encodedToken ? decodeURIComponent(encodedToken) : undefined);
  }
}
