import { SafeContent } from "@/components/rich-text-editor/safe-content";
import Image from "next/image";
import { ReactionsBar } from "../_reactions/reactions-bar";
import { MessageListItem } from "@/lib/types";

interface ThreadReplyProps {
  message: MessageListItem;
  selectedThreadId: string;
}

export function ThreadReply({ message, selectedThreadId }: ThreadReplyProps) {
  let parsedContent: any;

  try {
    parsedContent =
      typeof message.content === "string"
        ? JSON.parse(message.content)
        : message.content;
  } catch {
    parsedContent = message.content || {
      type: "text",
      content: "Invalid message format",
    };
  }

  return (
    <div className="flex space-x-3 p-3 hover:bg-muted/30 rounded-lg">
      <Image
        src={message.authorAvatar}
        alt="author-image"
        width={32}
        height={32}
        className="size-8 rounded-full shrink-0 mt-1"
      />
      <div className="flex-1 space-y-1 min-w-0">
        <div className="flex items-center space-x-2">
          <span className="font-medium text-sm">{message.authorName}</span>
          <span className="text-xs text-muted-foreground">
            {new Intl.DateTimeFormat("en-US", {
              hour: "numeric",
              minute: "numeric",
              hour12: true,
              month: "short",
              day: "numeric",
            }).format(new Date(message.createdAt))}
          </span>
        </div>

        <SafeContent
          content={parsedContent}
          className="text-sm break-words prose dark:prose-invert max-w-none marker:text-primary"
        />
        {message.imageUrl && (
          <div className="mt-2">
            <Image
              src={message.imageUrl}
              alt="image-attachment"
              width={512}
              height={512}
              className="rounded-md max-h-[320px] w-auto object-contain"
            />
          </div>
        )}
        <ReactionsBar
          context={{ type: "thread", threadId: selectedThreadId }}
          reactions={message.reactions}
          messageId={message.id}
        />
      </div>
    </div>
  );
}
