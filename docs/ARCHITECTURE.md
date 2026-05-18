# Network Docs Studio Architecture

## Product Surface

Network Docs Studio is organized around diagrams published at stable URLs such as:

```text
/connections/main-network
```

The first screen is the editor, not a marketing page. It includes:

- Device palette with routers, switches, firewalls, servers, cloud, database, wireless, and endpoints
- Infinite React Flow canvas with pan, zoom, minimap, snap-to-grid, multi-select, and drag linking
- Search-driven node filtering
- Inspector for device metadata and connection styles
- Undo/redo and auto-alignment
- Publishing/export command bar for public/private links and PNG/SVG/PDF workflows

## Monorepo Layout

```text
apps/web          React, TypeScript, TailwindCSS, React Flow, Framer Motion
apps/api          Express, TypeScript, Prisma/SQLite REST API, WebSocket rooms
packages/shared   Shared Zod schemas and TypeScript domain types
docs              Architecture and implementation notes
```

## Database Schema

The Prisma schema in `apps/api/prisma/schema.prisma` models:

- `Team`: workspace boundary for users and diagrams
- `User`: team membership and role
- `Diagram`: named topology with unique team slug and visibility
- `Device`: diagram node metadata, position, status, color, type, notes, and location
- `Connection`: source/target links with labels, arrows, media, kind, color, and dashed state
- `ShareLink`: read-only/public sharing tokens
- `ExportJob`: asynchronous PNG/SVG/PDF export tracking
- `AuditEvent`: collaboration and change history

## API Structure

Base path: `/api/v1`

```text
GET  /health
GET  /api/v1/diagrams
GET  /api/v1/diagrams/:slug
PUT  /api/v1/diagrams/:slug
POST /api/v1/diagrams/:slug/share-links
POST /api/v1/diagrams/:slug/exports
WS   /ws
```

The API uses Prisma with SQLite for local persistence. On startup it runs `prisma/sqlite-init.sql` to ensure tables exist, then seeds the default diagram if the database is empty. The schema remains Prisma-based so the datasource can later be switched back to PostgreSQL for multi-team production hosting.

## Realtime Collaboration

The WebSocket server uses diagram-scoped rooms. Clients join with:

```json
{ "type": "join", "diagramId": "diagram-main" }
```

Then broadcast cursor, presence, and diagram update events to peers in the same room.

## Security And Production Concerns

- Helmet, CORS, compression, JSON limits, and rate limiting are enabled in the API
- Diagram visibility and share links are modeled separately
- Team ownership is part of the database model
- Docker Compose includes Postgres, API, and web services
- Large diagram performance is delegated to React Flow virtualization-friendly primitives, memoized node/edge conversion, and concise node payloads

## Future Feature Hooks

- Auto-discovery: add ingestion workers and source models for SNMP, LLDP, CDP, cloud APIs
- SNMP integration: model credentials separately, encrypt secrets, and record scan snapshots
- Live monitoring: attach status observations to devices and stream state changes through WebSockets
- AI-assisted topology generation: convert prompts/logs/scans into draft devices and connections
- Automatic layout: add server-side layout jobs using DAG or force-directed layout engines
