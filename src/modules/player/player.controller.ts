
import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";
import { HttpError } from "../../middleware/HttpError.js";
import { success } from "../../utils/response.js";

// Validasi ID player dari URL
function getPlayerId(req: Request): number {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new HttpError(400, "ID player tidak valid");
  }

  return id;
}

// Validasi nickname dari request body
function getNickname(body: unknown): string {
  if (
    typeof body !== "object" ||
    body === null ||
    !("nickname" in body) ||
    typeof body.nickname !== "string" ||
    body.nickname.trim() === ""
  ) {
    throw new HttpError(400, "Nickname wajib diisi");
  }

  return body.nickname.trim();
}

// Memeriksa error Prisma berdasarkan kode
function isPrismaError(error: unknown, code: string): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === code
  );
}

// POST /api/players
export async function createPlayer(req: Request, res: Response) {
  const nickname = getNickname(req.body);

  const existing = await prisma.player.findUnique({
    where: { nickname },
  });

  if (existing) {
    throw new HttpError(409, "Nickname sudah digunakan");
  }

  try {
    const player = await prisma.player.create({
      data: { nickname },
    });

    success(res, 201, "Player berhasil dibuat", player);
  } catch (error) {
    if (isPrismaError(error, "P2002")) {
      throw new HttpError(409, "Nickname sudah digunakan");
    }

    throw error;
  }
}

// GET /api/players/:id
export async function getPlayer(req: Request, res: Response) {
  const id = getPlayerId(req);

  const player = await prisma.player.findUnique({
    where: { id },
  });

  if (!player) {
    throw new HttpError(404, "Player tidak ditemukan");
  }

  const ownedHeroes = await prisma.playerHero.findMany({
    where: { playerId: id },
    orderBy: { id: "asc" },
    select: {
      heroId: true,
      currency: true,
      pricePaid: true,
    },
  });

  const heroData = await prisma.hero.findMany({
    where: {
      id: { in: ownedHeroes.map((item) => item.heroId) },
    },
    select: {
      id: true,
      name: true,
    },
  });

  const heroNames = new Map(
    heroData.map((hero) => [hero.id, hero.name])
  );

  const heroes = ownedHeroes.map((item) => ({
    heroId: item.heroId,
    name: heroNames.get(item.heroId),
    currency: item.currency,
    pricePaid: item.pricePaid,
  }));

  success(res, 200, "Berhasil mengambil data player", {
    ...player,
    heroes,
  });
}

// PATCH /api/players/:id
export async function updatePlayer(req: Request, res: Response) {
  const id = getPlayerId(req);

  const player = await prisma.player.findUnique({
    where: { id },
  });

  if (!player) {
    throw new HttpError(404, "Player tidak ditemukan");
  }

  const nickname = getNickname(req.body);

  const existing = await prisma.player.findUnique({
    where: { nickname },
  });

  if (existing && existing.id !== id) {
    throw new HttpError(409, "Nickname sudah digunakan");
  }

  try {
    const updated = await prisma.player.update({
      where: { id },
      data: { nickname },
    });

    success(res, 200, "Player berhasil diperbarui", updated);
  } catch (error) {
    if (isPrismaError(error, "P2002")) {
      throw new HttpError(409, "Nickname sudah digunakan");
    }

    if (isPrismaError(error, "P2025")) {
      throw new HttpError(404, "Player tidak ditemukan");
    }

    throw error;
  }
}

// DELETE /api/players/:id
export async function deletePlayer(req: Request, res: Response) {
  const id = getPlayerId(req);

  const player = await prisma.player.findUnique({
    where: { id },
  });

  if (!player) {
    throw new HttpError(404, "Player tidak ditemukan");
  }

  try {
    const deleted = await prisma.player.delete({
      where: { id },
    });

    success(res, 200, "Player berhasil dihapus", deleted);
  } catch (error) {
    if (isPrismaError(error, "P2025")) {
      throw new HttpError(404, "Player tidak ditemukan");
    }

    throw error;
  }
}

 // POST /api/players/:id/topup
export async function topUpPlayer(req: Request, res: Response) {
  const id = getPlayerId(req);
  const amount = req.body?.amount;

  // Validasi jumlah diamond
  if (!Number.isSafeInteger(amount) || amount <= 0) {
    throw new HttpError(
      400,
      "Amount harus bilangan bulat lebih dari 0"
    );
  }

  // Periksa apakah player ada
  const player = await prisma.player.findUnique({
    where: { id },
  });

  if (!player) {
    throw new HttpError(404, "Player tidak ditemukan");
  }

  // Tambahkan Diamond secara atomik
  const updated = await prisma.player.update({
    where: { id },
    data: {
      diamond: {
        increment: amount,
      },
    },
  });

  success(res, 200, "Top up berhasil", {
    playerId: updated.id,
    amount,
    diamond: updated.diamond,
  });
}

 // POST /api/players/:id/matches
export async function addMatch(req: Request, res: Response) {
  const id = getPlayerId(req);
  const result = req.body?.result;

  // Validasi hasil match
  if (result !== "WIN" && result !== "LOSE") {
    throw new HttpError(
      400,
      "Result harus WIN atau LOSE"
    );
  }

  // Cek apakah player tersedia
  const player = await prisma.player.findUnique({
    where: { id },
  });

  if (!player) {
    throw new HttpError(404, "Player tidak ditemukan");
  }

  // Menentukan hadiah BP
  const bpEarned = result === "WIN" ? 300 : 100;

  // Tambahkan BP secara atomik
  const updated = await prisma.player.update({
    where: { id },
    data: {
      bp: {
        increment: bpEarned,
      },
    },
  });

  success(res, 200, "Hadiah match berhasil ditambahkan", {
    playerId: updated.id,
    result,
    bpEarned,
    bp: updated.bp,
  });
}
