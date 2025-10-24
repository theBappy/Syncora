import { Button } from "@/components/ui/button";
import { MessageSquare, X } from "lucide-react";
import Image from "next/image";
import { ThreadReply } from "./thread-reply";
import { ThreadReplyForm } from "./thread-reply-form";
import { useThread } from "@/providers/thread-provider";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import { SafeContent } from "@/components/rich-text-editor/safe-content";

export function ThreadSidebar() {
  const { selectedThreadId, closeThread } = useThread();
  const { data, isLoading } = useQuery(
    orpc.message.thread.list.queryOptions({
      input: {
        messageId: selectedThreadId!,
      },
      enabled: Boolean(selectedThreadId),
    })
  );

  return (
    <div className="w-[30rem] border-l flex flex-col h-full">
      {/* header */}
      <div className="border-b h-14 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          <span className="">Thread</span>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={closeThread} variant="outline" size="icon">
            <X className="size-4" />
          </Button>
        </div>
      </div>
      {/* main content */}
      <div className="flex-1 overflow-y-auto">
        {data && (
          <>
            <div className="p-4 border-b bg-muted/20">
              <div className="flex space-x-3">
                <Image
                  src={data.parent.authorAvatar}
                  alt="author-image"
                  width={32}
                  height={32}
                  className="size-8 rounded-full shrink-0"
                />
                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm">
                      {data.parent.authorName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Intl.DateTimeFormat("en-US", {
                        hour: "numeric",
                        minute: "numeric",
                        hour12: true,
                        month: "short",
                        day: "numeric",
                      }).format(data.parent.createdAt)}
                    </span>
                  </div>
                  <SafeContent
                    content={JSON.parse(data.parent.content)}
                    className="text-sm break-words prose dark:prose-invert max-w-none"
                  />
                </div>
              </div>
            </div>
            {/* thread replies */}
            <div className="p-2">
              <p className="text-xs text-muted-foreground mb-3 px-2">
                {data.messages.length} replies
              </p>
              <div className="space-y-1">
                {data.messages.map((reply) => (
                  <ThreadReply message={reply} key={reply.id} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* thread reply */}
      <div className="border-top p-4">
        <ThreadReplyForm threadId={selectedThreadId!} />
      </div>
    </div>
  );
}
