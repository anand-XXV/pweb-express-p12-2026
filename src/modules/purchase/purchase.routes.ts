import { Router } from "express";
import { purchaseHero } from "./purchase.controller.js";

export const purchaseRouter = Router({ mergeParams: true });

purchaseRouter.post("/", purchaseHero);
