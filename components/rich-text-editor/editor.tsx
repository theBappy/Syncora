"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { editorExtensions } from "./extensions";
import { MenuBar } from "./menu-bar";
import { ReactNode } from "react";

interface Props {
  field: any;
  sendButton: ReactNode;
  footerLeft?: ReactNode;
}

export function RichTextEditor({ field, sendButton, footerLeft }: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    content: (() => {
      if (!field?.value) return "";
      try {
        return JSON.parse(field.value);
      } catch {
        return "";
      }
    })(),
    onUpdate: ({ editor }) => {
      if (field?.onChange) {
        field.onChange(JSON.stringify(editor.getJSON()));
      }
    },
    extensions: editorExtensions,
    editorProps: {
      attributes: {
        class:
          "max-w-none min-h-[125px] focus:outline-none p-4 !w-full !max-w-none prose dark:prose-invert marker:text-primary",
      },
    },
  });
  return (
    <div className="relative w-full border border-input rounded-lg overflow-hidden dark:bg-input/30 flex flex-col">
      <MenuBar editor={editor} />
      <EditorContent
        editor={editor}
        className="max-h-[200px] overflow-y-auto"
      />
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-t border-input bg-card">
        <div className="min-h-8 flex items-center">{footerLeft}</div>
        <div className="shrink-0">{sendButton}</div>
      </div>
    </div>
  );
}
