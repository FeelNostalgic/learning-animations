"use client"

import React, { memo } from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import { MarkdownView } from "@/components/ui/markdown-view"
import { Sigma } from "lucide-react"
import { cn } from "@/lib/utils"

export const MathNode = memo(({ data, selected }: NodeProps) => {
  const label = (data.label as string) || "Fórmula"
  const content = (data.content as string) || "f(x) = \\dots"

  return (
    <div
      className={cn(
        "relative rounded-xl border-2 border-primary/50 bg-card/90 px-4 py-3 shadow-lg backdrop-blur-md transition-all min-w-[180px] max-w-[320px] cursor-grab active:cursor-grabbing",
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

      {/* Header */}
      <div className="flex items-center gap-1.5 mb-1.5 pb-1 border-b border-border/50 text-[10px] font-bold text-primary uppercase tracking-wider">
        <Sigma className="size-3" />
        <span>{label}</span>
      </div>

      {/* KaTeX Math Formula Rendering */}
      <div className="flex items-center justify-center py-1 overflow-x-auto text-sm">
        <MarkdownView inline content={`$${content}$`} />
      </div>
    </div>
  )
})

MathNode.displayName = "MathNode"
