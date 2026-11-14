import { betterAuth } from "better-auth";
import { Pool } from "pg";
import config from "#config/config.js";

export const auth = betterAuth({
  database: new Pool({ connectionString: config.dataBaseUrl.owee }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
  user: {
    additionalFields: {
      lastNames: { type: "string", required: true },
      status: {
        type: "string",
        required: true,
        defaultValue: "A",
      },
    },
  },
});
