import type { Server } from "node:http";
import { WebSocketServer } from "ws";

type ClientMessage = {
  type: "join" | "presence" | "diagram:update" | "cursor";
  diagramId?: string;
  payload?: unknown;
};

export function attachCollaborationServer(server: Server) {
  const wss = new WebSocketServer({ server, path: "/ws" });
  const rooms = new Map<string, Set<WebSocket>>();

  wss.on("connection", (socket) => {
    let activeRoom: string | undefined;

    socket.on("message", (raw) => {
      const message = safeParse(raw.toString());
      if (!message) return;

      if (message.type === "join" && message.diagramId) {
        activeRoom = message.diagramId;
        const room = rooms.get(activeRoom) ?? new Set<WebSocket>();
        room.add(socket as unknown as WebSocket);
        rooms.set(activeRoom, room);
        socket.send(JSON.stringify({ type: "presence", payload: { connected: room.size } }));
        return;
      }

      if (!activeRoom) return;
      const peers = rooms.get(activeRoom) ?? new Set<WebSocket>();

      for (const peer of peers) {
        if (peer !== (socket as unknown as WebSocket) && peer.readyState === 1) {
          peer.send(JSON.stringify(message));
        }
      }
    });

    socket.on("close", () => {
      if (!activeRoom) return;
      const room = rooms.get(activeRoom);
      room?.delete(socket as unknown as WebSocket);
      if (room?.size === 0) rooms.delete(activeRoom);
    });
  });
}

function safeParse(raw: string): ClientMessage | undefined {
  try {
    return JSON.parse(raw) as ClientMessage;
  } catch {
    return undefined;
  }
}
