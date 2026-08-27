"use client"

import React, { memo, useState, useRef, useEffect, useCallback } from "react"
import { Handle, Position, NodeResizer, type NodeProps, useReactFlow } from "@xyflow/react"
import {
  Laptop,
  Network,
  Shield,
  Server,
  Cloud,
} from "lucide-react"
import { cn } from "@/lib/utils"

export const NetworkNode = memo(({ id, data, selected }: NodeProps) => {
  const { setNodes } = useReactFlow()
  const label = (data.label as string) || "Dispositivo"
  const props = (data.props as any) || {}
  const networkType = props.networkType || "pc"
  const fill = (data.fill as string) || "var(--card)"
  const stroke = (data.stroke as string) || "var(--border)"
  const strokeWidth = data.strokeWidth !== undefined ? (data.strokeWidth as number) : 2
  const opacity = data.opacity !== undefined ? (data.opacity as number) : 1
  const width = (data.width as number) || 100
  const height = (data.height as number) || 100

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

  const renderIcon = () => {
    switch (networkType) {
      case "switch":
        return <Network className="size-6 text-emerald-500" />
      case "router":
        return <Shield className="size-6 text-amber-500" />
      case "server":
        return <Server className="size-6 text-purple-500" />
      case "cloud":
        return <Cloud className="size-6 text-sky-500" />
      case "pc":
      default:
        return <Laptop className="size-6 text-blue-500" />
    }
  }

  return (
    <div
      onDoubleClick={() => setIsEditingInline(true)}
      className={cn(
        "relative flex flex-col items-center justify-center rounded-2xl bg-card/95 p-2.5 shadow-md backdrop-blur-md transition-all cursor-grab active:cursor-grabbing",
        selected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
      )}
      style={{
        width,
        height,
        backgroundColor: fill,
        border: strokeWidth > 0 ? `${strokeWidth}px solid ${stroke}` : "none",
        opacity,
      }}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={60}
        minHeight={60}
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

      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/40 mb-1 shrink-0">
        {renderIcon()}
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
          className="nodrag nopan nowheel w-full bg-background/80 rounded px-1 text-center font-bold text-xs text-foreground focus:outline-none"
        />
      ) : (
        <span className="text-xs font-bold text-foreground text-center truncate max-w-full px-1">
          {label}
        </span>
      )}

      {props.ip && (
        <span className="text-[9px] font-mono text-muted-foreground mt-0.5 truncate max-w-full">
          {props.ip}
        </span>
      )}
    </div>
  )
})

NetworkNode.displayName = "NetworkNode"
