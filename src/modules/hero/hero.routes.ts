import { Router } from "express";
import { createHero, getHeroDetail, getHeroes } from "./hero.controller.js";

export const heroRouter = Router();

heroRouter.get("/", getHeroes);
heroRouter.get("/:hero_id", getHeroDetail);
heroRouter.post("/", createHero);
