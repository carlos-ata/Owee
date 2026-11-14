import type { Request, Response, NextFunction } from "express";
import { error } from "#domain/errors/app-error.js";

export class ExpressHelloWorldController {
  getHelloWorld(req: Request, res: Response, next: NextFunction) {
    try {
      throw error.conflict("Malo");
      res.status(201).json({ message: "Hello World" });
    } catch (error) {
      next(error);
    }
  }

  getHelloWorldWithParams(req: Request, res: Response, next: NextFunction) {
    try {
      console.log(req.body);
      res.status(201).json({ message: "Hello World" });
    } catch (error) {
      next(error);
    }
  }
}
