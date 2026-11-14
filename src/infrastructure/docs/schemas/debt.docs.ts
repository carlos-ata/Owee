/**
 * Componentes OpenAPI del módulo `debt`.
 *
 * Este archivo no exporta runtime: existe solo para alojar los `components.schemas`
 * reutilizables del módulo. Mantén cada schema sincronizado con su contraparte en
 * `src/modules/debt/infrastructure/http/` — el schema de request espeja el Zod
 * (`schemas/*.schema.ts`) y el de response espeja el DTO (`dto/*-response.dto.ts`).
 *
 * @openapi
 * components:
 *   schemas:
 *     DebtCreateRequest:
 *       type: object
 *       required: [debt]
 *       properties:
 *         debt:
 *           type: object
 *           required: [debtorId, description, amount]
 *           properties:
 *             debtorId:
 *               type: string
 *               description: Usuario que debe. Tú tienes que ser el deudor o el acreedor.
 *               example: "uR8xK2mQ0pLzN4vT"
 *             creditorId:
 *               type: string
 *               nullable: true
 *               description: >
 *                 Usuario al que se le debe. Omítelo o mándalo en `null` para registrar
 *                 una deuda personal con alguien que no está en Owee; en ese caso la
 *                 deuda nace confirmada porque no hay contraparte que la acepte.
 *               example: "a7Fd3LpW9sYbC1qH"
 *             description:
 *               type: string
 *               minLength: 1
 *               maxLength: 255
 *               example: "Cena del viernes"
 *             amount:
 *               type: string
 *               description: >
 *                 Monto como cadena decimal, máximo 10 dígitos enteros y 2 decimales.
 *                 Se envía como texto para no perder precisión.
 *               pattern: '^\d{1,10}(\.\d{1,2})?$'
 *               example: "150.50"
 *
 *     DebtIdentityResponse:
 *       type: object
 *       required: [id]
 *       properties:
 *         id:
 *           type: integer
 *           example: 42
 *
 *     Debt:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 42
 *         creatorId:
 *           type: string
 *           description: Quien registró la deuda.
 *         debtorId:
 *           type: string
 *         creditorId:
 *           type: string
 *           nullable: true
 *         reconciledIntoId:
 *           type: integer
 *           nullable: true
 *           description: Deuda que absorbió a esta tras una reconciliación.
 *         description:
 *           type: string
 *         amount:
 *           type: string
 *           example: "150.50"
 *         isSettled:
 *           type: boolean
 *           description: Derivado de los pagos confirmados. Nunca se envía desde el cliente.
 *         isConfirmed:
 *           type: boolean
 *           nullable: true
 *           description: '`null` = pendiente de que la contraparte responda.'
 *         status:
 *           type: string
 *           enum: [A, I]
 *           description: '`A` activa, `I` inactiva (baja lógica).'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
export {};
