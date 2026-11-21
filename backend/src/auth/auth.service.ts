import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
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

async function verifyPassword(password: string, stored: string) {
  const [algorithm, n, r, p, saltHex, keyHex] = stored.split("$");
  if (algorithm !== "scrypt" || !n || !r || !p || !saltHex || !keyHex) return false;
  const expected = Buffer.from(keyHex, "hex");
  const actual = await deriveKey(password, Buffer.from(saltHex, "hex"), expected.length, {
    N: Number(n), r: Number(r), p: Number(p),
  });
  return actual.length === expected.length && timingSafeEqual(actual, expected);
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
    if (await this.prisma.user.findUnique({ where: { email }, select: { id: true } })) throw new ConflictException("An account with this email already exists.");

    const user = await this.prisma.user.create({
      data: { email, displayName, passwordHash: await hashPassword(password), profile: { create: {} } },
      select: { id: true, email: true, displayName: true },
    });
    const token = await this.createSession(user.id);
    return { user, token };
  }

  async login(input: Record<string, unknown>) {
    const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
    const password = typeof input.password === "string" ? input.password : "";
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user?.passwordHash || !(await verifyPassword(password, user.passwordHash))) throw new UnauthorizedException("Email or password is incorrect.");
    if (user.status === "SUSPENDED") throw new UnauthorizedException("This account is unavailable.");
    const token = await this.createSession(user.id);
    return { user: { id: user.id, email: user.email, displayName: user.displayName }, token };
  }

  async createSession(userId: string) {
    const token = randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
    await this.prisma.session.create({ data: { userId, tokenHash: hashToken(token), expiresAt } });
    return token;
  }

  async getUserFromCookie(cookieHeader?: string) {
    const token = cookieHeader?.split(";").map((item) => item.trim()).find((item) => item.startsWith("flatmate_session="))?.slice("flatmate_session=".length);
    if (!token) throw new UnauthorizedException("Please sign in to continue.");
    const session = await this.prisma.session.findUnique({
      where: { tokenHash: hashToken(decodeURIComponent(token)) },
      include: { user: { select: { id: true, email: true, displayName: true, status: true, role: true } } },
    });
    if (!session || session.expiresAt <= new Date() || session.user.status === "SUSPENDED") {
      if (session) await this.prisma.session.delete({ where: { id: session.id } });
      throw new UnauthorizedException("Your session has expired. Please sign in again.");
    }
    return session.user;
  }

  async logout(cookieHeader?: string) {
    const token = cookieHeader?.split(";").map((item) => item.trim()).find((item) => item.startsWith("flatmate_session="))?.slice("flatmate_session=".length);
    if (token) await this.prisma.session.deleteMany({ where: { tokenHash: hashToken(decodeURIComponent(token)) } });
  }
}
