"use client"

import React, { memo, useState, useRef, useEffect, useCallback } from "react"
import { Handle, Position, NodeResizer, type NodeProps, useReactFlow } from "@xyflow/react"
import { Box } from "lucide-react"
import { cn } from "@/lib/utils"

export const ContainerNode = memo(({ id, data, selected }: NodeProps) => {
  const { setNodes } = useReactFlow()
  const label = (data.label as string) || "Contenedor / Grupo"
  const width = (data.width as number) || 320
  const height = (data.height as number) || 200
  const fill = (data.fill as string) || "transparent"
  const stroke = (data.stroke as string) || "var(--border)"
  const strokeWidth = data.strokeWidth !== undefined ? (data.strokeWidth as number) : 1.5
  const opacity = data.opacity !== undefined ? (data.opacity as number) : 1

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

  return (
    <div
      onDoubleClick={() => setIsEditingInline(true)}
      className={cn(
        "relative rounded-2xl p-4 transition-all",
        selected && "border-primary ring-2 ring-primary/40 ring-offset-2 ring-offset-background"
      )}
      style={{
        width,
        height,
        backgroundColor: fill === "transparent" ? "rgba(100, 116, 139, 0.06)" : fill,
        border: strokeWidth > 0 ? `${strokeWidth}px dashed ${stroke}` : "none",
        opacity,
      }}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={150}
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

      <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
        <Box className="size-3.5 text-primary shrink-0" />
        {isEditingInline ? (
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
            className="nodrag nopan nowheel bg-background/90 rounded px-1 text-xs text-foreground focus:outline-none font-bold"
          />
        ) : (
          <span className="truncate">{label}</span>
        )}
      </div>
    </div>
  )
})

ContainerNode.displayName = "ContainerNode"
