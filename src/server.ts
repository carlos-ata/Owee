import { server } from "./app.js";
import config from "#config/config.js";

server.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
