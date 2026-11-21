import { Controller, ForbiddenException, Get, Req } from "@nestjs/common";
import type { Request } from "express";
import { AuthService } from "../auth/auth.service";
import { PrismaService } from "../prisma/prisma.service";

@Controller("admin")
export class AdminController {
  constructor(private readonly auth: AuthService, private readonly prisma: PrismaService) {}

  @Get("profiles")
  async profiles(@Req() req: Request) {
    const currentUser = await this.auth.getUserFromCookie(req.headers.cookie);
    if (currentUser.role !== "ADMIN") throw new ForbiddenException("Admin access is required.");

    const profiles = await this.prisma.profile.findMany({
      orderBy: { user: { createdAt: "desc" } },
      take: 200,
      include: {
        user: { select: { id: true, email: true, displayName: true, status: true, createdAt: true } },
      },
    });
    return { profiles };
  }
}
