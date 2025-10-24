import { useForm } from "react-hook-form";
import {
  Form,
  FormItem,
  FormControl,
  FormField,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  updateMessageSchema,
  UpdateMessageSchemaType,
} from "@/app/schemas/message-schema";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/rich-text-editor/editor";
import { Message } from "@/lib/generated/prisma";
import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import { toast } from "sonner";

interface EditMessageProps {
  message: Message;
  onCancel: () => void;
  onSave: () => void;
}

export function EditMessage({ message, onCancel, onSave }: EditMessageProps) {
  const queryClient = useQueryClient();
  const form = useForm({
    resolver: zodResolver(updateMessageSchema),
    defaultValues: {
      messageId: message.id,
      content: message.content,
    },
  });

  const updateMutation = useMutation(
    orpc.message.update.mutationOptions({
      onSuccess: (updatedData) => {
        type MessagePage = { items: Message[]; nextCursor?: string };
        type InfiniteMessages = InfiniteData<MessagePage>;
        queryClient.setQueryData<InfiniteMessages>(
          ["message.list", message.channelId],
          (existingData) => {
            if (!existingData) return existingData;

            const updatedMessage = updatedData.message;

            const pages = existingData.pages.map((page) => ({
              ...page,
              items: page.items.map((msg) =>
                msg.id === updatedMessage.id
                  ? { ...msg, ...updatedMessage }
                  : msg
              ),
            }));

            return {
              ...existingData,
              pages,
            };
          }
        );
        toast.success("Message updated successfully!");
        onSave();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  function onSubmit(data: UpdateMessageSchemaType) {
    updateMutation.mutate(data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <RichTextEditor
                  field={field}
                  sendButton={
                    <div className="flex items-center gap-4">
                      <Button
                        onClick={onCancel}
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={updateMutation.isPending}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        size="sm"
                        disabled={updateMutation.isPending}
                      >
                        {updateMutation.isPending ? "Saving" : "save"}
                      </Button>
                    </div>
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
