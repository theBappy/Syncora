import { RichTextEditor } from "@/components/rich-text-editor/editor";
import { ImageUploadModal } from "@/components/rich-text-editor/image-upload-modal";
import { Button } from "@/components/ui/button";
import { UseAttachmentUploadType } from "@/hooks/use-attachment-upload";
import { Send, ImageIcon } from "lucide-react";
import { AttachmentChip } from "./attachment-chip";

interface MessageComposerProps {
  value: string;
  onChange: (next: string) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  upload: UseAttachmentUploadType;
}

export function MessageComposer({
  value,
  onChange,
  onSubmit,
  isSubmitting,
  upload,
}: MessageComposerProps) {
  return (
    <>
      <RichTextEditor
        field={{ value, onChange }}
        sendButton={
          <Button
            className="cursor-pointer"
            disabled={isSubmitting}
            onClick={onSubmit}
            type="button"
            size="sm"
          >
            <Send className="size-4 mr-1" />
            Send
          </Button>
        }
        footerLeft={
          upload.stagedUrl ? (
            <AttachmentChip onRemove={upload.clear} url={upload.stagedUrl} />
          ) : (
            <Button
              onClick={() => upload.setIsOpen(true)}
              className="cursor-pointer"
              type="button"
              size="sm"
              variant="outline"
            >
              <ImageIcon className="size-4 mr-1" />
              Attach
            </Button>
          )
        }
      />
      <ImageUploadModal
        onUploaded={(url) => upload.onUploaded(url)}
        open={upload.isOpen}
        onOpenChange={upload.setIsOpen}
      />
    </>
  );
}
