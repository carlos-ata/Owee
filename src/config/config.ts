import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(process.cwd(), "src/config/.env"),
});

export default {
  port: process.env.PORT || 3000,
  isProduction: process.env.NODE_ENV === "production",
  baseUrl: process.env.BASE_URL,
  dataBaseUrl: {
    owee: process.env.OWEE_DATABASE_URL,
  },
  secret: {
    betterAuth: process.env.BETTER_AUTH_SECRET,
  },
};
