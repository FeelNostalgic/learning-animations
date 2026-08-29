"use client"

import React, { memo, useState, useRef, useEffect, useCallback } from "react"
import { Handle, Position, NodeResizer, type NodeProps, useReactFlow } from "@xyflow/react"
import { UniversalNodeView } from "@/components/animations/visual/universal-node-view"
import type { UniversalNode } from "@/types/universal-animation"

export const ContainerNode = memo(({ id, data, selected }: NodeProps) => {
  const { setNodes } = useReactFlow()
  const label = (data.label as string) || "Contenedor / Grupo"
  const content = (data.content as string) || ""
  const evaluatedState = data.evaluatedState as any

  const [isEditingInline, setIsEditingInline] = useState(false)
  const [editLabel, setEditLabel] = useState(label)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditingInline && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditingInline])

  const handleSaveInline = () => {
    setNodes((nds) =>
      nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, label: editLabel } } : n))
    )
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
    type: "container",
    label,
    content,
    x: 0,
    y: 0,
    width: (data.width as number) || 320,
    height: (data.height as number) || 200,
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
        minWidth={160}
        minHeight={100}
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
        className={selected ? "ring-2 ring-primary ring-offset-2 ring-offset-background rounded-2xl" : ""}
        inlineEditorContent={
          <input
            ref={inputRef}
            type="text"
            value={editLabel}
            onChange={(e) => setEditLabel(e.target.value)}
            onBlur={handleSaveInline}
            onKeyDown={(e) => {
              e.stopPropagation()
              if (e.key === "Enter") handleSaveInline()
              if (e.key === "Escape") setIsEditingInline(false)
            }}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            className="nodrag nopan nowheel w-full bg-background/80 rounded px-1 font-bold text-xs text-foreground focus:outline-none"
          />
        }
      />
    </div>
  )
})

ContainerNode.displayName = "ContainerNode"
