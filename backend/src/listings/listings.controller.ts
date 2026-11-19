import { BadRequestException, Body, Controller, Get, Post, Query, Req } from "@nestjs/common";
import type { Request } from "express";
import { Prisma } from "@prisma/client";
import { AuthService } from "../auth/auth.service";
import { PrismaService } from "../prisma/prisma.service";

@Controller("listings")
export class ListingsController {
  constructor(private readonly auth: AuthService, private readonly prisma: PrismaService) {}

  @Get()
  async browse(@Query() query: Record<string, string | string[] | undefined>) {
    const cityValue = query.city;
    const city = typeof cityValue === "string" ? cityValue.trim().slice(0, 80) : "";
    const where: Prisma.ListingWhereInput = { status: "ACTIVE" };
    if (city) where.city = { contains: city, mode: "insensitive" };
    const rentFilter: { gte?: number; lte?: number } = {};

    for (const [key, field] of [["minRent", "gte"], ["maxRent", "lte"]] as const) {
      const raw = query[key];
      if (typeof raw !== "string" || raw.trim() === "") continue;
      const amount = Number(raw);
      if (!Number.isInteger(amount) || amount < 0 || amount > 1000000) {
        throw new BadRequestException("Enter a valid rent range.");
      }
      rentFilter[field] = amount;
    }
    if (Object.keys(rentFilter).length > 0) where.monthlyRent = rentFilter;

    const listings = await this.prisma.listing.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 60,
      select: {
        id: true, title: true, description: true, city: true,
        neighborhood: true, monthlyRent: true, deposit: true,
        bedrooms: true, furnished: true, availableFrom: true,
        createdAt: true, owner: { select: { displayName: true } },
      },
    });
    return { listings };
  }

  @Post()
  async create(@Req() req: Request, @Body() body: Record<string, unknown>) {
    const owner = await this.auth.getUserFromCookie(req.headers.cookie);
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const description = typeof body.description === "string" ? body.description.trim() : "";
    const city = typeof body.city === "string" ? body.city.trim() : "";
    const neighborhood = typeof body.neighborhood === "string" ? body.neighborhood.trim() : "";
    const monthlyRent = Number(body.monthlyRent);
    const deposit = body.deposit === undefined || body.deposit === "" ? null : Number(body.deposit);
    const bedrooms = Number(body.bedrooms ?? 1);
    const availableFrom = typeof body.availableFrom === "string" ? new Date(body.availableFrom) : new Date("");

    if (title.length < 8 || title.length > 100) throw new BadRequestException("Title must be 8 to 100 characters.");
    if (description.length < 20 || description.length > 1600) throw new BadRequestException("Description must be 20 to 1,600 characters.");
    if (city.length < 2 || city.length > 80) throw new BadRequestException("Enter a city name.");
    if (neighborhood.length > 100) throw new BadRequestException("Neighborhood must be 100 characters or fewer.");
    if (!Number.isInteger(monthlyRent) || monthlyRent < 1 || monthlyRent > 1000000) throw new BadRequestException("Enter a valid monthly rent.");
    if (deposit !== null && (!Number.isInteger(deposit) || deposit < 0 || deposit > 1000000)) throw new BadRequestException("Enter a valid deposit amount.");
    if (!Number.isInteger(bedrooms) || bedrooms < 1 || bedrooms > 20) throw new BadRequestException("Bedrooms must be between 1 and 20.");
    if (Number.isNaN(availableFrom.getTime())) throw new BadRequestException("Choose a valid available date.");

    const listing = await this.prisma.listing.create({
      data: {
        title, description, city, neighborhood: neighborhood || null,
        monthlyRent, deposit, bedrooms, furnished: body.furnished === true || body.furnished === "true",
        availableFrom, ownerId: owner.id,
      },
      select: { id: true, title: true, city: true, monthlyRent: true },
    });
    return { listing };
  }
}
