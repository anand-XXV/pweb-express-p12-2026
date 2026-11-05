import type { Request, Response } from "express";
import { Rarity } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import { HttpError } from "../../middleware/HttpError.js";
import { getPagination } from "../../utils/pagination.js";
import { success } from "../../utils/response.js";

export async function getSkins(req: Request, res: Response) {
  const { page, limit, skip } = getPagination(
    req.query.page as string | undefined,
    req.query.limit as string | undefined,
  );
  const heroId =
    typeof req.query.heroId === "string" && req.query.heroId
      ? Number(req.query.heroId)
      : undefined;
  const rarity = typeof req.query.rarity === "string" ? req.query.rarity : undefined;

  const where = {
    ...(heroId !== undefined && Number.isInteger(heroId) ? { heroId } : {}),
    ...(rarity && Object.values(Rarity).includes(rarity as Rarity)
      ? { rarity: rarity as Rarity }
      : {}),
  };

  const [skins, totalItems] = await Promise.all([
    prisma.skin.findMany({
      where,
      skip,
      take: limit,
      include: { hero: true },
      orderBy: { id: "asc" },
    }),
    prisma.skin.count({ where }),
  ]);

  return success(res, 200, "Berhasil mengambil data skin", skins, {
    currentPage: page,
    limit,
    totalItems,
    totalPages: Math.ceil(totalItems / limit),
  });
}

export async function getSkinDetail(req: Request, res: Response) {
  const id = Number(String(req.params.skin_id));
  if (!Number.isInteger(id)) throw new HttpError(404, "Skin tidak ditemukan");

  const skin = await prisma.skin.findUnique({
    where: { id },
    include: { hero: true },
  });
  if (!skin) throw new HttpError(404, "Skin tidak ditemukan");

  return success(res, 200, "Berhasil mengambil detail skin", skin);
}
