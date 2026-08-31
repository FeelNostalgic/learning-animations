"use client"

import React, { memo, useState, useCallback } from "react"
import { type NodeProps } from "@xyflow/react"
import { InteractiveNodeShell } from "./InteractiveNodeShell"
import { Slider } from "@/components/ui/slider"
import type { SliderProps } from "@/types/universal-animation"

export const InteractiveSliderNode = memo(({ id, data, selected }: NodeProps) => {
  const props = (data.props as SliderProps) || {
    variableName: "x",
    min: 0,
    max: 100,
    step: 1,
    defaultValue: 50,
  }
  const variableName = props.variableName || "x"
  const min = props.min ?? 0
  const max = props.max ?? 100
  const step = props.step ?? 1
  const defaultValue = props.defaultValue ?? 50
  const unit = props.unit
  const isReadOnly = Boolean((data as Record<string, unknown>).isReadOnly)
  const label = (data.label as string) || "Slider"

  const [value, setValue] = useState(defaultValue)

  const handleChange = useCallback(
    (vals: number[]) => {
      const v = vals[0] ?? defaultValue
      setValue(v)
      // ephemeral runtime bridge — if window has runtime, setVariable is handled in player; in builder just local
      // For builder live preview, try to use InteractionRuntime singleton if available via dynamic import would be heavy
      // Keep local state as source of truth for test aria-valuenow
    },
    [defaultValue]
  )

  return (
    <InteractiveNodeShell id={id} selected={Boolean(selected)} isReadOnly={isReadOnly} label={label}>
      <div className="space-y-2 min-w-[200px]">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-mono font-semibold text-foreground">variable: {variableName}</span>
          {unit && <span className="text-muted-foreground">{unit}</span>}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-muted-foreground">{min}</span>
          <Slider
            value={[value]}
            min={min}
            max={max}
            step={step}
            onValueChange={handleChange}
            aria-label={`Slider ${variableName}`}
            aria-valuetext={`${value}${unit ? ` ${unit}` : ""}`}
          />
          <span className="text-xs font-mono text-muted-foreground">{max}</span>
        </div>
        <div className="text-center text-xs font-bold text-primary">
          {value}
          {unit ? ` ${unit}` : ""}
        </div>
      </div>
    </InteractiveNodeShell>
  )
})

InteractiveSliderNode.displayName = "InteractiveSliderNode"
