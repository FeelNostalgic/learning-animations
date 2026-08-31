"use client"

import React, { memo } from "react"
import { type NodeProps } from "@xyflow/react"
import { GitBranch } from "lucide-react"
import { InteractiveNodeShell } from "./InteractiveNodeShell"
import type { BranchProps } from "@/types/universal-animation"

export const BranchNode = memo(({ id, data, selected }: NodeProps) => {
  const props = (data.props as BranchProps) || { choices: [] }
  const choices = props.choices || []
  const isReadOnly = Boolean((data as Record<string, unknown>).isReadOnly)
  const label = (data.label as string) || "Branch"

  const hasInvalid = choices.some((c) => !c.targetStepId || c.targetStepId.trim() === "")

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

        <div className="grid gap-1.5">
          {choices.map((choice) => (
            <button
              key={choice.id}
              type="button"
              className="flex items-center justify-between rounded-lg border border-border bg-card px-2.5 py-1.5 text-left text-xs font-medium text-foreground hover:border-primary/50 hover:bg-accent/40 cursor-pointer"
            >
              <span>{choice.label}</span>
              <span className="text-[10px] text-muted-foreground">{choice.targetStepId || "—"}</span>
            </button>
          ))}
          {choices.length === 0 && <p className="text-xs text-muted-foreground">Sin opciones</p>}
        </div>
      </div>
    </InteractiveNodeShell>
  )
})

BranchNode.displayName = "BranchNode"
