import type { NextFunction, Request, Response } from "express";

declare global {
  namespace Express {
    interface Response {
      success: (data?: unknown, statusCode?: number) => Response;
    }
  }
}

export function responseExtender(
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  res.success = (data: unknown = null, statusCode = 200) => {
    return res.status(statusCode).json({
      statusCode,
      data,
      error: null,
    });
  };

  next();
}
