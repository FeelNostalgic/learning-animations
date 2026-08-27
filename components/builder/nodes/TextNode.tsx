"use client"

import React, { memo, useState, useRef, useEffect, useCallback } from "react"
import { Handle, Position, NodeResizer, type NodeProps, useReactFlow } from "@xyflow/react"
import { MarkdownView } from "@/components/ui/markdown-view"
import { FileText, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

export const TextNode = memo(({ id, data, selected }: NodeProps) => {
  const { setNodes } = useReactFlow()
  const label = (data.label as string) || "Nota / Texto"
  const content = (data.content as string) || label
  const fill = (data.fill as string) || "var(--card)"
  const stroke = (data.stroke as string) || "var(--border)"
  const strokeWidth = data.strokeWidth !== undefined ? (data.strokeWidth as number) : 1
  const opacity = data.opacity !== undefined ? (data.opacity as number) : 1
  const width = (data.width as number) || 220
  const height = (data.height as number) || 110

  const [isEditingInline, setIsEditingInline] = useState(false)
  const [editValue, setEditValue] = useState(content)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isEditingInline && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.select()
    }
  }, [isEditingInline])

  const handleSaveInline = () => {
    setNodes((nds) =>
      nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, content: editValue } } : n))
    )
    setIsEditingInline(false)
  }

  const handleCancelInline = () => {
    setEditValue(content)
    setIsEditingInline(false)
  }

  const handleResize = useCallback(
    (_: any, params: { width: number; height: number }) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === id
            ? {
                ...n,
                style: { ...n.style, width: params.width, height: params.height },
                data: { ...n.data, width: params.width, height: params.height },
              }
            : n
        )
      )
    },
    [id, setNodes]
  )

  return (
    <div
      onDoubleClick={() => setIsEditingInline(true)}
      className={cn(
        "relative rounded-xl bg-card/95 p-3 shadow-md backdrop-blur-md transition-all cursor-grab active:cursor-grabbing flex flex-col justify-between",
        selected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
        isEditingInline && "cursor-default"
      )}
      style={{
        width,
        height,
        backgroundColor: fill,
        border: strokeWidth > 0 ? `${strokeWidth}px solid ${stroke}` : "none",
        opacity,
      }}
      title="Doble clic para editar el texto directamente"
    >
      <NodeResizer
        isVisible={selected}
        minWidth={100}
        minHeight={50}
        onResize={handleResize}
        handleClassName="!w-2.5 !h-2.5 !bg-primary !border-2 !border-background !rounded-full"
        lineClassName="!border-primary/60"
      />

      <Handle
        type="source"
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
        type="source"
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

      <div className="flex items-center justify-between mb-1 pb-1 border-b border-border/50 text-[10px] font-bold text-muted-foreground uppercase tracking-wider shrink-0">
        <div className="flex items-center gap-1.5 truncate">
          <FileText className="size-3 text-primary shrink-0" />
          <span className="truncate">{label}</span>
        </div>
      </div>

      {isEditingInline ? (
        <div
          className="space-y-1.5 pt-0.5 flex-1 flex flex-col justify-between"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <textarea
            ref={textareaRef}
            rows={3}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSaveInline}
            onKeyDown={(e) => {
              e.stopPropagation()
              if (e.key === "Escape") handleCancelInline()
            }}
            placeholder="Escribe en Markdown..."
            className="nodrag nopan nowheel w-full flex-1 rounded border border-primary bg-background px-2 py-1 text-xs text-foreground focus:outline-none resize-none"
          />
          <div className="flex items-center justify-between text-[9px] text-muted-foreground shrink-0">
            <span>Soporta Markdown y KaTeX</span>
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
        <div className="flex-1 text-xs leading-relaxed overflow-y-auto pr-1">
          <MarkdownView content={content} />
        </div>
      )}
    </div>
  )
})

TextNode.displayName = "TextNode"
