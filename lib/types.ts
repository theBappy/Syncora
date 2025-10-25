import { GroupedReactionSchemaType } from "@/app/schemas/message-schema";
import { Message } from "./generated/prisma";

// will stored shared types
export type MessageListItem = Message & {
  repliesCount: number;
  reactions: GroupedReactionSchemaType[];
};
