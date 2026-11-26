import { Body, Controller, Get, Post, Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";
import { AuthService } from "./auth.service";

const COOKIE = "flatmate_session";
const cookieOptions = `HttpOnly; Path=/; SameSite=Lax; Max-Age=${14 * 24 * 60 * 60}`;

function bearerToken(authorization?: string) {
  const [scheme, token] = authorization?.trim().split(/\s+/, 2) ?? [];
  return scheme?.toLowerCase() === "bearer" ? token : undefined;
}

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  private setSessionCookie(res: Response, token: string) {
    const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
    res.setHeader("Set-Cookie", `${COOKIE}=${encodeURIComponent(token)}; ${cookieOptions}${secure}`);
  }

  @Post("register")
  async register(@Body() body: Record<string, unknown>, @Res({ passthrough: true }) res: Response) {
    const result = await this.auth.register(body);
    this.setSessionCookie(res, result.token);
    return { user: result.user };
  }

  @Post("login")
  async login(@Body() body: Record<string, unknown>, @Res({ passthrough: true }) res: Response) {
    const result = await this.auth.login(body);
    this.setSessionCookie(res, result.token);
    return { user: result.user };
  }

  @Post("mobile/login")
  async mobileLogin(@Body() body: Record<string, unknown>) {
    return this.auth.login(body);
  }

  @Get("mobile/me")
  async mobileMe(@Req() req: Request) {
    return { user: await this.auth.getUserFromToken(bearerToken(req.headers.authorization)) };
  }

  @Post("mobile/logout")
  async mobileLogout(@Req() req: Request) {
    await this.auth.logoutToken(bearerToken(req.headers.authorization));
    return { success: true };
  }

  @Post("admin/login")
  async adminLogin(@Body() body: Record<string, unknown>, @Res({ passthrough: true }) res: Response) {
    const result = await this.auth.login(body, true);
    this.setSessionCookie(res, result.token);
    return { user: result.user };
  }

  @Post("logout")
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    await this.auth.logout(req.headers.cookie);
    res.setHeader("Set-Cookie", `${COOKIE}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`);
    return { success: true };
  }

  @Get("me")
  async me(@Req() req: Request) {
    return { user: await this.auth.getUserFromCookie(req.headers.cookie) };
  }
}
