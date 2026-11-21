CREATE TABLE "Like" (
  "id" TEXT NOT NULL,
  "fromUserId" TEXT NOT NULL,
  "toUserId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Like_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Match" (
  "id" TEXT NOT NULL,
  "firstUserId" TEXT NOT NULL,
  "secondUserId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Like_fromUserId_toUserId_key" ON "Like"("fromUserId", "toUserId");
CREATE INDEX "Like_toUserId_idx" ON "Like"("toUserId");
CREATE UNIQUE INDEX "Match_firstUserId_secondUserId_key" ON "Match"("firstUserId", "secondUserId");
CREATE INDEX "Match_secondUserId_idx" ON "Match"("secondUserId");

ALTER TABLE "Like" ADD CONSTRAINT "Like_fromUserId_fkey"
  FOREIGN KEY ("fromUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Like" ADD CONSTRAINT "Like_toUserId_fkey"
  FOREIGN KEY ("toUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Match" ADD CONSTRAINT "Match_firstUserId_fkey"
  FOREIGN KEY ("firstUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Match" ADD CONSTRAINT "Match_secondUserId_fkey"
  FOREIGN KEY ("secondUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
