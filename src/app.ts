import "dotenv/config";
import express from "express";
import cors from "cors";
import { router } from "./routes.js";
import { logger } from "./middleware/logger.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";

export const app = express();

app.use(cors());
app.use(express.json());
app.use(logger);
app.use(router);
app.use(notFound);
app.use(errorHandler);
