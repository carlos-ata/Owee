export const HTTP_ERRORS = {
  // 4xx: CLIENT ERROR
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  NOT_ACCEPTABLE: 406,
  PROXY_AUTHENTICATION_REQUIRED: 407,
  REQUEST_TIMEOUT: 408,
  CONFLICT: 409,
  GONE: 410,
  LENGTH_REQUIRED: 411,
  PRECONDITION_FAILED: 412,
  PAYLOAD_TOO_LARGE: 413,
  URI_TOO_LONG: 414,
  UNSUPPORTED_MEDIA_TYPE: 415,
  RANGE_NOT_SATISFIABLE: 416,
  EXPECTATION_FAILED: 417,
  IM_A_TEAPOT: 418,
  MISDIRECTED_REQUEST: 421,
  UNPROCESSABLE_ENTITY: 422,
  LOCKED: 423,
  FAILED_DEPENDENCY: 424,
  TOO_EARLY: 425,
  UPGRADE_REQUIRED: 426,
  PRECONDITION_REQUIRED: 428,
  TOO_MANY_REQUESTS: 429,
  REQUEST_HEADER_FIELDS_TOO_LARGE: 431,
  UNAVAILABLE_FOR_LEGAL_REASONS: 451,

  // 5xx: SERVER ERROR
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
  HTTP_VERSION_NOT_SUPPORTED: 505,
  VARIANT_ALSO_NEGOTIATES: 506,
  INSUFFICIENT_STORAGE: 507,
  LOOP_DETECTED: 508,
  NOT_EXTENDED: 510,
  NETWORK_AUTHENTICATION_REQUIRED: 511,
} as const;

export type ErrorCode = keyof typeof HTTP_ERRORS;

export class CustomError extends Error {
  code: ErrorCode;
  status: number;

  constructor(code: ErrorCode, message?: string) {
    super(message ?? code);
    this.code = code;
    this.status = HTTP_ERRORS[code];
  }
}

export const error = {
  // 4xx: CLIENT ERROR
  badRequest: (message?: string) => new CustomError("BAD_REQUEST", message),
  unauthorized: (message?: string) => new CustomError("UNAUTHORIZED", message),
  paymentRequired: (message?: string) =>
    new CustomError("PAYMENT_REQUIRED", message),
  forbidden: (message?: string) => new CustomError("FORBIDDEN", message),
  notFound: (message?: string) => new CustomError("NOT_FOUND", message),
  methodNotAllowed: (message?: string) =>
    new CustomError("METHOD_NOT_ALLOWED", message),
  notAcceptable: (message?: string) =>
    new CustomError("NOT_ACCEPTABLE", message),
  proxyAuthenticationRequired: (message?: string) =>
    new CustomError("PROXY_AUTHENTICATION_REQUIRED", message),
  requestTimeout: (message?: string) =>
    new CustomError("REQUEST_TIMEOUT", message),
  conflict: (message?: string) => new CustomError("CONFLICT", message),
  gone: (message?: string) => new CustomError("GONE", message),
  lengthRequired: (message?: string) =>
    new CustomError("LENGTH_REQUIRED", message),
  preconditionFailed: (message?: string) =>
    new CustomError("PRECONDITION_FAILED", message),
  payloadTooLarge: (message?: string) =>
    new CustomError("PAYLOAD_TOO_LARGE", message),
  uriTooLong: (message?: string) => new CustomError("URI_TOO_LONG", message),
  unsupportedMediaType: (message?: string) =>
    new CustomError("UNSUPPORTED_MEDIA_TYPE", message),
  rangeNotSatisfiable: (message?: string) =>
    new CustomError("RANGE_NOT_SATISFIABLE", message),
  expectationFailed: (message?: string) =>
    new CustomError("EXPECTATION_FAILED", message),
  imATeapot: (message?: string) => new CustomError("IM_A_TEAPOT", message),
  misdirectedRequest: (message?: string) =>
    new CustomError("MISDIRECTED_REQUEST", message),
  unprocessableEntity: (message?: string) =>
    new CustomError("UNPROCESSABLE_ENTITY", message),
  locked: (message?: string) => new CustomError("LOCKED", message),
  failedDependency: (message?: string) =>
    new CustomError("FAILED_DEPENDENCY", message),
  tooEarly: (message?: string) => new CustomError("TOO_EARLY", message),
  upgradeRequired: (message?: string) =>
    new CustomError("UPGRADE_REQUIRED", message),
  preconditionRequired: (message?: string) =>
    new CustomError("PRECONDITION_REQUIRED", message),
  tooManyRequests: (message?: string) =>
    new CustomError("TOO_MANY_REQUESTS", message),
  requestHeaderFieldsTooLarge: (message?: string) =>
    new CustomError("REQUEST_HEADER_FIELDS_TOO_LARGE", message),
  unavailableForLegalReasons: (message?: string) =>
    new CustomError("UNAVAILABLE_FOR_LEGAL_REASONS", message),

  // 5xx: SERER ERROR
  internalServerError: (message?: string) =>
    new CustomError("INTERNAL_SERVER_ERROR", message),
  notImplemented: (message?: string) =>
    new CustomError("NOT_IMPLEMENTED", message),
  badGateway: (message?: string) => new CustomError("BAD_GATEWAY", message),
  serviceUnavailable: (message?: string) =>
    new CustomError("SERVICE_UNAVAILABLE", message),
  gatewayTimeout: (message?: string) =>
    new CustomError("GATEWAY_TIMEOUT", message),
  httpVersionNotSupported: (message?: string) =>
    new CustomError("HTTP_VERSION_NOT_SUPPORTED", message),
  variantAlsoNegotiates: (message?: string) =>
    new CustomError("VARIANT_ALSO_NEGOTIATES", message),
  insufficientStorage: (message?: string) =>
    new CustomError("INSUFFICIENT_STORAGE", message),
  loopDetected: (message?: string) => new CustomError("LOOP_DETECTED", message),
  notExtended: (message?: string) => new CustomError("NOT_EXTENDED", message),
  networkAuthenticationRequired: (message?: string) =>
    new CustomError("NETWORK_AUTHENTICATION_REQUIRED", message),
};
