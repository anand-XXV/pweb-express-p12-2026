import type { NextFunction, Request, Response } from "express";
import { HttpError } from "./HttpError.js";

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  const statusCode =
    error instanceof HttpError
      ? error.statusCode
      : typeof error === "object" && error !== null && "status" in error &&
          typeof error.status === "number"
        ? error.status
        : 500;
  const message = error instanceof Error ? error.message : "Terjadi kesalahan pada server";
  if (!(error instanceof HttpError)) {
    console.error(error);
  }

  res.status(statusCode).json({
    status: false,
    message: statusCode === 500 ? "Terjadi kesalahan pada server" : message,
  });
}
