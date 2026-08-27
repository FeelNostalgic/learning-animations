"use client"

import React, { memo } from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import { MarkdownView } from "@/components/ui/markdown-view"
import { FileText } from "lucide-react"
import { cn } from "@/lib/utils"

export const TextNode = memo(({ data, selected }: NodeProps) => {
  const label = (data.label as string) || "Nota / Texto"
  const content = (data.content as string) || label

  return (
    <div
      className={cn(
        "relative rounded-xl border-2 border-border bg-card/95 p-3.5 shadow-md backdrop-blur-md transition-all min-w-[190px] max-w-[280px] cursor-grab active:cursor-grabbing",
        selected && "ring-2 ring-primary ring-offset-2 ring-offset-background border-primary"
      )}
    >
      {/* 4 Magnetic Handles */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className="!h-2.5 !w-2.5 !bg-primary border-2 border-background"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className="!h-2.5 !w-2.5 !bg-primary border-2 border-background"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="!h-2.5 !w-2.5 !bg-primary border-2 border-background"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!h-2.5 !w-2.5 !bg-primary border-2 border-background"
      />

      <div className="flex items-center gap-1.5 mb-1.5 pb-1 border-b border-border/50 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
        <FileText className="size-3 text-primary" />
        <span>{label}</span>
      </div>

      <div className="text-xs leading-relaxed max-h-[140px] overflow-y-auto">
        <MarkdownView content={content} />
      </div>
    </div>
  )
})

TextNode.displayName = "TextNode"
