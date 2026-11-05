
import { Router } from "express";

import {
  createPlayer,
  getPlayer,
  updatePlayer,
  deletePlayer,
  topUpPlayer,
  addMatch,
} from "./player.controller.js";

export const playerRouter = Router();

playerRouter.post("/", createPlayer);
playerRouter.get("/:id", getPlayer);
playerRouter.patch("/:id", updatePlayer);
playerRouter.delete("/:id", deletePlayer);

playerRouter.post("/:id/topup", topUpPlayer);
playerRouter.post("/:id/matches", addMatch);
