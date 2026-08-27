"use client"

import React from "react"
import ReactMarkdown from "react-markdown"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import { sanitizeMarkdownHtml } from "@/lib/markdown/render"
import { cn } from "@/lib/utils"

interface MarkdownViewProps {
  content: string
  className?: string
  inline?: boolean
}

export function MarkdownView({ content, className, inline = false }: MarkdownViewProps) {
  const cleanContent = sanitizeMarkdownHtml(content || "")

  if (inline) {
    return (
      <span className={cn("inline-markdown text-inherit font-inherit", className)}>
        <ReactMarkdown
          remarkPlugins={[remarkMath]}
          rehypePlugins={[rehypeKatex]}
          components={{
            p: ({ children }) => <span>{children}</span>,
            a: ({ href, children }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline hover:opacity-80 transition-opacity"
              >
                {children}
              </a>
            ),
            code: ({ children }) => (
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em] text-foreground">
                {children}
              </code>
            ),
          }}
        >
          {cleanContent}
        </ReactMarkdown>
      </span>
    )
  }

  return (
    <div
      className={cn(
        "markdown-content prose prose-sm dark:prose-invert max-w-none text-xs md:text-sm text-foreground/90 leading-relaxed",
        "[&_p]:my-1.5 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5",
        "[&_strong]:font-semibold [&_strong]:text-foreground",
        "[&_em]:italic",
        "[&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em]",
        "[&_pre]:rounded-lg [&_pre]:bg-muted/80 [&_pre]:p-3 [&_pre]:my-2",
        "[&_.katex-display]:my-2 [&_.katex-display]:overflow-x-auto [&_.katex-display]:py-1",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline hover:opacity-80 transition-opacity"
            >
              {children}
            </a>
          ),
        }}
      >
        {cleanContent}
      </ReactMarkdown>
    </div>
  )
}
