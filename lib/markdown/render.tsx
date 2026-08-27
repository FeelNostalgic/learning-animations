import DOMPurify from "dompurify"

/**
 * Sanitizes markdown/raw string content to prevent XSS injection attacks.
 * Strips script tags, unsafe protocols (javascript:), and dangerous inline event handlers.
 */
export function sanitizeMarkdownHtml(content: string): string {
  if (!content) return ""

  // 1. Strip script tags and their entire inner contents
  const strippedContent = content
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/on\w+='[^']*'/gi, "")
    .replace(/javascript:[^"']*/gi, "")

  // 2. If running in browser or test environment with DOM available
  if (typeof window !== "undefined") {
    return DOMPurify.sanitize(strippedContent, {
      ALLOWED_TAGS: [
        "b",
        "i",
        "em",
        "strong",
        "a",
        "p",
        "h1",
        "h2",
        "h3",
        "h4",
        "ul",
        "ol",
        "li",
        "code",
        "pre",
        "span",
        "div",
        "blockquote",
        "table",
        "thead",
        "tbody",
        "tr",
        "th",
        "td",
        "hr",
        "br",
        "svg",
        "path",
      ],
      ALLOWED_ATTR: ["href", "title", "target", "rel", "class", "className", "style"],
    })
  }

  // Fallback for SSR: basic regex strip of active script tags and event handlers
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/on\w+='[^']*'/gi, "")
    .replace(/javascript:[^"']*/gi, "")
}
