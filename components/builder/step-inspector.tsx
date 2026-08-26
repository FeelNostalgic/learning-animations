"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Zap, Send, MessageSquare, Sparkles, EyeOff, Edit2, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type {
  DynamicStep,
  DynamicAction,
  DynamicNode,
  ActionType,
} from "@/types/dynamic-animation"

interface StepInspectorProps {
  step: DynamicStep | null
  stepIndex: number
  nodes: DynamicNode[]
  onUpdateStep: (updatedStep: DynamicStep) => void
}

export function StepInspector({
  step,
  stepIndex,
  nodes,
  onUpdateStep,
}: StepInspectorProps) {
  const [editingActionId, setEditingActionId] = useState<string | null>(null)
  const [isAddingAction, setIsAddingAction] = useState(false)

  // Form state for creating or editing an action
  const [actionType, setActionType] = useState<ActionType>("highlight")
  const [actionTarget, setActionTarget] = useState(nodes[0]?.id || "")
  const [actionFrom, setActionFrom] = useState(nodes[0]?.id || "")
  const [actionTo, setActionTo] = useState(nodes[1]?.id || nodes[0]?.id || "")
  const [actionColor, setActionColor] = useState<"active" | "success" | "warn">("active")
  const [actionText, setActionText] = useState("")
  const [actionSubText, setActionSubText] = useState("")
  const [actionDuration, setActionDuration] = useState(0.5)

  // Update default node targets if nodes list changes
  useEffect(() => {
    if (nodes.length > 0) {
      if (!actionTarget) setActionTarget(nodes[0].id)
      if (!actionFrom) setActionFrom(nodes[0].id)
      if (!actionTo) setActionTo(nodes[1]?.id || nodes[0].id)
    }
  }, [nodes])

  if (!step) {
    return (
      <aside className="flex h-full w-96 flex-col border-l border-border bg-card/60 p-6 text-center text-xs text-muted-foreground">
        Selecciona un paso en la barra de tiempo inferior para inspeccionar y configurar sus acciones.
      </aside>
    )
  }

  // Start editing existing action
  const handleStartEdit = (act: DynamicAction) => {
    setEditingActionId(act.id)
    setIsAddingAction(false)
    setActionType(act.type)
    setActionTarget(act.targetId || nodes[0]?.id || "")
    setActionFrom(act.fromId || nodes[0]?.id || "")
    setActionTo(act.toId || nodes[1]?.id || nodes[0]?.id || "")
    setActionColor((act.color as any) || "active")
    setActionText(act.text || "")
    setActionSubText(act.subText || "")
    setActionDuration(act.duration || 0.5)
  }

  // Start creating new action
  const handleStartAdd = () => {
    setEditingActionId(null)
    setIsAddingAction(true)
    setActionType("highlight")
    setActionTarget(nodes[0]?.id || "")
    setActionFrom(nodes[0]?.id || "")
    setActionTo(nodes[1]?.id || nodes[0]?.id || "")
    setActionColor("active")
    setActionText("")
    setActionSubText("")
    setActionDuration(0.5)
  }

  // Save action (new or edited)
  const handleSaveAction = () => {
    const actionPayload: DynamicAction = {
      id: editingActionId || `act-${Date.now()}`,
      type: actionType,
      color: actionColor,
      duration: actionDuration,
    }

    if (actionType === "packet") {
      actionPayload.fromId = actionFrom
      actionPayload.toId = actionTo
      actionPayload.text = actionText || "PACKET"
    } else if (actionType === "tooltip") {
      actionPayload.targetId = actionTarget
      actionPayload.text = actionText || "Información"
      actionPayload.subText = actionSubText
    } else {
      actionPayload.targetId = actionTarget
      if (actionText) actionPayload.text = actionText
    }

    let updatedActions: DynamicAction[]
    if (editingActionId) {
      updatedActions = step.actions.map((a) => (a.id === editingActionId ? actionPayload : a))
    } else {
      updatedActions = [...step.actions, actionPayload]
    }

    onUpdateStep({
      ...step,
      actions: updatedActions,
    })

    setEditingActionId(null)
    setIsAddingAction(false)
  }

  const handleDeleteAction = (actionId: string) => {
    onUpdateStep({
      ...step,
      actions: step.actions.filter((a) => a.id !== actionId),
    })
    if (editingActionId === actionId) setEditingActionId(null)
  }

  const getActionIcon = (type: ActionType) => {
    switch (type) {
      case "packet":
        return <Send className="h-3.5 w-3.5 text-sky-500" />
      case "highlight":
        return <Zap className="h-3.5 w-3.5 text-amber-500" />
      case "pulse":
        return <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
      case "tooltip":
        return <MessageSquare className="h-3.5 w-3.5 text-purple-500" />
      case "fade":
        return <EyeOff className="h-3.5 w-3.5 text-slate-500" />
      default:
        return <Zap className="h-3.5 w-3.5 text-primary" />
    }
  }

  return (
    <aside className="flex h-full w-96 flex-col border-l border-border bg-card/60 backdrop-blur-md">
      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-primary">
            Configuración del Paso {stepIndex + 1}
          </span>
          <span className="rounded bg-accent/60 px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
            {step.duration?.toFixed(1) || "2.0"}s
          </span>
        </div>
        <h2 className="mt-1 text-sm font-bold text-foreground">
          {step.label || `Paso ${stepIndex + 1}`}
        </h2>
      </div>

      {/* ── Step Details Form ─────────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-y-auto p-4 space-y-4">
        <div>
          <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Título del Paso
          </label>
          <input
            type="text"
            value={step.label}
            onChange={(e) => onUpdateStep({ ...step, label: e.target.value })}
            placeholder="1. Origen prepara la trama"
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
          />
        </div>

        <div>
          <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Explicación Didáctica
          </label>
          <textarea
            rows={3}
            value={step.description}
            onChange={(e) => onUpdateStep({ ...step, description: e.target.value })}
            placeholder="Describe qué ocurre a nivel de protocolo..."
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
          />
        </div>

        {/* ── Actions Section ──────────────────────────────────────── */}
        <div className="border-t border-border pt-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Acciones Visuales ({step.actions.length})
            </h3>
            {!isAddingAction && !editingActionId && (
              <Button
                size="sm"
                onClick={handleStartAdd}
                disabled={nodes.length === 0}
                className="h-7 px-2.5 text-xs gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                Añadir Acción
              </Button>
            )}
          </div>

          {/* Form for Creating / Editing Action */}
          {(isAddingAction || editingActionId) && (
            <div className="mb-4 rounded-xl border border-primary/40 bg-accent/20 p-3.5 text-xs space-y-3 shadow-md">
              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <h4 className="font-bold text-primary">
                  {editingActionId ? "Editar Acción" : "Nueva Acción Visual"}
                </h4>
                <button
                  onClick={() => {
                    setIsAddingAction(false)
                    setEditingActionId(null)
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <div>
                <label className="text-[10px] uppercase font-semibold text-muted-foreground">Tipo de Acción</label>
                <select
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value as ActionType)}
                  className="mt-1 w-full rounded-md border border-border bg-background p-1.5 text-xs text-foreground"
                >
                  <option value="highlight">Resaltar Nodo</option>
                  <option value="packet">Enviar Paquete / Trama</option>
                  <option value="pulse">Efecto Pulso / Onda</option>
                  <option value="tooltip">Mostrar Tarjeta Tooltip</option>
                  <option value="fade">Atenuar / Ocultar Nodo</option>
                </select>
              </div>

              {actionType === "packet" ? (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] uppercase font-semibold text-muted-foreground">Origen</label>
                    <select
                      value={actionFrom}
                      onChange={(e) => setActionFrom(e.target.value)}
                      className="mt-1 w-full rounded-md border border-border bg-background p-1.5 text-xs text-foreground"
                    >
                      {nodes.map((n) => (
                        <option key={n.id} value={n.id}>
                          {n.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-semibold text-muted-foreground">Destino</label>
                    <select
                      value={actionTo}
                      onChange={(e) => setActionTo(e.target.value)}
                      className="mt-1 w-full rounded-md border border-border bg-background p-1.5 text-xs text-foreground"
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
                  <label className="text-[10px] uppercase font-semibold text-muted-foreground">Nodo Objetivo</label>
                  <select
                    value={actionTarget}
                    onChange={(e) => setActionTarget(e.target.value)}
                    className="mt-1 w-full rounded-md border border-border bg-background p-1.5 text-xs text-foreground"
                  >
                    {nodes.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {(actionType === "packet" || actionType === "tooltip") && (
                <div>
                  <label className="text-[10px] uppercase font-semibold text-muted-foreground">
                    Texto / Mensaje
                  </label>
                  <input
                    type="text"
                    value={actionText}
                    onChange={(e) => setActionText(e.target.value)}
                    placeholder={actionType === "packet" ? "ARP REQ" : "Mensaje principal"}
                    className="mt-1 w-full rounded-md border border-border bg-background p-1.5 text-xs text-foreground"
                  />
                </div>
              )}

              {actionType === "tooltip" && (
                <div>
                  <label className="text-[10px] uppercase font-semibold text-muted-foreground">Subtexto</label>
                  <input
                    type="text"
                    value={actionSubText}
                    onChange={(e) => setActionSubText(e.target.value)}
                    placeholder="Detalle secundario..."
                    className="mt-1 w-full rounded-md border border-border bg-background p-1.5 text-xs text-foreground"
                  />
                </div>
              )}

              <div>
                <label className="text-[10px] uppercase font-semibold text-muted-foreground">Color</label>
                <select
                  value={actionColor}
                  onChange={(e) => setActionColor(e.target.value as any)}
                  className="mt-1 w-full rounded-md border border-border bg-background p-1.5 text-xs text-foreground"
                >
                  <option value="active">Azul (Activo)</option>
                  <option value="success">Verde (Éxito / Respuesta)</option>
                  <option value="warn">Amarillo (Alerta / Petición)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsAddingAction(false)
                    setEditingActionId(null)
                  }}
                  className="h-7 text-xs"
                >
                  Cancelar
                </Button>
                <Button size="sm" onClick={handleSaveAction} className="h-7 text-xs gap-1">
                  <Check className="h-3 w-3" />
                  {editingActionId ? "Actualizar Acción" : "Guardar Acción"}
                </Button>
              </div>
            </div>
          )}

          {/* List of Configured Actions with Edit & Delete Buttons */}
          <div className="space-y-2">
            {step.actions.map((act) => (
              <div
                key={act.id}
                className={`flex items-center justify-between rounded-xl border p-2.5 text-xs transition-all ${
                  editingActionId === act.id
                    ? "border-primary bg-primary/10"
                    : "border-border bg-background hover:border-border-strong"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {getActionIcon(act.type)}
                  <div>
                    <span className="font-semibold capitalize text-foreground">{act.type}</span>
                    {act.text && (
                      <span className="ml-1.5 rounded bg-accent/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                        {act.text}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleStartEdit(act)}
                    className="p-1 rounded text-muted-foreground hover:text-primary hover:bg-accent/40 transition-colors"
                    title="Editar acción"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteAction(act.id)}
                    className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    title="Eliminar acción"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {step.actions.length === 0 && !isAddingAction && (
              <p className="text-center text-xs text-muted-foreground py-4">
                No hay acciones configuradas en este paso. Añade una para animar el lienzo.
              </p>
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}
