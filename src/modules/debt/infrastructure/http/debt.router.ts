import { Router } from "express";

import { authenticate } from "#infrastructure/middleware/auth.js";
import validation from "#infrastructure/middleware/validation.js";

import type ExpressDebtController from "#debt/infrastructure/http/debt.controller.js";

import { debtCreateSchema } from "#debt/infrastructure/http/schemas/debt-create.schema.js";
import { debtIdentitySchema } from "#debt/infrastructure/http/schemas/debt-identity.schema.js";

export default function createDebtRouter(controller: ExpressDebtController) {
  const router: Router = Router();

  /**
   * @openapi
   * /debt:
   *   post:
   *     tags: [Debt]
   *     summary: Registrar una deuda
   *     description: >
   *       Crea una deuda en la que el usuario autenticado es el deudor (`type:
   *       PAYABLE`) o el acreedor (`type: RECEIVABLE`). Si se envía `partyId`, la
   *       deuda queda pendiente de que la contraparte la confirme (`isConfirmed =
   *       null`); si se omite (solo permitido con `PAYABLE`), se trata de una deuda
   *       personal y nace confirmada.
   *     security:
   *       - cookieAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/DebtCreateRequest'
   *     responses:
   *       201:
   *         description: Deuda registrada
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiSuccess'
   *                 - type: object
   *                   properties:
   *                     statusCode: { type: integer, example: 201 }
   *                     data:
   *                       $ref: '#/components/schemas/DebtIdentityResponse'
   *       400:
   *         description: >
   *           El cuerpo no pasó la validación de Zod, o violó una regla de negocio:
   *           `partyId` es obligatorio cuando `type` es `RECEIVABLE`, o `partyId` es
   *           el mismo id que el del usuario autenticado.
   *         content:
   *           application/json:
   *             schema:
   *               oneOf:
   *                 - $ref: '#/components/schemas/ValidationError'
   *                 - $ref: '#/components/schemas/ApiError'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       404:
   *         description: El usuario de la otra parte (`partyId`) no existe
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiError'
   */
  router.post(
    "/",
    authenticate,
    validation({ body: debtCreateSchema }),
    controller.createDebt,
  );

  /**
   * @openapi
   * /debt/{id}:
   *   delete:
   *     tags: [Debt]
   *     summary: Cancelar una deuda
   *     description: >
   *       Baja lógica de la deuda (`status = "I"`). No borra el registro. Solo el
   *       creador de la deuda puede cancelarla.
   *     security:
   *       - cookieAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: integer, minimum: 1 }
   *         description: Id de la deuda
   *     responses:
   *       204:
   *         description: Deuda cancelada
   *       400:
   *         $ref: '#/components/responses/ValidationFailed'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         description: El usuario autenticado no es el creador de la deuda
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiError'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   */
  router.delete(
    "/:id",
    authenticate,
    validation({ params: debtIdentitySchema }),
    controller.cancelDebt,
  );

  /**
   * @openapi
   * /debt/{id}/confirm:
   *   patch:
   *     tags: [Debt]
   *     summary: Confirmar una deuda
   *     description: >
   *       Acepta una deuda pendiente. Una deuda sin confirmar no cuenta para ningún
   *       saldo ni puede recibir pagos.
   *     security:
   *       - cookieAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: integer, minimum: 1 }
   *         description: Id de la deuda
   *     responses:
   *       200:
   *         description: Deuda confirmada
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiSuccess'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       $ref: '#/components/schemas/DebtIdentityResponse'
   *       400:
   *         $ref: '#/components/responses/ValidationFailed'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         description: El usuario autenticado no es el creador de la deuda
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiError'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   */
  router.patch(
    "/:id/confirm",
    authenticate,
    validation({ params: debtIdentitySchema }),
    controller.confirmDebt,
  );

  return router;
}
