import { SafeContent } from "@/components/rich-text-editor/safe-content";
import { Message } from "@/lib/generated/prisma";
import { getAvatar } from "@/lib/get-avatar";
import Image from "next/image";

interface Props {
  message: Message;
}

export function MessageItem({ message }: Props) {
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
        <SafeContent className="text-sm break-words prose dark:prose-invert max-w-none marker:text-primary" content={JSON.parse(message.content)} />
      </div>
    </div>
  );
}
