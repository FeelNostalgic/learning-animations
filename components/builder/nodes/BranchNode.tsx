"use client"

import React, { memo } from "react"
import { type NodeProps } from "@xyflow/react"
import { GitBranch } from "lucide-react"
import { InteractiveNodeShell } from "./InteractiveNodeShell"
import type { BranchProps } from "@/types/universal-animation"

export const BranchNode = memo(({ id, data, selected }: NodeProps) => {
  const rawProps = (data.props as Record<string, unknown>) || {}
  // Support legacy choices array for backwards compat — migrate to targetStepId
  const legacyChoices = rawProps.choices as { targetStepId?: string }[] | undefined
  const targetStepId =
    (rawProps.targetStepId as string) || (legacyChoices?.[0]?.targetStepId as string) || ""
  const isReadOnly = Boolean((data as Record<string, unknown>).isReadOnly)
  const label = (data.label as string) || "Branch"

  const hasInvalid = !targetStepId || targetStepId.trim() === ""

  return (
    <InteractiveNodeShell id={id} selected={Boolean(selected)} isReadOnly={isReadOnly} label={label}>
      <div className="space-y-2 min-w-[200px]">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <GitBranch className="size-3.5 text-primary" />
          <span>Bifurcación</span>
        </div>

        {hasInvalid && (
          <div role="alert" aria-live="assertive" className="rounded-md bg-destructive/10 px-2 py-1 text-xs text-destructive border border-destructive/30">
            Destino inválido: revisa targetStepId
          </div>
        )}

        <div className="rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs">
          <span className="text-muted-foreground">Salta a: </span>
          <span className="font-mono font-semibold text-primary">{targetStepId || "— sin destino —"}</span>
        </div>
      </div>
    </InteractiveNodeShell>
  )
})

BranchNode.displayName = "BranchNode"
