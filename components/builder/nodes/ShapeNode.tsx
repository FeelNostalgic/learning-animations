"use client"

import React, { memo } from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import { cn } from "@/lib/utils"

export const ShapeNode = memo(({ data, selected }: NodeProps) => {
  const label = (data.label as string) || ""
  const shapeDetails = (data.shapeDetails as any) || {}
  const shapeType = shapeDetails.shapeType || "circle"
  const fill = (data.fill as string) || "var(--card)"
  const stroke = (data.stroke as string) || "var(--primary)"

  const isCircle = shapeType === "circle"
  const isDiamond = shapeType === "diamond"
  const isTriangle = shapeType === "triangle"
  const isPill = shapeType === "pill"

  return (
    <div
      className={cn(
        "relative flex items-center justify-center p-3 transition-all cursor-grab active:cursor-grabbing",
        selected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
      )}
    >
      {/* 4 Magnetic Handles for all-directional connections */}
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

      {/* Node Shape Visual Body */}
      <div
        className={cn(
          "flex items-center justify-center border-2 px-4 py-2.5 shadow-md transition-colors",
          isCircle && "h-20 w-20 rounded-full",
          isPill && "rounded-full min-w-[100px] px-6",
          !isCircle && !isPill && !isDiamond && !isTriangle && "rounded-xl min-w-[90px]",
          isDiamond && "h-18 w-18 rotate-45 rounded-md",
          isTriangle && "rounded-md"
        )}
        style={{
          backgroundColor: fill,
          borderColor: stroke,
        }}
      >
        <span
          className={cn(
            "text-xs font-bold text-foreground select-none text-center truncate max-w-[120px]",
            isDiamond && "-rotate-45"
          )}
        >
          {label}
        </span>
      </div>
    </div>
  )
})

ShapeNode.displayName = "ShapeNode"
