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
 *     CounterpartyBalanceResponse:
 *       type: object
 *       required: [person, balance]
 *       properties:
 *         person:
 *           type: object
 *           required: [id, name]
 *           properties:
 *             id:
 *               type: string
 *               nullable: true
 *               description: Id de la contraparte, o `null` si es una persona sin cuenta registrada.
 *               example: "usr_01h8z"
 *             name:
 *               type: string
 *               example: "Juan Pérez"
 *         balance:
 *           type: object
 *           required: [receivable, payable, concepts]
 *           properties:
 *             receivable:
 *               type: object
 *               required: [amount]
 *               properties:
 *                 amount:
 *                   type: number
 *                   description: Lo que esa contraparte le debe al usuario autenticado.
 *                   example: 5000
 *             payable:
 *               type: object
 *               required: [amount]
 *               properties:
 *                 amount:
 *                   type: number
 *                   description: Lo que el usuario autenticado le debe a esa contraparte.
 *                   example: 1200.50
 *             concepts:
 *               type: array
 *               description: Hasta 5 conceptos de las deudas más recientes entre ambos.
 *               maxItems: 5
 *               items:
 *                 type: string
 *               example: ["Cena", "Uber", "Netflix"]
 */
export {};
