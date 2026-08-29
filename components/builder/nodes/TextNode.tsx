"use client"

import React, { memo, useState, useRef, useEffect, useCallback } from "react"
import { Handle, Position, NodeResizer, type NodeProps, useReactFlow } from "@xyflow/react"
import { Check, X } from "lucide-react"
import { UniversalNodeView } from "@/components/animations/visual/universal-node-view"
import type { UniversalNode } from "@/types/universal-animation"

export const TextNode = memo(({ id, data, selected }: NodeProps) => {
  const { setNodes } = useReactFlow()
  const label = (data.label as string) || "Nota / Texto"
  const content = (data.content as string) || label
  const evaluatedState = data.evaluatedState as any

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

  const nodeData: UniversalNode = {
    id,
    type: "text",
    label,
    content,
    x: 0,
    y: 0,
    width: data.width as number,
    height: data.height as number,
    fill: data.fill as string,
    stroke: data.stroke as string,
    strokeWidth: data.strokeWidth as number,
    opacity: data.opacity as number,
  }

  return (
    <div
      onDoubleClick={() => setIsEditingInline(true)}
      className="relative flex items-center justify-center cursor-grab active:cursor-grabbing"
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

      <UniversalNodeView
        node={nodeData}
        evaluatedState={evaluatedState}
        isEditingInline={isEditingInline}
        className={selected ? "ring-2 ring-primary ring-offset-2 ring-offset-background rounded-xl" : ""}
        inlineEditorContent={
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
        }
      />
    </div>
  )
})

TextNode.displayName = "TextNode"
