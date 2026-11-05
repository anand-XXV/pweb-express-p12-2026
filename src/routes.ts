
import { Router } from "express";
import { purchaseRouter } from "./modules/purchase/purchase.routes.js";
import { statisticRouter } from "./modules/statistic/statistic.routes.js";
import { heroRouter } from "./modules/hero/hero.routes.js";
import { skinRouter } from "./modules/skin/skin.routes.js";
import { playerRouter } from "./modules/player/player.routes.js";
import { success } from "./utils/response.js";

export const router = Router();

router.get("/health", (_req, res) => {
  success(res, 200, "API MLBB Shop berjalan", {
    service: "MLBB Shop API",
  });
});

router.use("/api/players/:id/heroes", purchaseRouter);
router.use("/api/statistics", statisticRouter);
router.use("/api/heroes", heroRouter);
router.use("/api/skins", skinRouter);
router.use("/api/players", playerRouter);
