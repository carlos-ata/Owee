import config from "#config/config.js";
import { definePrismaConfig } from "@prisma/cli-engine";
import { defineConfig as ormConfig } from "@prisma/orm-postgres/config";

export default definePrismaConfig({
  orm: ormConfig({
    contract: "./src/infrastructure/database/prisma/contract.prisma",
    db: {
      connection: config.dataBaseUrl.owee!,
    },
  }),
});
