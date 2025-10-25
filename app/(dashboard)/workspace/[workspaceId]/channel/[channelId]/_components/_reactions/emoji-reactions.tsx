import { Button } from "@/components/ui/button";
import {
  EmojiPicker,
  EmojiPickerContent,
  EmojiPickerFooter,
  EmojiPickerSearch,
} from "@/components/ui/emoji-picker";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { SmilePlus } from "lucide-react";
import { useState } from "react";

interface EmojiReactionsProps {
  onSelect: (emoji:string) => void;
}

export function EmojiReactions({onSelect}:EmojiReactionsProps) {
  const [open, setOpen] = useState(false);

  const handleEmojiSelect = (emoji: string) => {
    onSelect(emoji)
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="size-6">
          <SmilePlus className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-fit p-0" align="start">
        <EmojiPicker
          className="h-[342px]"
          onEmojiSelect={(e) => handleEmojiSelect(e.emoji)}
        >
          <EmojiPickerSearch />
          <EmojiPickerContent />
          <EmojiPickerFooter />
        </EmojiPicker>
      </PopoverContent>
    </Popover>
  );
}
