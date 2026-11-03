import type { Request, Response } from "express";
import { Currency } from "../../generated/prisma/client.js";
import { HttpError } from "../../middleware/HttpError.js";
import { prisma } from "../../lib/prisma.js";
import { success } from "../../utils/response.js";

export async function purchaseHero(req: Request, res: Response) {
  const playerId = Number.parseInt(String(req.params.id), 10);
  const heroId = req.body.heroId;
  const currency = req.body.currency;

  if (!Number.isInteger(Number(heroId)) || !["BP", "DIAMOND"].includes(currency)) {
    throw new HttpError(400, "heroId dan currency wajib diisi dengan nilai BP atau DIAMOND");
  }

  const player = await prisma.player.findUnique({ where: { id: playerId } });
  if (!player) throw new HttpError(404, "Player tidak ditemukan");

  const hero = await prisma.hero.findUnique({ where: { id: Number(heroId) } });
  if (!hero) throw new HttpError(404, "Hero tidak ditemukan");

  const price = currency === "BP" ? hero.priceBP : hero.priceDiamond;
  if (price === null) {
    throw new HttpError(400, `Harga hero untuk mata uang ${currency} tidak tersedia`);
  }

  const alreadyOwned = await prisma.playerHero.findUnique({
    where: { playerId_heroId: { playerId, heroId: hero.id } },
  });
  if (alreadyOwned) throw new HttpError(409, "Player sudah memiliki hero tersebut");

  const balance = currency === "BP" ? player.bp : player.diamond;
  if (balance < price) throw new HttpError(400, "Saldo player kurang dari harga hero");

  const [updatedPlayer] = await prisma.$transaction([
    prisma.player.update({
      where: { id: playerId },
      data:
        currency === "BP"
          ? { bp: { decrement: price } }
          : { diamond: { decrement: price } },
    }),
    prisma.playerHero.create({
      data: {
        playerId,
        heroId: hero.id,
        currency: currency === "BP" ? Currency.BP : Currency.DIAMOND,
        pricePaid: price,
      },
    }),
  ]);

  return success(res, 201, "Berhasil membeli hero", {
    hero,
    currency,
    pricePaid: price,
    bp: updatedPlayer.bp,
    diamond: updatedPlayer.diamond,
  });
}
