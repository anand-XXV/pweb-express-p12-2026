import { Router } from "express";
import { getStatistics } from "./statistic.controller.js";

export const statisticRouter = Router();

statisticRouter.get("/", getStatistics);
