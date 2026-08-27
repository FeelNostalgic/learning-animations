"use client"

import React, { memo, useState, useRef, useEffect, useCallback } from "react"
import { Handle, Position, NodeResizer, type NodeProps, useReactFlow } from "@xyflow/react"
import { Image as ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export const ImageNode = memo(({ id, data, selected }: NodeProps) => {
  const { setNodes } = useReactFlow()
  const label = (data.label as string) || "Imagen"
  const imageUrl = (data.imageUrl as string) || (data.content as string) || ""
  const imageFit = (data.imageFit as "contain" | "cover" | "fill") || "contain"
  const width = (data.width as number) || 140
  const height = (data.height as number) || 140
  const opacity = data.opacity !== undefined ? (data.opacity as number) : 1
  const stroke = (data.stroke as string) || "var(--border)"
  const strokeWidth = data.strokeWidth !== undefined ? (data.strokeWidth as number) : 1

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
        "relative flex flex-col items-center justify-center rounded-2xl p-1 transition-all cursor-grab active:cursor-grabbing",
        selected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
      )}
      style={{
        width,
        height,
        opacity,
      }}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={50}
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

      <div
        className="relative overflow-hidden rounded-xl bg-card/80 shadow-md flex items-center justify-center h-full w-full"
        style={{
          border: strokeWidth > 0 ? `${strokeWidth}px solid ${stroke}` : "none",
        }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={label}
            className="h-full w-full select-none pointer-events-none"
            style={{ objectFit: imageFit }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-muted-foreground gap-1 p-2">
            <ImageIcon className="size-6 text-primary/60" />
            <span className="text-[10px] text-center font-medium">Sin imagen</span>
          </div>
        )}
      </div>

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
          className="nodrag nopan nowheel w-full bg-background/80 rounded px-1 text-center font-bold text-[11px] text-foreground focus:outline-none mt-1"
        />
      ) : (
        <span className="text-[11px] font-bold text-foreground mt-1 text-center truncate max-w-full px-1">
          {label}
        </span>
      )}
    </div>
  )
})

ImageNode.displayName = "ImageNode"
