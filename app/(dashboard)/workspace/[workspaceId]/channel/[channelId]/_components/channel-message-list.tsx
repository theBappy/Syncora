"use client";

import { orpc } from "@/lib/orpc";
import { MessageItem } from "./_message/message-item";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

export function ChannelMessageList() {
  const { channelId } = useParams<{ channelId: string }>();
  const { data } = useQuery(
    orpc.message.list.queryOptions({
      input: {
        channelId: channelId,
      },
    })
  );
  return (
    <div className="relative h-full">
      <div className="h-full overflow-y-auto px-4">
        {data?.map((message) => (
          <MessageItem key={message.id} message={message} />
        ))}
      </div>
    </div>
  );
}
