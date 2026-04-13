import { Response } from "express";

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

  broadcast(event: string, data: unknown) {
    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    clients.forEach((client) => {
      client.write(message);
    });
  },

  getClientCount() {
    return clients.size;
  },
};
