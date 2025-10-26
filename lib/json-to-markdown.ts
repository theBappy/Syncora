import { baseExtensions } from "@/components/rich-text-editor/extensions";
import { renderToMarkdown } from "@tiptap/static-renderer/pm/markdown";

function normalizeWhiteSpace(markdown: string) {
  return markdown
    .replace(/[ \t]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n") 
    .replace(/^\n+|\n+$/g, "") 
    .trim();
}

export async function tiptapJsonToMarkdown(json: string) {
  //parse json
  let content;
  try {
    content = JSON.parse(json);
  } catch {
    return "";
  }
  const markdown = renderToMarkdown({
    extensions: baseExtensions,
    content: content,
  });
  return normalizeWhiteSpace(markdown);
}
