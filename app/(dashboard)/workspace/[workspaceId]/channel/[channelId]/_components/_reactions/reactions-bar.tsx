import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { EmojiReactions } from "./emoji-reactions";
import { orpc } from "@/lib/orpc";
import { toast } from "sonner";
import { GroupedReactionSchemaType } from "@/app/schemas/message-schema";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useParams } from "next/navigation";
import { MessageListItem } from "@/lib/types";

type ThreadContext = { type: "thread"; threadId: string };
type ListContext = { type: "list"; channelId: string };

interface ReactionsBarProps {
  messageId: string;
  reactions: GroupedReactionSchemaType[];
  context?: ThreadContext | ListContext;
}

type MessagePage = {
  items: MessageListItem[];
  nextCursor?: string;
};

type InfiniteReplies = InfiniteData<MessagePage>;

export function ReactionsBar({
  messageId,
  reactions,
  context,
}: ReactionsBarProps) {
  const { channelId } = useParams<{ channelId: string }>();
  const queryClient = useQueryClient();

  const toggleMutation = useMutation(
    orpc.message.reaction.toggle.mutationOptions({
      onMutate: async (vars: { messageId: string; emoji: string }) => {
        const bump = (rxns: GroupedReactionSchemaType[]) => {
          const found = rxns.find((r) => r.emoji === vars.emoji);
          if (found) {
            const dec = found.count - 1;
            return dec <= 0
              ? rxns.filter((r) => r.emoji !== found.emoji)
              : rxns.map((r) =>
                  r.emoji === found.emoji
                    ? { ...r, count: dec, reactedByMe: false }
                    : r
                );
          }
          return [...rxns, { emoji: vars.emoji, count: 1, reactedByMe: true }];
        };

        const isThread = context && context.type === "thread";

        if (isThread) {
          const listOptions = orpc.message.thread.list.queryOptions({
            input: {
              messageId: context.threadId,
            },
          });
          await queryClient.cancelQueries({ queryKey: listOptions.queryKey });
          const prevThread = queryClient.getQueryData(listOptions.queryKey);

          queryClient.setQueryData(listOptions.queryKey, (staleData) => {
            if (!staleData) return staleData;
            if (vars.messageId === context.threadId) {
              return {
                ...staleData,
                parent: {
                  ...staleData.parent,
                  reactions: bump(staleData.parent.reactions),
                },
              };
            }
            return {
              ...staleData,
              messages: staleData.messages.map((msg) =>
                msg.id === vars.messageId
                  ? { ...msg, reactions: bump(msg.reactions) }
                  : msg
              ),
            };
          });

          return {
            prevThread,
            threadQueryKey: listOptions.queryKey,
          };
        }

        const listKey = ["message.list", channelId];
        await queryClient.cancelQueries({ queryKey: listKey });
        const previous = queryClient.getQueryData(listKey);

        queryClient.setQueryData<InfiniteReplies>(listKey, (existingData) => {
          if (!existingData) return existingData;
          const pages = existingData.pages.map((page) => ({
            ...page,
            items: page.items.map((msg) => {
              if (msg.id !== messageId) return msg;
              const current = msg.reactions;

              return {
                ...msg,
                reactions: bump(current),
              };
            }),
          }));
          return {
            ...existingData,
            pages,
          };
        });
        return {
          previous,
          listKey,
        };
      },
      onSuccess: () => {
        return toast.success("Reaction updated");
      },
      onError: (_err, _vars, ctx) => {
        if (ctx?.threadQueryKey && ctx.prevThread) {
          queryClient.setQueryData(ctx.threadQueryKey, ctx.prevThread);
        }
        if (ctx?.previous && ctx.listKey) {
          queryClient.setQueryData(ctx.listKey, ctx.previous);
        }
        return toast.error("Emoji add failed");
      },
    })
  );
  const handleToggle = (emoji: string) => {
    toggleMutation.mutate({ emoji, messageId });
  };

  return (
    <div className="mt-1 flex items-center gap-1">
      {reactions.map((r) => (
        <Button
          variant="secondary"
          size="sm"
          className={cn(
            "h-6 px-2 text-xs",
            r.reactedByMe && "bg-primary/10 border-primary border"
          )}
          onClick={() => handleToggle(r.emoji)}
          key={r.emoji}
          type="button"
        >
          <span>{r.emoji}</span>
          <span>{r.count}</span>
        </Button>
      ))}
      <EmojiReactions onSelect={handleToggle} />
    </div>
  );
}
