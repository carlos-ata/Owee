/**
 * Componentes OpenAPI del módulo `auth`.
 *
 * @openapi
 * components:
 *   schemas:
 *     SignUpRequest:
 *       type: object
 *       required: [user]
 *       properties:
 *         user:
 *           type: object
 *           required: [name, lastNames, email, password]
 *           properties:
 *             name:
 *               type: string
 *               minLength: 1
 *               maxLength: 100
 *               example: "Carlos"
 *             lastNames:
 *               type: string
 *               minLength: 1
 *               maxLength: 100
 *               example: "Pérez Gómez"
 *             email:
 *               type: string
 *               format: email
 *               example: "carlos@owee.app"
 *             password:
 *               type: string
 *               format: password
 *               minLength: 8
 *               maxLength: 128
 *
 *     SignInRequest:
 *       type: object
 *       required: [user]
 *       properties:
 *         user:
 *           type: object
 *           required: [email, password]
 *           properties:
 *             email:
 *               type: string
 *               format: email
 *               example: "carlos@owee.app"
 *             password:
 *               type: string
 *               format: password
 *
 *     PublicUser:
 *       type: object
 *       properties:
 *         user:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               example: "Carlos"
 *             lastNames:
 *               type: string
 *               example: "Pérez Gómez"
 *             email:
 *               type: string
 *               format: email
 *               example: "carlos@owee.app"
 */
export {};
