import { Router } from "express";

import { authenticate } from "#infrastructure/middleware/auth.js";

import type ExpressBalanceController from "#balance/infrastructure/http/balance.controller.js";

export default function createBalanceRouter(
  controller: ExpressBalanceController,
) {
  const router: Router = Router();

  /**
   * @openapi
   * /balance:
   *   get:
   *     tags: [Balance]
   *     summary: Obtener el saldo del usuario autenticado
   *     description: >
   *       Suma las deudas activas y confirmadas del usuario: `receivable` es lo que le
   *       deben, `payable` es lo que debe. `count` es la cantidad de deudas detrás de
   *       cada monto.
   *     security:
   *       - cookieAuth: []
   *     responses:
   *       200:
   *         description: Saldo calculado
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiSuccess'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       $ref: '#/components/schemas/BalanceResponse'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   */
  router.get("/", authenticate, controller.getBalance);

  return router;
}
