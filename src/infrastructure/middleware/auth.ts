import type { Request, Response, NextFunction } from "express";
import { container } from "#infrastructure/container/container.js";

import type { User } from "#auth/domain/entities/user.entity.js";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const getSession = container.resolve("getSessionUseCase");
    res.locals.user = await getSession.execute(req.headers.cookie);
    next();
  } catch (err) {
    next(err);
  }
};
