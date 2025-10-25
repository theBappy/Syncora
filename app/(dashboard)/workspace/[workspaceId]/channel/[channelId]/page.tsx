"use client";

import { useParams } from "next/navigation";
import { MessageInputForm } from "./_components/_message/message-input-form";
import { ChannelHeader } from "./_components/channel-header";
import { ChannelMessageList } from "./_components/channel-message-list";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs";
import { Skeleton } from "@/components/ui/skeleton";
import { ThreadSidebar } from "./_components/_thread/thread-sidebar";
import { ThreadProvider, useThread } from "@/providers/thread-provider";

const ChannelPageMain = () => {
  const { channelId } = useParams<{ channelId: string }>();
  const {isThreadOpen} = useThread()
  const { data, error, isLoading } = useQuery(
    orpc.channel.get.queryOptions({
      input: {
        channelId: channelId,
      },
    })
  );
  if (error) {
    return <p>error</p>;
  }
  return (
    <div className="flex h-screen w-full">
      {/* main channel area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* fixed header */}
        {isLoading ? (
          <div className="flex items-center justify-between h-14 px-4 border-b">
            <Skeleton className="h-8 w-40" />
            <div className="flex items-center space-x-2">
              <Skeleton className="h-8 w-28" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="size-8" />
            </div>
          </div>
        ) : (
          <ChannelHeader channelName={data?.channelName} />
        )}
        {/* scrollable messages area */}
        <div className="flex-1 overflow-hidden mb-4">
          <ChannelMessageList />
        </div>
        {/* fixed message input */}
        <div className="border-t bg-background p-4">
          <MessageInputForm
            channelId={channelId}
            user={data?.currentUser as KindeUser<Record<string, unknown>>}
          />
        </div>
      </div>
      {isThreadOpen && (
        <ThreadSidebar user={data?.currentUser as KindeUser<Record<string, unknown>>} />
      )}
    </div>
  );
};

const ThisIsTheChannelPage = () => {
  return (
    <ThreadProvider>
      <ChannelPageMain />
    </ThreadProvider>
  );
};

export default ThisIsTheChannelPage;
