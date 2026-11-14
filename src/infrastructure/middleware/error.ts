import type { Response, Request, NextFunction } from "express";

import { isAPIError } from "better-auth/api";

import config from "#config/config.js";
import { CustomError } from "#domain/errors/app-error.js";

import type { Boom, Payload } from "@hapi/boom";
import boom from "@hapi/boom";

export function withErrorStack(error: Payload, stack: string | undefined) {
  if (!config.isProduction) {
    return { error: { ...error, stack }, data: {} };
  }
  return { error, data: {} };
}

export function logErrors(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  console.log(err);
  next(err);
}

export function errorHandler(
  err: Boom,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { output } = err;
  res.status(output.statusCode);
  res.json(withErrorStack(output.payload, err.stack));
}

export function wrapErrors(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (err.isValidation) {
    next({
      output: {
        statusCode: 400,
        payload: {
          statusCode: 400,
          message: "Data is invalid",
          error: err,
        },
      },
      stack: err.stack,
    });
  } else if (err instanceof CustomError) {
    return next(boom.boomify(err, { statusCode: err.status }));
  } else if (err.message === "No auth token") {
    return next(boom.unauthorized("No auth token provided"));
  } else if (isAPIError(err)) {
    next({
      output: {
        statusCode: err.statusCode,
        payload: {
          statusCode: err.statusCode,
          error: err.status,
          message: err.body?.message ?? err.message,
          code: err.body?.code,
        },
      },
      stack: err.stack,
    });
  } else {
    next(boom.boomify(err));
  }
}
