import { Response } from "express";

export type SseEventType =
  | "activity"
  | "station.updated"
  | "schedule.updated"
  | "ping";

const clients: Set<Response> = new Set();

export const sseService = {
  addClient(res: Response) {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    res.write("\n");
    clients.add(res);

    res.on("close", () => {
      clients.delete(res);
    });
  },

  broadcast(event: SseEventType, data: unknown) {
    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const client of clients) {
      client.write(message);
    }
  },

  getClientCount() {
    return clients.size;
  },
};

// Heartbeat — keeps connections alive, lets clients detect stale streams
setInterval(() => {
  if (clients.size > 0) {
    sseService.broadcast("ping", { ts: Date.now() });
  }
}, 30_000);
