"use client"

import { useParams } from "next/navigation";
import { MessageInputForm } from "./_components/_message/message-input-form";
import { ChannelHeader } from "./_components/channel-header";
import { ChannelMessageList } from "./_components/channel-message-list";

const ChannelPageMain = () => {
  const {channelId} = useParams<{channelId: string}>()
  return (
    <div className="flex h-screen w-full">
      {/* main channel area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* fixed header */}
        <ChannelHeader />
        {/* scrollable messages area */}
        <div className="flex-1 overflow-hidden mb-4">
          <ChannelMessageList />
        </div>
        {/* fixed message input */}
        <div className="border-t bg-background p-4">
          <MessageInputForm channelId={channelId} />
        </div>
      </div>
    </div>
  );
};

export default ChannelPageMain;
