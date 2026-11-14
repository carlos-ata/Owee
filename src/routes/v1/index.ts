import { Router } from "express";

import { container } from "#infrastructure/container/container.js";

import createAuthRouter from "#modules/auth/infrastructure/http/auth.router.js";
import createDebtRouter from "#modules/debt/infrastructure/http/debt.router.js";

const router: Router = Router();

router.use("/auth", createAuthRouter(container.resolve("authController")));

router.use("/debt", createDebtRouter(container.resolve("debtController")));

export default router;
