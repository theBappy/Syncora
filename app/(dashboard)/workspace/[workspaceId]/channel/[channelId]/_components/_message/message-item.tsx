import { useCallback, useState } from "react";
import { SafeContent } from "@/components/rich-text-editor/safe-content";
import { getAvatar } from "@/lib/get-avatar";
import Image from "next/image";
import { MessageHoverToolbar } from "../_toolbar";
import { EditMessage } from "../_toolbar/edit-message";
import { MessageListItem } from "@/lib/types";
import { MessageSquare } from "lucide-react";
import { useThread } from "@/providers/thread-provider";
import { orpc } from "@/lib/orpc";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  message: MessageListItem;
  currentUserId: string;
}

export function MessageItem({ message, currentUserId }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const { openThread } = useThread();

  const queryClient = useQueryClient();

  const prefetchThread = useCallback(() => {
    const options = orpc.message.thread.list.queryOptions({
      input: {
        messageId: message.id,
      },
    });
    queryClient
      .prefetchQuery({
        ...options,
        staleTime: 60_000,
      })
      .catch(() => {});
  }, [message.id, queryClient]);

  return (
    <div className="flex space-x-3 relative p-3 rounded-lg group hover:bg-muted/50">
      <Image
        src={getAvatar(message.authorAvatar, message.authorEmail)}
        alt="user-avatar"
        width={32}
        height={32}
        className="size-8 rounded-lg"
      />
      <div className="flex-1 space-y-1 min-w-0">
        <div className="flex items-center gap-x-2">
          <p className="font-medium leading-none">{message.authorName}</p>
          <p className="text-xs text-muted-foreground leading-none">
            {new Intl.DateTimeFormat("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }).format(message.createdAt)}{" "}
            {new Intl.DateTimeFormat("en-GB", {
              hour12: false,
              hour: "2-digit",
              minute: "2-digit",
            }).format(message.createdAt)}
          </p>
        </div>
        {isEditing ? (
          <EditMessage
            onCancel={() => setIsEditing(false)}
            onSave={() => setIsEditing(false)}
            message={message}
          />
        ) : (
          <>
            <SafeContent
              className="text-sm break-words prose dark:prose-invert max-w-none marker:text-primary"
              content={JSON.parse(message.content)}
            />
            {message.imageUrl && (
              <div className="mt-3">
                <Image
                  src={message.imageUrl}
                  alt="Message Attachment"
                  width={512}
                  height={512}
                  className="rounded-md max-h-[320px] w-auto object-contain"
                />
              </div>
            )}
            {message.repliesCount > 0 && (
              <button
                onClick={() => openThread(message.id)}
                className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border cursor-pointer"
                type="button"
                onMouseEnter={prefetchThread}
                onFocus={prefetchThread}
              >
                <MessageSquare className="size-3.5" />
                <span>
                  {message.repliesCount}{" "}
                  {message.repliesCount === 1 ? "reply" : "replies"}{" "}
                </span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                  View Thread
                </span>
              </button>
            )}
          </>
        )}
      </div>
      <MessageHoverToolbar
        messageId={message.id}
        canEdit={message.authorId === currentUserId}
        onEdit={() => setIsEditing(true)}
      />
    </div>
  );
}
