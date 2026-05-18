# Network Docs Studio

A modern web application for creating, publishing, and collaborating on interactive network topology diagrams.

## Architecture

- `apps/web`: React, TypeScript, TailwindCSS, React Flow, Framer Motion
- `apps/api`: Express, TypeScript, Prisma, SQLite REST API, WebSocket collaboration
- `packages/shared`: Shared domain types and validation schemas
- `docker-compose.yml`: Postgres, API, and web services

## Local Development

```bash
npm install
npm run dev
```

The frontend runs on `http://localhost:5173`.

To run the API:

```bash
cp apps/api/.env.example apps/api/.env
npm run prisma:generate --workspace @nds/api
npm run db:init --workspace @nds/api
npm run dev:api
```

## Production Shape

- API routes are versioned under `/api/v1`
- Diagrams can be public/private and are addressed by slug, for URLs like `/connections/main-network`
- Prisma models cover teams, users, diagrams, devices, connections, shares, exports, and audit events
- Development persistence uses SQLite at `apps/api/prisma/dev.db`
- WebSocket rooms are scoped to diagram IDs for realtime collaboration
- Docker services include health checks and isolated app images
