CREATE TYPE "OAuthProvider" AS ENUM ('GOOGLE', 'FACEBOOK', 'APPLE');
CREATE TYPE "OAuthPlatform" AS ENUM ('WEB', 'MOBILE');

CREATE TABLE "OAuthIdentity" (
  "id" TEXT NOT NULL,
  "provider" "OAuthProvider" NOT NULL,
  "providerUserId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OAuthIdentity_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "OAuthIdentity_provider_providerUserId_key"
  ON "OAuthIdentity"("provider", "providerUserId");
CREATE INDEX "OAuthIdentity_userId_idx" ON "OAuthIdentity"("userId");

CREATE TABLE "OAuthTransaction" (
  "id" TEXT NOT NULL,
  "stateHash" TEXT NOT NULL,
  "provider" "OAuthProvider" NOT NULL,
  "platform" "OAuthPlatform" NOT NULL,
  "redirectUri" TEXT NOT NULL,
  "codeChallenge" TEXT,
  "nonce" TEXT,
  "handoffChallenge" TEXT,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "consumedAt" TIMESTAMP(3),
  "userId" TEXT,
  "handoffHash" TEXT,
  "handoffExpiresAt" TIMESTAMP(3),
  "handoffConsumedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OAuthTransaction_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "OAuthTransaction_stateHash_key" ON "OAuthTransaction"("stateHash");
CREATE UNIQUE INDEX "OAuthTransaction_handoffHash_key" ON "OAuthTransaction"("handoffHash");
CREATE INDEX "OAuthTransaction_expiresAt_idx" ON "OAuthTransaction"("expiresAt");
CREATE INDEX "OAuthTransaction_userId_idx" ON "OAuthTransaction"("userId");

ALTER TABLE "OAuthIdentity" ADD CONSTRAINT "OAuthIdentity_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OAuthTransaction" ADD CONSTRAINT "OAuthTransaction_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
