import { Message } from "./generated/prisma";

// will stored shared types
export type MessageListItem = Message & {
  repliesCount: number;
};
