import { Router } from "express";
import { getSkinDetail, getSkins } from "./skin.controller.js";

export const skinRouter = Router();

skinRouter.get("/", getSkins);
skinRouter.get("/:skin_id", getSkinDetail);
