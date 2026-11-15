import { Router } from "express";

import { authenticate } from "#infrastructure/middleware/auth.js";

import type ExpressBalanceController from "#balance/infrastructure/http/balance.controller.js";

export default function createBalanceRouter(
  controller: ExpressBalanceController,
) {
  const router: Router = Router();

  router.get("/", authenticate, controller.getBalance);

  return router;
}
