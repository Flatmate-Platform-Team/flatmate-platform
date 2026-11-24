const { randomBytes, scryptSync } = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { PrismaClient } = require("@prisma/client");

const envFile = path.resolve(__dirname, "../../.env");
if (!process.env.DATABASE_URL && fs.existsSync(envFile)) {
  process.loadEnvFile(envFile);
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is missing. Create your private project-root .env first.");
  process.exit(1);
}

let parsedUrl;
try {
  parsedUrl = new URL(databaseUrl);
} catch {
  console.error("DATABASE_URL is not a valid PostgreSQL connection URL.");
  process.exit(1);
}

const localHosts = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);
if (!localHosts.has(parsedUrl.hostname) || parsedUrl.pathname !== "/flatmate_platform") {
  console.error("Safety stop: test accounts can only be seeded into the local flatmate_platform database.");
  process.exit(1);
}

const samples = [
  ["Aarav Mehta", "Bengaluru", "Product designer who loves morning runs and a tidy shared kitchen.", 18000, 30000],
  ["Mira Shah", "Bengaluru", "Working in tech, usually out exploring cafes on weekends.", 20000, 32000],
  ["Kabir Nair", "Mumbai", "Easygoing, considerate, and happiest near the sea.", 22000, 36000],
  ["Ananya Rao", "Mumbai", "Marketing professional who enjoys cooking for housemates.", 20000, 35000],
  ["Rehan Khan", "Hyderabad", "Quiet on weekdays, up for board games on weekends.", 14000, 24000],
  ["Isha Menon", "Hyderabad", "Healthcare researcher looking for a calm, friendly home.", 15000, 25000],
  ["Dev Patel", "Pune", "Cyclist and software engineer; clean, relaxed shared spaces matter.", 12000, 22000],
  ["Tara Iyer", "Pune", "Artist who likes plants, good playlists, and clear communication.", 13000, 23000],
  ["Zoya Ali", "Delhi", "Graduate student who enjoys museums and shared dinners.", 16000, 28000],
  ["Neil D'Souza", "Delhi", "Early riser, works in finance, and values a peaceful home.", 18000, 30000],
  ["Sana Thomas", "Chennai", "Remote worker who loves films and a sunny balcony.", 14000, 24000],
  ["Rohan Das", "Chennai", "Friendly cook and music fan; big on respectful house rules.", 15000, 26000],
];

function hashPassword(password) {
  const salt = randomBytes(16);
  const key = scryptSync(password, salt, 64, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
  return `scrypt$32768$8$1$${salt.toString("hex")}$${key.toString("hex")}`;
}

async function main() {
  const prisma = new PrismaClient();
  const password = randomBytes(18).toString("base64url");
  const passwordHash = hashPassword(password);
  const users = [];

  try {
    for (const [index, [displayName, city, bio, budgetMin, budgetMax]] of samples.entries()) {
      const email = `flatmate-test-${String(index + 1).padStart(2, "0")}@example.invalid`;
      const user = await prisma.user.upsert({
        where: { email },
        update: { displayName, passwordHash, role: "USER", status: "ACTIVE", isTestAccount: true },
        create: {
          email,
          displayName,
          passwordHash,
          role: "USER",
          status: "ACTIVE",
          isTestAccount: true,
          profile: { create: { city, bio, budgetMin, budgetMax } },
        },
        select: { id: true, email: true },
      });
      await prisma.profile.upsert({
        where: { userId: user.id },
        update: { city, bio, budgetMin, budgetMax },
        create: { userId: user.id, city, bio, budgetMin, budgetMax },
      });
      users.push(user);
    }

    const [first, second] = users;
    await prisma.like.upsert({
      where: { fromUserId_toUserId: { fromUserId: first.id, toUserId: second.id } },
      update: {},
      create: { fromUserId: first.id, toUserId: second.id },
    });
    await prisma.like.upsert({
      where: { fromUserId_toUserId: { fromUserId: second.id, toUserId: first.id } },
      update: {},
      create: { fromUserId: second.id, toUserId: first.id },
    });
    const [firstUserId, secondUserId] = [first.id, second.id].sort();
    await prisma.match.upsert({
      where: { firstUserId_secondUserId: { firstUserId, secondUserId } },
      update: {},
      create: { firstUserId, secondUserId },
    });

    console.log(`Created or refreshed ${users.length} local test accounts and one sample mutual match.`);
    console.log(`Shared test password for these fake accounts: ${password}`);
    console.log("Test account emails:");
    for (const user of users) console.log(`  ${user.email}`);
    console.log("Remove them later from the Admin → Saved member profiles page.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("Could not seed local test accounts.", error instanceof Error ? error.message : "Unknown error");
  process.exitCode = 1;
});
