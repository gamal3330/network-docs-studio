import http from "node:http";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { initializeDatabase } from "./db/prisma.js";
import { ensureAdminUser } from "./modules/auth/auth.seed.js";
import { attachCollaborationServer } from "./modules/collaboration/collaboration.js";

const server = http.createServer(createApp());

attachCollaborationServer(server);

await initializeDatabase();
await ensureAdminUser();

server.listen(env.PORT, () => {
  console.log(`API listening on http://localhost:${env.PORT}`);
});
