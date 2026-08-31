"use client"

import React, { useState } from "react"
import {
  Plus,
  Trash2,
  Check,
  X,
  Edit2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import type {
  UniversalStep,
  UniversalAction,
  UniversalNode,
  UniversalActionType,
} from "@/types/universal-animation"

interface StepInspectorProps {
  step: UniversalStep | null
  stepIndex: number
  nodes: UniversalNode[]
  allSteps: UniversalStep[]
  onUpdateStep: (updatedStep: UniversalStep) => void
}

export function StepInspector({
  step,
  stepIndex,
  nodes,
  allSteps,
  onUpdateStep,
}: StepInspectorProps) {
  const [editingActionId, setEditingActionId] = useState<string | null>(null)
  const [isAddingAction, setIsAddingAction] = useState(false)

  // Action form state
  const [actionType, setActionType] = useState<UniversalActionType>("highlight")
  const [actionTarget, setActionTarget] = useState(nodes[0]?.id || "")
  const [actionFrom, setActionFrom] = useState(nodes[0]?.id || "")
  const [actionTo, setActionTo] = useState(nodes[1]?.id || nodes[0]?.id || "")
  const [actionColor, setActionColor] = useState<string>("active")
  const [actionText, setActionText] = useState("")
  const [actionSubText, setActionSubText] = useState("")
  const [actionDuration, setActionDuration] = useState(0.8)

  if (!step) {
    return (
      <aside className="flex h-full w-96 flex-col border-l border-border bg-card/60 p-6 text-center text-xs text-muted-foreground select-none">
        Selecciona un paso en la barra de tiempo inferior para inspeccionar y configurar sus acciones e interactividad.
      </aside>
    )
  }

  const handleStartAddAction = () => {
    setEditingActionId(null)
    setIsAddingAction(true)
    setActionType("highlight")
    setActionTarget(nodes[0]?.id || "")
    setActionFrom(nodes[0]?.id || "")
    setActionTo(nodes[1]?.id || nodes[0]?.id || "")
    setActionColor("active")
    setActionText("")
    setActionSubText("")
    setActionDuration(0.8)
  }

  const handleStartEditAction = (act: UniversalAction) => {
    setEditingActionId(act.id)
    setIsAddingAction(false)
    setActionType(act.type)
    setActionTarget(act.targetId || nodes[0]?.id || "")
    setActionFrom(act.fromId || nodes[0]?.id || "")
    setActionTo(act.toId || nodes[1]?.id || nodes[0]?.id || "")
    setActionColor(act.color || "active")
    setActionText(act.text || "")
    setActionSubText(act.subText || "")
    setActionDuration(act.duration || 0.8)
  }

  const handleSaveAction = () => {
    const actionPayload: UniversalAction = {
      id: editingActionId || `act-${Date.now()}`,
      type: actionType,
      color: actionColor,
      duration: actionDuration,
    }

    if (actionType === "packet") {
      actionPayload.fromId = actionFrom
      actionPayload.toId = actionTo
      actionPayload.text = actionText || "DATA"
    } else if (actionType === "tooltip") {
      actionPayload.targetId = actionTarget
      actionPayload.text = actionText || "Información"
      actionPayload.subText = actionSubText
    } else if (actionType === "badge") {
      actionPayload.targetId = actionTarget
      actionPayload.text = actionText || "OK"
    } else {
      actionPayload.targetId = actionTarget
    }

    let updatedActions: UniversalAction[]
    if (editingActionId) {
      updatedActions = step.actions.map((a) => (a.id === editingActionId ? actionPayload : a))
    } else {
      updatedActions = [...step.actions, actionPayload]
    }

    onUpdateStep({ ...step, actions: updatedActions })
    setEditingActionId(null)
    setIsAddingAction(false)
  }

  const handleDeleteAction = (actionId: string) => {
    onUpdateStep({
      ...step,
      actions: step.actions.filter((a) => a.id !== actionId),
    })
  }

  return (
    <aside className="flex h-full w-96 flex-col border-l border-border bg-card/60 backdrop-blur-md select-none overflow-hidden">
      {/* ── Header: Step Details ──────────────────────────────────── */}
      <div className="border-b border-border p-3.5">
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-[10px] font-bold text-primary uppercase tracking-wider">
            Paso {stepIndex + 1}
          </span>
          <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
            {step.duration || 2.0}s
          </span>
        </div>

        <input
          type="text"
          value={step.label}
          onChange={(e) => onUpdateStep({ ...step, label: e.target.value })}
          className="w-full rounded-md border border-border bg-background px-2.5 py-1 text-xs font-bold text-foreground focus:border-primary focus:outline-none"
          placeholder="Título del paso..."
        />

        <textarea
          rows={2}
          value={step.description}
          onChange={(e) => onUpdateStep({ ...step, description: e.target.value })}
          className="mt-2 w-full rounded-md border border-border bg-background px-2.5 py-1 text-xs text-foreground focus:border-primary focus:outline-none"
          placeholder="Descripción pedagógica (soporta Markdown y KaTeX $E=mc^2$)..."
        />

        {/* Actions header — single tab, interactivity now via canvas nodes */}
        <div className="mt-3 bg-muted/60 p-1 rounded-lg">
          <div className="py-1 text-center text-[11px] font-semibold rounded-md bg-card text-primary shadow-xs">
            Acciones ({step.actions.length})
          </div>
        </div>
      </div>

      {/* ── Actions List & Form ───────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
        {/* Action List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Acciones de este paso
            </h3>
            {!isAddingAction && !editingActionId && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleStartAddAction}
                className="h-6 gap-1 px-2 text-[11px] cursor-pointer"
              >
                <Plus className="size-3 text-primary" />
                <span>Añadir acción</span>
              </Button>
            )}
          </div>

          {step.actions.map((act) => (
            <div
              key={act.id}
              className="flex items-center justify-between rounded-xl border border-border bg-card p-2.5 text-xs transition-all hover:border-primary/40"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary font-mono text-[10px] font-bold uppercase">
                  {act.type.slice(0, 3)}
                </div>
                <div>
                  <h4 className="font-semibold text-foreground capitalize">{act.type}</h4>
                  <p className="text-[10px] font-mono text-muted-foreground">
                    {act.targetId || `${act.fromId} -> ${act.toId}`} ({act.duration || 0.8}s)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleStartEditAction(act)}
                  className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
                  title="Editar acción"
                >
                  <Edit2 className="size-3" />
                </button>
                <button
                  onClick={() => handleDeleteAction(act.id)}
                  className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                  title="Eliminar acción"
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Action Edit/Add Form */}
        {(isAddingAction || editingActionId) && (
          <div className="rounded-xl border border-primary/40 bg-card p-3 space-y-2.5 text-xs shadow-md mt-3">
            <h4 className="font-bold text-primary text-[11px] uppercase tracking-wider">
              {editingActionId ? "Editar acción" : "Nueva acción"}
            </h4>

            <div>
              <label className="text-[10px] font-medium text-muted-foreground">Tipo de acción</label>
              <select
                value={actionType}
                onChange={(e) => setActionType(e.target.value as UniversalActionType)}
                className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none"
              >
                <option value="highlight">Resaltar contorno (highlight)</option>
                <option value="pulse">Pulso radiante (pulse)</option>
                <option value="packet">Envío de partícula / paquete (packet)</option>
                <option value="badge">Insignia (badge)</option>
                <option value="tooltip">Bocadillo de información (tooltip)</option>
                <option value="fade">Desvanecer (fade)</option>
                <option value="math_eval">Animar fórmula (math eval)</option>
              </select>
            </div>

            {actionType === "packet" ? (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground">Origen (from)</label>
                  <select
                    value={actionFrom}
                    onChange={(e) => setActionFrom(e.target.value)}
                    className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none"
                  >
                    {nodes.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground">Destino (to)</label>
                  <select
                    value={actionTo}
                    onChange={(e) => setActionTo(e.target.value)}
                    className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none"
                  >
                    {nodes.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div>
                <label className="text-[10px] font-medium text-muted-foreground">Nodo objetivo</label>
                <select
                  value={actionTarget}
                  onChange={(e) => setActionTarget(e.target.value)}
                  className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none"
                >
                  {nodes.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.label} ({n.type})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {(actionType === "packet" || actionType === "badge" || actionType === "tooltip") && (
              <div>
                <label className="text-[10px] font-medium text-muted-foreground">Texto del elemento</label>
                <input
                  type="text"
                  value={actionText}
                  onChange={(e) => setActionText(e.target.value)}
                  placeholder="Ej. DATA o f'(x)"
                  className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none"
                />
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button size="sm" onClick={handleSaveAction} className="flex-1 h-7 text-xs cursor-pointer">
                <Check className="mr-1 size-3" />
                Guardar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditingActionId(null)
                  setIsAddingAction(false)
                }}
                className="h-7 text-xs cursor-pointer"
              >
                <X className="size-3" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
