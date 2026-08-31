"use client"

import React, { memo, useCallback } from "react"
import { Handle, Position, NodeResizer, useReactFlow } from "@xyflow/react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface InteractiveNodeShellProps {
  id?: string
  selected?: boolean
  isReadOnly?: boolean
  label?: string
  children: React.ReactNode
  className?: string
}

export const InteractiveNodeShell = memo(
  ({ id, selected, isReadOnly, label, children, className }: InteractiveNodeShellProps) => {
    const { setNodes } = useReactFlow()

    const handleResize = useCallback(
      (_: unknown, params: { width: number; height: number }) => {
        if (!id) return
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

    const handleClass = isReadOnly
      ? "!opacity-0 !pointer-events-none !w-0 !h-0 !border-0 !p-0 !min-w-0 !min-h-0 !bg-transparent"
      : "!h-2.5 !w-2.5 !bg-primary border-2 border-background"

    return (
      <div data-node-id={id} className="relative flex h-full w-full items-center justify-center">
        {!isReadOnly && id && (
          <NodeResizer
            isVisible={Boolean(selected)}
            minWidth={160}
            minHeight={80}
            onResize={handleResize}
            handleClassName="!w-2.5 !h-2.5 !bg-primary !border-2 !border-background !rounded-full"
            lineClassName="!border-primary/60"
          />
        )}

        <Handle type="source" position={Position.Top} id="top" className={handleClass} />
        <Handle type="source" position={Position.Bottom} id="bottom" className={handleClass} />
        <Handle type="source" position={Position.Left} id="left" className={handleClass} />
        <Handle type="source" position={Position.Right} id="right" className={handleClass} />

        <Card
          className={cn(
            "interactive-node-shell node-shape w-full min-w-[180px] p-3 shadow-sm cursor-grab active:cursor-grabbing",
            selected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
            className
          )}
        >
          {label && <div className="mb-2 text-xs font-semibold text-foreground truncate cursor-grab active:cursor-grabbing">{label}</div>}
          <div className="text-xs">{children}</div>
        </Card>
      </div>
    )
  }
)

InteractiveNodeShell.displayName = "InteractiveNodeShell"
