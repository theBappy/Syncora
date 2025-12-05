// index.ts

import { routePartykitRequest, Server, Connection } from "partyserver";

type Env = { Chat: DurableObjectNamespace<Chat> };

// Define your Server
export class Chat extends Server {
  onConnect(connection: Connection) {
    console.log("Connected", connection.id, "to server", this.name);
  }

  onMessage(connection: Connection, message: string) {
    console.log("Message from", connection.id, ":", message);
    // Send the message to every other connection
    this.broadcast(message, [connection.id]);
  }
}

export default {
  // Set up your fetch handler to use configured Servers
  async fetch(request: Request, env: Env): Promise<Response> {
    return (
      (await routePartykitRequest(request, env)) ||
      new Response("Not Found", { status: 404 })
    );
  },
} satisfies ExportedHandler<Env>;
