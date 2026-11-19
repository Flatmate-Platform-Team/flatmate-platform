CREATE TYPE "ListingStatus" AS ENUM ('ACTIVE', 'RENTED', 'ARCHIVED');

CREATE TABLE "Listing" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "neighborhood" TEXT,
  "monthlyRent" INTEGER NOT NULL,
  "deposit" INTEGER,
  "bedrooms" INTEGER NOT NULL DEFAULT 1,
  "furnished" BOOLEAN NOT NULL DEFAULT false,
  "availableFrom" TIMESTAMP(3) NOT NULL,
  "status" "ListingStatus" NOT NULL DEFAULT 'ACTIVE',
  "ownerId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Listing_status_city_idx" ON "Listing"("status", "city");
CREATE INDEX "Listing_monthlyRent_idx" ON "Listing"("monthlyRent");
CREATE INDEX "Listing_ownerId_idx" ON "Listing"("ownerId");

ALTER TABLE "Listing" ADD CONSTRAINT "Listing_ownerId_fkey"
  FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
