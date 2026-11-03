import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";
import { success } from "../../utils/response.js";

export async function getStatistics(_req: Request, res: Response) {
  const [totalPlayers, totalHeroesOwned, diamondSum, ownedHeroes, heroesByRole] =
    await Promise.all([
      prisma.player.count(),
      prisma.playerHero.count(),
      prisma.player.aggregate({ _sum: { diamond: true } }),
      prisma.playerHero.groupBy({
        by: ["heroId"],
        _count: { heroId: true },
        orderBy: { _count: { heroId: "desc" } },
      }),
      prisma.hero.groupBy({
        by: ["role"],
        _count: { role: true },
      }),
    ]);

  const topOwnedHero = ownedHeroes[0]
    ? await prisma.hero.findUnique({ where: { id: ownedHeroes[0].heroId } })
    : null;

  return success(res, 200, "Berhasil mengambil statistik", {
    totalPlayers,
    totalHeroesOwned,
    totalDiamond: diamondSum._sum.diamond ?? 0,
    mostOwnedHero: topOwnedHero
      ? {
          hero: topOwnedHero,
          ownerCount: ownedHeroes[0]._count.heroId,
        }
      : null,
    heroesPerRole: heroesByRole.map((item) => ({
      role: item.role,
      count: item._count.role,
    })),
  });
}
