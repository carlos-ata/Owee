/**
 * Componentes OpenAPI del módulo `balance`.
 *
 * Este archivo no exporta runtime: existe solo para alojar los `components.schemas`
 * reutilizables del módulo. Mantén el schema sincronizado con
 * `src/modules/balance/infrastructure/http/dto/balance-get-response.dto.ts`.
 *
 * @openapi
 * components:
 *   schemas:
 *     BalanceResponse:
 *       type: object
 *       required: [receivable, payable]
 *       properties:
 *         receivable:
 *           type: object
 *           description: Lo que a el usuario autenticado le deben.
 *           required: [amount, count]
 *           properties:
 *             amount:
 *               type: number
 *               example: 16500.36
 *             count:
 *               type: integer
 *               description: Cantidad de deudas que componen el saldo.
 *               example: 2
 *         payable:
 *           type: object
 *           description: Lo que el usuario autenticado debe.
 *           required: [amount, count]
 *           properties:
 *             amount:
 *               type: number
 *               example: 15000
 *             count:
 *               type: integer
 *               example: 0
 */
export {};
