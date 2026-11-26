import { BadRequestException, Controller, Get, Post, Query, Req, Param } from "@nestjs/common";
import type { Request } from "express";
import { Prisma } from "@prisma/client";
import { AuthService } from "../auth/auth.service";
import { PrismaService } from "../prisma/prisma.service";

@Controller("flatmates")
export class DiscoveryController {
  constructor(private readonly auth: AuthService, private readonly prisma: PrismaService) {}

  @Get()
  async discover(@Req() req: Request, @Query("city") cityQuery?: string) {
    const currentUser = await this.auth.getUserFromRequest(req.headers.cookie, req.headers.authorization);
    const city = typeof cityQuery === "string" ? cityQuery.trim().slice(0, 80) : "";
    const passes = await this.prisma.pass.findMany({
      where: { fromUserId: currentUser.id },
      select: { toUserId: true },
    });
    const where: Prisma.UserWhereInput = {
      id: { notIn: [currentUser.id, ...passes.map((pass) => pass.toUserId)] },
      status: { not: "SUSPENDED" },
      profile: { isNot: null },
    };
    if (city) where.profile = { is: { city: { contains: city, mode: "insensitive" } } };

    const users = await this.prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 60,
      select: {
        id: true,
        displayName: true,
        profile: { select: { bio: true, city: true, budgetMin: true, budgetMax: true, preferences: true } },
      },
    });
    const sentLikes = await this.prisma.like.findMany({
      where: { fromUserId: currentUser.id, toUserId: { in: users.map((user) => user.id) } },
      select: { toUserId: true },
    });
    const likedIds = new Set(sentLikes.map((like) => like.toUserId));
    return { people: users.map((user) => ({ ...user, liked: likedIds.has(user.id) })) };
  }

  @Post(":targetUserId/like")
  async like(@Req() req: Request, @Param("targetUserId") targetUserId: string) {
    const currentUser = await this.auth.getUserFromRequest(req.headers.cookie, req.headers.authorization);
    if (!targetUserId || targetUserId === currentUser.id) throw new BadRequestException("You can’t like your own profile.");

    const target = await this.prisma.user.findFirst({
      where: { id: targetUserId, status: { not: "SUSPENDED" } },
      select: { id: true },
    });
    if (!target) throw new BadRequestException("This profile is no longer available.");

    await this.prisma.like.upsert({
      where: { fromUserId_toUserId: { fromUserId: currentUser.id, toUserId: target.id } },
      update: {},
      create: { fromUserId: currentUser.id, toUserId: target.id },
    });

    const reciprocal = await this.prisma.like.findUnique({
      where: { fromUserId_toUserId: { fromUserId: target.id, toUserId: currentUser.id } },
      select: { id: true },
    });
    if (!reciprocal) return { matched: false };

    const [firstUserId, secondUserId] = [currentUser.id, target.id].sort();
    const match = await this.prisma.match.upsert({
      where: { firstUserId_secondUserId: { firstUserId, secondUserId } },
      update: {},
      create: { firstUserId, secondUserId },
      select: { id: true },
    });
    return { matched: true, matchId: match.id };
  }

  @Post(":targetUserId/pass")
  async pass(@Req() req: Request, @Param("targetUserId") targetUserId: string) {
    const currentUser = await this.auth.getUserFromRequest(req.headers.cookie, req.headers.authorization);
    if (!targetUserId || targetUserId === currentUser.id) throw new BadRequestException("You can’t pass your own profile.");

    const target = await this.prisma.user.findFirst({
      where: { id: targetUserId, status: { not: "SUSPENDED" }, profile: { isNot: null } },
      select: { id: true },
    });
    if (!target) throw new BadRequestException("This profile is no longer available.");

    await this.prisma.pass.upsert({
      where: { fromUserId_toUserId: { fromUserId: currentUser.id, toUserId: target.id } },
      update: {},
      create: { fromUserId: currentUser.id, toUserId: target.id },
    });
    return { passed: true };
  }
}

@Controller("matches")
export class MatchesController {
  constructor(private readonly auth: AuthService, private readonly prisma: PrismaService) {}

  @Get()
  async list(@Req() req: Request) {
    const currentUser = await this.auth.getUserFromRequest(req.headers.cookie, req.headers.authorization);
    const matches = await this.prisma.match.findMany({
      where: { OR: [{ firstUserId: currentUser.id }, { secondUserId: currentUser.id }] },
      orderBy: { createdAt: "desc" },
      include: {
        firstUser: { select: { id: true, displayName: true, profile: { select: { bio: true, city: true, budgetMin: true, budgetMax: true } } } },
        secondUser: { select: { id: true, displayName: true, profile: { select: { bio: true, city: true, budgetMin: true, budgetMax: true } } } },
      },
    });
    return {
      matches: matches.map((match) => ({
        id: match.id,
        createdAt: match.createdAt,
        person: match.firstUserId === currentUser.id ? match.secondUser : match.firstUser,
      })),
    };
  }
}
