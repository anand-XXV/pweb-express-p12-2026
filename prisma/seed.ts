import "dotenv/config";
import fs from "node:fs";
import ws from "ws";
import { neonConfig, Pool } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Currency, Lane, PrismaClient, Rarity, Role } from "../src/generated/prisma/client.js";

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL ?? "" }),
});

type HeroSeed = {
  name: string;
  primaryRole: Role;
  primaryLane: Lane;
  releaseYear: number;
  priceBP: number | null;
  priceDiamond: number | null;
};

type SkinSeed = {
  name: string;
  heroId: number;
  rarity: Rarity;
  priceDiamond: number | null;
};

async function main() {
  await prisma.$executeRawUnsafe(
    'TRUNCATE "PlayerHero", "Player", "Skin", "Hero" RESTART IDENTITY CASCADE',
  );

  const heroes = JSON.parse(
    fs.readFileSync(new URL("../data/heroes.json", import.meta.url), "utf8"),
  ) as HeroSeed[];
  const skins = JSON.parse(
    fs.readFileSync(new URL("../data/skins.json", import.meta.url), "utf8"),
  ) as SkinSeed[];

  await prisma.hero.createMany({
    data: heroes.map((hero) => ({
      name: hero.name,
      role: hero.primaryRole,
      lane: hero.primaryLane,
      releaseYear: hero.releaseYear,
      priceBP: hero.priceBP,
      priceDiamond: hero.priceDiamond,
    })),
  });

  await prisma.skin.createMany({
    data: skins.map((skin) => ({
      name: skin.name,
      heroId: skin.heroId,
      rarity: skin.rarity,
      priceDiamond: skin.priceDiamond,
    })),
  });

  await prisma.player.createMany({
    data: [
      { id: 1, nickname: "ArekITS", bp: 1500, diamond: 75 },
      { id: 2, nickname: "SangPushRank", bp: 13000, diamond: 2892 },
      { id: 3, nickname: "MageSurabaya", bp: 10000, diamond: 0 },
    ],
  });

  await prisma.playerHero.createMany({
    data: [
      { playerId: 1, heroId: 18, currency: Currency.BP, pricePaid: 2000 },
      { playerId: 1, heroId: 1, currency: Currency.BP, pricePaid: 10800 },
      { playerId: 2, heroId: 84, currency: Currency.DIAMOND, pricePaid: 599 },
      { playerId: 2, heroId: 56, currency: Currency.BP, pricePaid: 32000 },
    ],
  });

  console.log(`Seed selesai: ${heroes.length} hero, ${skins.length} skin, 3 player`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
