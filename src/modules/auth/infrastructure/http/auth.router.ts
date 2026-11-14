import { Router } from "express";

import validation from "#infrastructure/middleware/validation.js";

import type ExpressAuthController from "#auth/infrastructure/http/auth.controller.js";

import { signUpEmailSchema } from "#auth/infrastructure/http/schemas/sign-up-email.schema.js";
import { signInEmailSchema } from "#auth/infrastructure/http/schemas/sign-in-email.schema.js";

export default function createAuthRouter(controller: ExpressAuthController) {
  const router: Router = Router();

  /**
   * @openapi
   * /auth/sign-up:
   *   post:
   *     tags: [Auth]
   *     summary: Registrar una cuenta
   *     description: Crea un usuario con email y contraseña. No inicia sesión.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/SignUpRequest'
   *     responses:
   *       201:
   *         description: Cuenta creada
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiSuccess'
   *                 - type: object
   *                   properties:
   *                     statusCode: { type: integer, example: 201 }
   *                     data:
   *                       $ref: '#/components/schemas/PublicUser'
   *       400:
   *         $ref: '#/components/responses/ValidationFailed'
   *       422:
   *         description: El email ya está registrado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiError'
   */
  router.post(
    "/sign-up",
    validation({ body: signUpEmailSchema }),
    controller.signUpEmail,
  );

  /**
   * @openapi
   * /auth/sign-in:
   *   post:
   *     tags: [Auth]
   *     summary: Iniciar sesión
   *     description: >
   *       Valida las credenciales y devuelve la cookie de sesión de Better Auth en
   *       `Set-Cookie`. El cliente debe hacer las peticiones siguientes con
   *       `credentials: "include"`.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/SignInRequest'
   *     responses:
   *       200:
   *         description: Sesión iniciada
   *         headers:
   *           Set-Cookie:
   *             description: Cookie de sesión de Better Auth
   *             schema: { type: string }
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiSuccess'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       $ref: '#/components/schemas/PublicUser'
   *       400:
   *         $ref: '#/components/responses/ValidationFailed'
   *       401:
   *         description: Credenciales inválidas
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiError'
   *       403:
   *         description: >
   *           El usuario existe y la contraseña es correcta, pero la cuenta está
   *           inactiva. La sesión recién creada se revoca antes de responder.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiError'
   */
  router.post(
    "/sign-in",
    validation({ body: signInEmailSchema }),
    controller.signInEmail,
  );

  /**
   * @openapi
   * /auth/sign-out:
   *   post:
   *     tags: [Auth]
   *     summary: Cerrar sesión
   *     description: Revoca la sesión actual y devuelve la cookie expirada en `Set-Cookie`.
   *     security:
   *       - cookieAuth: []
   *     responses:
   *       200:
   *         description: Sesión cerrada
   *         headers:
   *           Set-Cookie:
   *             description: Cookie de sesión expirada
   *             schema: { type: string }
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiSuccess'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       type: object
   *                       properties:
   *                         message:
   *                           type: string
   *                           example: "Sesión cerrada exitosamente"
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   */
  router.post("/sign-out", controller.signOut);

  return router;
}
