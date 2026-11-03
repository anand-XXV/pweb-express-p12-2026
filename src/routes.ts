import { Router } from "express";
import { purchaseRouter } from "./modules/purchase/purchase.routes.js";
import { statisticRouter } from "./modules/statistic/statistic.routes.js";
import { success } from "./utils/response.js";

export const router = Router();

router.get("/health", (_req, res) => {
  success(res, 200, "API MLBB Shop berjalan", { service: "MLBB Shop API" });
});

router.use("/api/players/:id/heroes", purchaseRouter);
router.use("/api/statistics", statisticRouter);
