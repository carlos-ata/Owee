import { Router } from "express";

import { ExpressHelloWorldController } from "./hello-world.controller.js";
import validation from "#infrastructure/middleware/validation.js";
import { helloWorldSchema } from "./hello-world.schema.js";

import { authenticate } from "#infrastructure/middleware/auth.js";

const ExpressHelloWorldRouter: Router = Router();

const helloWorldController = new ExpressHelloWorldController();

ExpressHelloWorldRouter.get("/", helloWorldController.getHelloWorld);

ExpressHelloWorldRouter.post(
  "/",
  authenticate,
  validation({ body: helloWorldSchema }),
  helloWorldController.getHelloWorldWithParams,
);

export default ExpressHelloWorldRouter;
