import type { NextFunction, Request, Response } from "express";
import { error } from "#domain/errors/app-error.js";

export function notFound(
  _req: Request,
  _res: Response,
  next: NextFunction,
): void {
  next(error.notFound());
}
