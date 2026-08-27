"use client"

import React, { memo, useState } from "react"
import { Handle, Position, type NodeProps, useReactFlow } from "@xyflow/react"
import { MarkdownView } from "@/components/ui/markdown-view"
import { Sigma, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

export const MathNode = memo(({ id, data, selected }: NodeProps) => {
  const { setNodes } = useReactFlow()
  const label = (data.label as string) || "Fórmula"
  const content = (data.content as string) || "f(x) = \\dots"
  const fill = (data.fill as string) || "var(--card)"
  const stroke = (data.stroke as string) || "var(--primary)"
  const opacity = data.opacity !== undefined ? (data.opacity as number) : 1

  // Inline editing state on double click
  const [isEditingInline, setIsEditingInline] = useState(false)
  const [editValue, setEditValue] = useState(content)

  const handleSaveInline = () => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, content: editValue } } : n
      )
    )
    setIsEditingInline(false)
  }

  const handleCancelInline = () => {
    setEditValue(content)
    setIsEditingInline(false)
  }

  return (
    <div
      onDoubleClick={() => setIsEditingInline(true)}
      className={cn(
        "relative rounded-xl border-2 bg-card/95 px-4 py-3 shadow-lg backdrop-blur-md transition-all min-w-[180px] max-w-[340px] cursor-grab active:cursor-grabbing",
        selected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
        isEditingInline && "cursor-default"
      )}
      style={{
        backgroundColor: fill,
        borderColor: stroke,
        opacity,
      }}
      title="Doble clic para editar la fórmula directamente"
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
      <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-border/50 text-[10px] font-bold text-primary uppercase tracking-wider">
        <div className="flex items-center gap-1.5">
          <Sigma className="size-3" />
          <span>{label}</span>
        </div>
        <span className="text-[9px] font-normal text-muted-foreground">Doble clic para editar</span>
      </div>

      {/* KaTeX Math Formula Rendering or Inline Editor */}
      {isEditingInline ? (
        <div className="space-y-2 pt-1" onClick={(e) => e.stopPropagation()}>
          <textarea
            autoFocus
            rows={2}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSaveInline()
              } else if (e.key === "Escape") {
                handleCancelInline()
              }
            }}
            placeholder="f(x) = x^2"
            className="w-full rounded-md border border-primary bg-background px-2 py-1 font-mono text-xs text-foreground focus:outline-none"
          />
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-muted-foreground">Enter guardar • Esc cancelar</span>
            <div className="flex gap-1">
              <button
                onClick={handleSaveInline}
                className="p-1 rounded bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Check className="size-3" />
              </button>
              <button
                onClick={handleCancelInline}
                className="p-1 rounded bg-muted text-muted-foreground hover:bg-accent"
              >
                <X className="size-3" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center py-1 overflow-x-auto text-sm">
          <MarkdownView inline content={`$${content}$`} />
        </div>
      )}
    </div>
  )
})

MathNode.displayName = "MathNode"
