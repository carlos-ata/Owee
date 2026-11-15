import config from "#config/config.js";

export default {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Owee API",
      version: "1.0.0",
      description:
        "Red social de deudas: registro de deudas entre usuarios, confirmación de la contraparte, pagos y saldos.",
    },
    servers: [
      {
        url: `${config.baseUrl ?? "http://localhost:3000"}/api/v1`,
        description: "v1",
      },
    ],
    tags: [
      { name: "Auth", description: "Registro, inicio y cierre de sesión" },
      { name: "Debt", description: "Deudas: crear, confirmar, cancelar" },
      { name: "Balance", description: "Saldo del usuario autenticado" },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "better-auth.session_token",
          description:
            "Cookie de sesión emitida por `POST /auth/sign-in`. El cliente debe enviar las peticiones con `credentials: \"include\"`.",
        },
      },
      schemas: {
        ApiSuccess: {
          type: "object",
          required: ["statusCode", "data", "error"],
          properties: {
            statusCode: { type: "integer", example: 200 },
            data: { nullable: true },
            error: { nullable: true, example: null },
          },
        },
        ApiError: {
          type: "object",
          required: ["error", "data"],
          properties: {
            error: {
              type: "object",
              properties: {
                statusCode: { type: "integer", example: 404 },
                error: { type: "string", example: "Not Found" },
                message: { type: "string", example: "La deuda no existe" },
              },
            },
            data: { type: "object", example: {} },
          },
        },
        ValidationError: {
          type: "object",
          properties: {
            error: {
              type: "object",
              properties: {
                statusCode: { type: "integer", example: 400 },
                message: { type: "string", example: "Data is invalid" },
                error: {
                  type: "object",
                  properties: {
                    isValidation: { type: "boolean", example: true },
                    message: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          field: { type: "string", example: "debt.amount" },
                          message: {
                            type: "string",
                            example: "El monto debe ser mayor a 0",
                          },
                          code: { type: "string", example: "custom" },
                        },
                      },
                    },
                  },
                },
              },
            },
            data: { type: "object", example: {} },
          },
        },
      },
      responses: {
        BadRequest: {
          description: "Regla de negocio violada",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiError" },
            },
          },
        },
        ValidationFailed: {
          description: "El cuerpo, los parámetros o la query no pasaron la validación",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ValidationError" },
            },
          },
        },
        Unauthorized: {
          description: "No hay sesión activa",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiError" },
            },
          },
        },
        Forbidden: {
          description: "La sesión es válida pero no tiene permiso sobre el recurso",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiError" },
            },
          },
        },
        NotFound: {
          description: "El recurso no existe",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiError" },
            },
          },
        },
        Conflict: {
          description: "El recurso está en un estado incompatible con la operación",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiError" },
            },
          },
        },
      },
    },
  },
  // swagger-jsdoc lee los comentarios del CÓDIGO FUENTE: los routers en .ts.
  // `tsc` elimina los comentarios al compilar, así que el spec se genera siempre
  // desde ./src, también en producción.
  apis: [
    "./src/modules/**/infrastructure/http/*.router.ts",
    "./src/infrastructure/docs/schemas/*.ts",
  ],
};
