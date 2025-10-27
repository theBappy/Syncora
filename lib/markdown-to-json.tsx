import { editorExtensions } from "@/components/rich-text-editor/extensions";
import DOMPurify from "dompurify";
import MarkdownIt from "markdown-it";
import { generateJSON } from "@tiptap/react";

const md = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: false,
});

export function markdownToJSON(markdown: string) {
  const html = md.render(markdown);
  const cleanHTML = DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });

  return generateJSON(cleanHTML, editorExtensions);
}
