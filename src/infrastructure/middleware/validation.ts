import type { ZodType } from "zod";
import type { Request, Response, NextFunction } from "express";

type ValidationSchema = {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
};

export default function validation(validationSchema: ValidationSchema) {
  const [[payloadKey, zodSchema]] = Object.entries(validationSchema);

  if (
    payloadKey !== "body" &&
    payloadKey !== "query" &&
    payloadKey !== "params"
  ) {
    throw new Error("Invalid payload key");
  }

  return function (req: Request, res: Response, next: NextFunction) {
    const result = zodSchema.safeParse(req[payloadKey]);
    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
        code: issue.code,
      }));

      return next({
        message: errors,
        isValidation: true,
      });
    }

    next();
  };
}
