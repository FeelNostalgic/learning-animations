"use client"

import React, { memo } from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import {
  Laptop,
  Network,
  Shield,
  Server,
  Cloud,
} from "lucide-react"
import { cn } from "@/lib/utils"

export const NetworkNode = memo(({ data, selected }: NodeProps) => {
  const label = (data.label as string) || "Dispositivo"
  const props = (data.props as any) || {}
  const networkType = props.networkType || "pc"

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
      className={cn(
        "relative flex flex-col items-center justify-center rounded-2xl border-2 border-border/80 bg-card/95 p-3.5 shadow-md backdrop-blur-md transition-all min-w-[90px] cursor-grab active:cursor-grabbing",
        selected && "ring-2 ring-primary ring-offset-2 ring-offset-background border-primary"
      )}
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

      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/40 mb-1.5">
        {renderIcon()}
      </div>

      <span className="text-xs font-bold text-foreground text-center truncate max-w-[100px]">
        {label}
      </span>

      {props.ip && (
        <span className="text-[10px] font-mono text-muted-foreground mt-0.5">
          {props.ip}
        </span>
      )}
    </div>
  )
})

NetworkNode.displayName = "NetworkNode"
