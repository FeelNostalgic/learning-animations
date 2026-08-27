"use client"

import React, { memo } from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import { Image as ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export const ImageNode = memo(({ data, selected }: NodeProps) => {
  const label = (data.label as string) || "Imagen"
  const imageUrl = (data.imageUrl as string) || (data.content as string) || ""
  const imageFit = (data.imageFit as "contain" | "cover" | "fill") || "contain"
  const width = (data.width as number) || 120
  const height = (data.height as number) || 120
  const opacity = data.opacity !== undefined ? (data.opacity as number) : 1
  const stroke = (data.stroke as string) || "var(--border)"
  const strokeWidth = (data.strokeWidth as number) || 1

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center rounded-2xl p-1 transition-all cursor-grab active:cursor-grabbing",
        selected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
      )}
      style={{ opacity }}
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

      <div
        className="relative overflow-hidden rounded-xl bg-card/80 shadow-md flex items-center justify-center"
        style={{
          width,
          height,
          border: `${strokeWidth}px solid ${stroke}`,
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

      <span className="text-[11px] font-bold text-foreground mt-1 text-center truncate max-w-[120px]">
        {label}
      </span>
    </div>
  )
})

ImageNode.displayName = "ImageNode"
