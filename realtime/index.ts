// index.ts

import { z } from "zod";
import { routePartykitRequest, Server, Connection } from "partyserver";
import { PresenceMessageSchema, UserSchema } from "../app/schemas/realtime";

type Env = { Chat: DurableObjectNamespace<Chat> };
const ConnectionStateSchema = z
  .object({
    user: UserSchema.nullable().optional(),
  })
  .nullable();

type ConnectionState = z.infer<typeof ConnectionStateSchema>;

type Message = z.infer<typeof PresenceMessageSchema>;

// Define your Server
export class Chat extends Server {
  static options = {
    hibernate: true,
  };
  onConnect(connection: Connection) {
    console.log("Connected", connection.id, "to server", this.name);
    //send current presence to the newly connection user
    connection.send(JSON.stringify(this.getPresenceMessage()));
  }

  onClose(connection: Connection) {
    console.log(`User disconnected: ${connection.id}`);
    this.updateUsers();
  }
  onError(connection: Connection) {
    console.log(`Connection error ${connection.id}`);
    this.updateUsers();
  }

  onMessage(connection: Connection, message: string) {
    try {
      const parsed = JSON.parse(message);
      const presence = PresenceMessageSchema.safeParse(parsed);
      if (presence.success) {
        if (presence.data.type === "add-user") {
          //store user info on the connection
          this.setConnectionState(connection, { user: presence.data.payload });

          //broadcast updated presence to all clients
          this.updateUsers();

          return;
        }
        if (presence.data.type === "remove-user") {
          this.setConnectionState(connection, null);
          this.updateUsers();

          return;
        }
      }
    } catch (error) {
      console.log("Error processing message: ", error);
    }
  }
  updateUsers() {
    const presenceMessage = JSON.stringify(this.getPresenceMessage());
    //use partyserver's built-in broadcast method
    this.broadcast(presenceMessage);
  }
  getPresenceMessage() {
    return {
      type: "presence",
      payload: { users: this.getUsers() },
    } satisfies Message;
  }
  getUsers() {
    const users = new Map();
    for (const connection of this.getConnections()) {
      const state = this.getConnectionState(connection);
      if (state?.user) {
        users.set(state.user.id, state.user);
      }
    }
    return Array.from(users.values());
  }
  private setConnectionState(connection: Connection, state: ConnectionState) {
    connection.setState(state);
  }
  private getConnectionState(connection: Connection): ConnectionState {
    const result = ConnectionStateSchema.safeParse(connection.state);
    if (result.success) {
      return result.data;
    }
    return null;
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
