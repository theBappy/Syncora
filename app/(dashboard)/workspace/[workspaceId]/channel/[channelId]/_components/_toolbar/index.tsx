import { Button } from "@/components/ui/button";
import { Pencil, MessageSquareText } from "lucide-react";

interface ToolbarProps {
  messageId: string;
  canEdit: boolean;
  onEdit: () => void;
}

export function MessageHoverToolbar({messageId, onEdit}: ToolbarProps) {
  return (
    <div className="absolute -right-2 -top-3 items-center gap-1 rounded-md border border-gray-200 bg-white/90 px-1.5 py-1 shadow-sm backdrop-blur transition-opacity opacity-0 group-hover:opacity-100 dark:border-neutral-800 dark:bg-neutral-900/90">
      <Button onClick={onEdit} variant="ghost" size="icon">
        <Pencil className="size-4" />
      </Button>
      <Button variant="ghost" size="icon">
        <MessageSquareText className="size-4" />
      </Button>
    </div>
  );
}
