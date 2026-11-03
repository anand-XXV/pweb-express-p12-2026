import type { Response } from "express";

export function success(
  res: Response,
  statusCode: number,
  message: string,
  data: unknown,
  metadata?: Record<string, number>,
) {
  const body: Record<string, unknown> = { status: true, message, data };
  if (metadata) body.metadata = metadata;
  return res.status(statusCode).json(body);
}
