import { Controller, Delete, ForbiddenException, Get, NotFoundException, Param, Req } from "@nestjs/common";
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
        user: { select: { id: true, email: true, displayName: true, status: true, isTestAccount: true, createdAt: true } },
      },
    });
    return { profiles };
  }

  @Delete("test-accounts/:userId")
  async removeTestAccount(@Req() req: Request, @Param("userId") userId: string) {
    const currentUser = await this.auth.getUserFromCookie(req.headers.cookie);
    if (currentUser.role !== "ADMIN") throw new ForbiddenException("Admin access is required.");

    const target = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, isTestAccount: true },
    });
    if (!target) throw new NotFoundException("This account no longer exists.");
    if (!target.isTestAccount) throw new ForbiddenException("Only designated test accounts can be removed here.");

    await this.prisma.user.delete({ where: { id: target.id } });
    return { success: true };
  }
}
