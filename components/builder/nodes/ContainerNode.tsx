"use client"

import React, { memo } from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import { Box } from "lucide-react"
import { cn } from "@/lib/utils"

export const ContainerNode = memo(({ data, selected }: NodeProps) => {
  const label = (data.label as string) || "Contenedor / Grupo"
  const width = (data.width as number) || 300
  const height = (data.height as number) || 200

  return (
    <div
      className={cn(
        "relative rounded-2xl border-2 border-dashed border-border/80 bg-accent/10 p-4 transition-all",
        selected && "border-primary ring-2 ring-primary/40 ring-offset-2 ring-offset-background"
      )}
      style={{ minWidth: width, minHeight: height }}
    >
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

      <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
        <Box className="size-3.5 text-primary" />
        <span>{label}</span>
      </div>
    </div>
  )
})

ContainerNode.displayName = "ContainerNode"
