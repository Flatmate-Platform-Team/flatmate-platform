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
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      throw new BadRequestException("Provide profile fields as a JSON object.");
    }
    const fields = ["city", "bio", "budgetMin", "budgetMax"] as const;
    const hasField = (field: string) => Object.prototype.hasOwnProperty.call(body, field);
    if (!fields.some(hasField)) {
      throw new BadRequestException("Provide at least one profile field to update.");
    }

    const textField = (field: "city" | "bio", label: string, maximum: number) => {
      if (!hasField(field)) return undefined;
      const value = body[field];
      if (value === null || value === "") return null;
      if (typeof value !== "string") throw new BadRequestException(`${label} must be text.`);
      const normalized = value.trim();
      if (normalized.length > maximum) throw new BadRequestException(`${label} must be ${maximum} characters or fewer.`);
      return normalized || null;
    };
    const budgetField = (field: "budgetMin" | "budgetMax") => {
      if (!hasField(field)) return undefined;
      const value = body[field];
      if (value === null || value === "") return null;
      if (typeof value !== "number" && typeof value !== "string") {
        throw new BadRequestException("Enter a valid monthly budget.");
      }
      const amount = typeof value === "string" && value.trim() === "" ? null : Number(value);
      if (amount === null) return null;
      if (!Number.isInteger(amount) || amount < 0 || amount > 1000000) {
        throw new BadRequestException("Enter a valid monthly budget.");
      }
      return amount;
    };

    const city = textField("city", "City", 100);
    const bio = textField("bio", "Bio", 500);
    const budgetMin = budgetField("budgetMin");
    const budgetMax = budgetField("budgetMax");
    const existing = await this.prisma.profile.findUnique({ where: { userId: user.id } });
    const nextBudgetMin = budgetMin === undefined ? existing?.budgetMin ?? null : budgetMin;
    const nextBudgetMax = budgetMax === undefined ? existing?.budgetMax ?? null : budgetMax;
    if (nextBudgetMin !== null && nextBudgetMax !== null && nextBudgetMin > nextBudgetMax) {
      throw new BadRequestException("Minimum budget cannot exceed maximum budget.");
    }

    const update: {
      city?: string | null;
      bio?: string | null;
      budgetMin?: number | null;
      budgetMax?: number | null;
    } = {};
    if (city !== undefined) update.city = city;
    if (bio !== undefined) update.bio = bio;
    if (budgetMin !== undefined) update.budgetMin = budgetMin;
    if (budgetMax !== undefined) update.budgetMax = budgetMax;

    const updated = await this.prisma.profile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        city: city ?? null,
        bio: bio ?? null,
        budgetMin: budgetMin ?? null,
        budgetMax: budgetMax ?? null,
      },
      update,
    });
    return { profile: updated };
  }
}
