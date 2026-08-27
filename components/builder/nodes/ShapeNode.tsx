"use client"

import React, { memo, useState, useRef, useEffect, useCallback } from "react"
import { Handle, Position, NodeResizer, type NodeProps, useReactFlow } from "@xyflow/react"
import { cn } from "@/lib/utils"

export const ShapeNode = memo(({ id, data, selected }: NodeProps) => {
  const { setNodes } = useReactFlow()
  const label = (data.label as string) || ""
  const shapeDetails = (data.shapeDetails as any) || {}
  const shapeType = shapeDetails.shapeType || "circle"
  const fill = (data.fill as string) || "var(--card)"
  const stroke = (data.stroke as string) || "var(--primary)"
  const strokeWidth = data.strokeWidth !== undefined ? (data.strokeWidth as number) : 2
  const opacity = data.opacity !== undefined ? (data.opacity as number) : 1
  const width = (data.width as number) || (shapeType === "circle" ? 80 : 100)
  const height = (data.height as number) || (shapeType === "circle" ? 80 : 60)

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

  const isCircle = shapeType === "circle"
  const isDiamond = shapeType === "diamond"
  const isTriangle = shapeType === "triangle"
  const isPill = shapeType === "pill"

  return (
    <div
      onDoubleClick={() => setIsEditingInline(true)}
      className={cn(
        "relative flex items-center justify-center transition-all cursor-grab active:cursor-grabbing",
        selected && "ring-2 ring-primary ring-offset-2 ring-offset-background rounded-xl"
      )}
      style={{
        width,
        height,
        opacity,
      }}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={40}
        minHeight={40}
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

      <div
        className={cn(
          "flex h-full w-full items-center justify-center p-2 shadow-md transition-colors",
          isCircle && "rounded-full",
          isPill && "rounded-full",
          !isCircle && !isPill && !isDiamond && !isTriangle && "rounded-xl",
          isDiamond && "rotate-45 rounded-md",
          isTriangle && "rounded-md"
        )}
        style={{
          backgroundColor: fill,
          border: strokeWidth > 0 ? `${strokeWidth}px solid ${stroke}` : "none",
        }}
      >
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
            className="nodrag nopan nowheel w-full bg-transparent text-center font-bold text-xs text-foreground focus:outline-none"
          />
        ) : (
          <span
            className={cn(
              "text-xs font-bold text-foreground select-none text-center truncate max-w-full px-1",
              isDiamond && "-rotate-45"
            )}
          >
            {label}
          </span>
        )}
      </div>
    </div>
  )
})

ShapeNode.displayName = "ShapeNode"
