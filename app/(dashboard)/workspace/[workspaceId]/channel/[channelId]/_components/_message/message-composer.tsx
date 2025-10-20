import { RichTextEditor } from "@/components/rich-text-editor/editor";
import { Button } from "@/components/ui/button";
import { Send, ImageIcon } from "lucide-react";

interface MessageComposerProps {
  value: string;
  onChange: (next: string) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export function MessageComposer({ value, onChange, onSubmit, isSubmitting }: MessageComposerProps) {
  return (
    <>
      <RichTextEditor
        field={{ value, onChange }}
        sendButton={
          <Button className="cursor-pointer" disabled={isSubmitting} onClick={onSubmit} type="button" size="sm">
            <Send className="size-4 mr-1" />
            Send
          </Button>
        }
        footerLeft={
          <Button className="cursor-pointer" type="button" size="sm" variant="outline">
            <ImageIcon className="size-4 mr-1" />
            Attach
          </Button>
        }
      />
    </>
  );
}
