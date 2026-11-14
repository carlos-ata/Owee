import express, { type Express } from "express";
import cors from "cors";
import { createServer } from "http";

import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import swaggerOptions from "#docs/swagger-options.js";

import {
  logErrors,
  errorHandler,
  wrapErrors,
} from "#infrastructure/middleware/error.js";
import { responseExtender } from "#infrastructure/middleware/response.js";
import { notFound } from "#infrastructure/middleware/not-found.js";

import v1Routes from "#routes/v1/index.js";

const app: Express = express();
const server = createServer(app);

const specs = swaggerJsDoc(swaggerOptions);

app.use(cors());
app.use(express.json());

app.set("trust proxy", true);

app.use("/api/v1/docs", swaggerUi.serve, swaggerUi.setup(specs));

app.use(responseExtender);
app.use("/api/v1", v1Routes);
app.use(notFound);
app.use(logErrors);
app.use(wrapErrors);
app.use(errorHandler);

export { app, server };
