import { useMutation, useQueryClient } from "@tanstack/react-query";
import { EmojiReactions } from "./emoji-reactions";
import { orpc } from "@/lib/orpc";
import { toast } from "sonner";
import { GroupedReactionSchemaType } from "@/app/schemas/message-schema";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useParams } from "next/navigation";

type ThreadContext = {type: 'thread'; threadId: string}
type ListContext = {type: 'list'; channelId: string}

interface ReactionsBarProps {
  messageId: string;
  reactions: GroupedReactionSchemaType[];
  context?: ThreadContext | ListContext;
}

export function ReactionsBar({ messageId, reactions, context }: ReactionsBarProps) {
  const {channelId} = useParams<{channelId: string}>()
  const queryClient = useQueryClient()
  const toggleMutation = useMutation(
    orpc.message.reaction.toggle.mutationOptions({
      onMutate: async() => {
        const isThread = context && context.type === 'thread'

        if(isThread){
          console.log("This is a thread")
        }

        const listKey = ["message.list", channelId]
        await queryClient.cancelQueries({queryKey: listKey})
        const previous = queryClient.getQueryData()
      },
      onSuccess: () => {
        return toast.success("Emoji added");
      },
      onError: () => {
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
