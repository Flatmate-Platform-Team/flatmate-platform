import { Body, Controller, Get, Patch, Req, BadRequestException } from "@nestjs/common";
import type { Request } from "express";
import { AuthService } from "../auth/auth.service";
import { PrismaService } from "../prisma/prisma.service";

@Controller("profiles/me")
export class ProfilesController {
  constructor(private readonly auth: AuthService, private readonly prisma: PrismaService) {}

  @Get()
  async getProfile(@Req() req: Request) {
    const user = await this.auth.getUserFromCookie(req.headers.cookie);
    const profile = await this.prisma.profile.findUnique({ where: { userId: user.id } });
    return { user, profile };
  }

  @Patch()
  async updateProfile(@Req() req: Request, @Body() body: Record<string, unknown>) {
    const user = await this.auth.getUserFromCookie(req.headers.cookie);
    const city = body.city === undefined || body.city === "" ? null : body.city;
    const bio = body.bio === undefined || body.bio === "" ? null : body.bio;
    const budgetMin = body.budgetMin === undefined || body.budgetMin === "" ? null : Number(body.budgetMin);
    const budgetMax = body.budgetMax === undefined || body.budgetMax === "" ? null : Number(body.budgetMax);
    if (city !== null && (typeof city !== "string" || city.length > 100)) throw new BadRequestException("City must be 100 characters or fewer.");
    if (bio !== null && (typeof bio !== "string" || bio.length > 500)) throw new BadRequestException("Bio must be 500 characters or fewer.");
    for (const budget of [budgetMin, budgetMax]) if (budget !== null && (!Number.isInteger(budget) || budget < 0 || budget > 1000000)) throw new BadRequestException("Enter a valid monthly budget.");
    if (budgetMin !== null && budgetMax !== null && budgetMin > budgetMax) throw new BadRequestException("Minimum budget cannot exceed maximum budget.");

    const updated = await this.prisma.profile.upsert({
      where: { userId: user.id },
      create: { userId: user.id, city: city as string | null, bio: bio as string | null, budgetMin, budgetMax },
      update: { city: city as string | null, bio: bio as string | null, budgetMin, budgetMax },
    });
    return { profile: updated };
  }
}
