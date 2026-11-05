import type { Request, Response } from "express";
import { Lane, Role } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import { HttpError } from "../../middleware/HttpError.js";
import { getPagination } from "../../utils/pagination.js";
import { success } from "../../utils/response.js";

export async function getHeroes(req: Request, res: Response) {
  const { page, limit, skip } = getPagination(
    req.query.page as string | undefined,
    req.query.limit as string | undefined,
  );
  const search = typeof req.query.search === "string" ? req.query.search : undefined;
  const role = typeof req.query.role === "string" ? req.query.role : undefined;

  const where = {
    ...(search
      ? { name: { contains: search, mode: "insensitive" as const } }
      : {}),
    ...(role && Object.values(Role).includes(role as Role)
      ? { role: role as Role }
      : {}),
  };

  const [heroes, totalItems] = await Promise.all([
    prisma.hero.findMany({
      where,
      skip,
      take: limit,
      orderBy: { id: "asc" },
    }),
    prisma.hero.count({ where }),
  ]);

  return success(res, 200, "Berhasil mengambil data hero", heroes, {
    currentPage: page,
    limit,
    totalItems,
    totalPages: Math.ceil(totalItems / limit),
  });
}

export async function getHeroDetail(req: Request, res: Response) {
  const id = Number(String(req.params.hero_id));
  if (!Number.isInteger(id)) throw new HttpError(404, "Hero tidak ditemukan");

  const hero = await prisma.hero.findUnique({
    where: { id },
    include: { skins: true },
  });
  if (!hero) throw new HttpError(404, "Hero tidak ditemukan");

  return success(res, 200, "Berhasil mengambil detail hero", hero);
}

export async function createHero(req: Request, res: Response) {
  const { name, role, lane, releaseYear, priceBP, priceDiamond } = req.body;

  if (!name || !role || !lane || !Number.isInteger(releaseYear)) {
    throw new HttpError(400, "name, role, lane, dan releaseYear wajib diisi");
  }
  if (!Object.values(Role).includes(role) || !Object.values(Lane).includes(lane)) {
    throw new HttpError(400, "role atau lane tidak valid");
  }

  const exists = await prisma.hero.findUnique({ where: { name } });
  if (exists) throw new HttpError(409, "Nama hero sudah digunakan");

  const hero = await prisma.hero.create({
    data: {
      name,
      role,
      lane,
      releaseYear,
      priceBP: priceBP ?? null,
      priceDiamond: priceDiamond ?? null,
    },
  });

  return success(res, 201, "Hero berhasil dibuat", hero);
}
