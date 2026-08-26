"use client"

import { useState } from "react"
import { Plus, Trash2, Zap, Send, MessageSquare, Sparkles, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import type {
  DynamicStep,
  DynamicAction,
  DynamicNode,
  ActionType,
} from "@/types/dynamic-animation"

interface TimelinePanelProps {
  steps: DynamicStep[]
  nodes: DynamicNode[]
  selectedStepIndex: number
  onSelectStep: (index: number) => void
  onAddStep: () => void
  onDeleteStep: (index: number) => void
  onUpdateStep: (index: number, step: DynamicStep) => void
}

export function TimelinePanel({
  steps,
  nodes,
  selectedStepIndex,
  onSelectStep,
  onAddStep,
  onDeleteStep,
  onUpdateStep,
}: TimelinePanelProps) {
  const [isAddingAction, setIsAddingAction] = useState(false)
  const [newActionType, setNewActionType] = useState<ActionType>("highlight")
  const [newActionTarget, setNewActionTarget] = useState(nodes[0]?.id || "")
  const [newActionFrom, setNewActionFrom] = useState(nodes[0]?.id || "")
  const [newActionTo, setNewActionTo] = useState(nodes[1]?.id || nodes[0]?.id || "")
  const [newActionColor, setNewActionColor] = useState<"active" | "success" | "warn">("active")
  const [newActionText, setNewActionText] = useState("")
  const [newActionSubText, setNewActionSubText] = useState("")

  const activeStep = steps[selectedStepIndex]

  const handleAddAction = () => {
    if (!activeStep) return

    const newAction: DynamicAction = {
      id: `act-${Date.now()}`,
      type: newActionType,
      color: newActionColor,
      duration: 0.5,
    }

    if (newActionType === "packet") {
      newAction.fromId = newActionFrom
      newAction.toId = newActionTo
      newAction.text = newActionText || "PACKET"
    } else if (newActionType === "tooltip") {
      newAction.targetId = newActionTarget
      newAction.text = newActionText || "Información"
      newAction.subText = newActionSubText
    } else {
      newAction.targetId = newActionTarget
      if (newActionText) newAction.text = newActionText
    }

    const updatedStep = {
      ...activeStep,
      actions: [...activeStep.actions, newAction],
    }

    onUpdateStep(selectedStepIndex, updatedStep)
    setIsAddingAction(false)
    setNewActionText("")
    setNewActionSubText("")
  }

  const handleDeleteAction = (actionId: string) => {
    if (!activeStep) return
    const updatedStep = {
      ...activeStep,
      actions: activeStep.actions.filter((a) => a.id !== actionId),
    }
    onUpdateStep(selectedStepIndex, updatedStep)
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
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-4">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
            Línea de Tiempo (Pasos)
          </h2>
          <p className="text-xs text-muted-foreground">{steps.length} pasos configurados</p>
        </div>
        <Button size="sm" onClick={onAddStep} className="h-8 gap-1.5 text-xs">
          <Plus className="h-3.5 w-3.5" />
          Añadir Paso
        </Button>
      </div>

      {/* Step Selector Pills */}
      <div className="flex gap-2 overflow-x-auto border-b border-border bg-card/30 p-3">
        {steps.map((step, idx) => (
          <button
            key={step.id || idx}
            onClick={() => onSelectStep(idx)}
            className={`flex shrink-0 items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
              selectedStepIndex === idx
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground hover:bg-accent/40"
            }`}
          >
            <span>Paso {idx + 1}</span>
            {steps.length > 1 && (
              <Trash2
                className="h-3 w-3 opacity-60 hover:text-destructive hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation()
                  onDeleteStep(idx)
                }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Active Step Details */}
      {activeStep ? (
        <div className="flex flex-1 flex-col overflow-y-auto p-4">
          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-medium text-muted-foreground">Título del Paso</label>
              <input
                type="text"
                value={activeStep.label}
                onChange={(e) =>
                  onUpdateStep(selectedStepIndex, { ...activeStep, label: e.target.value })
                }
                placeholder="1. Origen envía paquete"
                className="mt-1 w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-muted-foreground">
                Explicación didáctica
              </label>
              <textarea
                rows={3}
                value={activeStep.description}
                onChange={(e) =>
                  onUpdateStep(selectedStepIndex, {
                    ...activeStep,
                    description: e.target.value,
                  })
                }
                placeholder="Describe qué está ocurriendo a nivel de red..."
                className="mt-1 w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Actions List */}
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Acciones de Animación ({activeStep.actions.length})
              </h3>
              {!isAddingAction && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddingAction(true)}
                  disabled={nodes.length === 0}
                  className="h-7 px-2 text-xs"
                >
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  Acción
                </Button>
              )}
            </div>

            {/* Action Creator Card */}
            {isAddingAction && (
              <div className="mb-4 rounded-xl border border-primary/40 bg-accent/20 p-3 text-xs">
                <h4 className="mb-2 font-bold text-primary">Nueva Acción Visual</h4>

                <div className="space-y-2.5">
                  <div>
                    <label className="text-[10px] uppercase text-muted-foreground">Tipo</label>
                    <select
                      value={newActionType}
                      onChange={(e) => setNewActionType(e.target.value as ActionType)}
                      className="mt-0.5 w-full rounded border border-border bg-background p-1.5 text-xs"
                    >
                      <option value="highlight">Resaltar Nodo</option>
                      <option value="packet">Enviar Paquete</option>
                      <option value="pulse">Efecto Pulso / Onda</option>
                      <option value="tooltip">Mostrar Tooltip / Info</option>
                      <option value="fade">Atenuar / Ocultar</option>
                    </select>
                  </div>

                  {newActionType === "packet" ? (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] uppercase text-muted-foreground">Origen</label>
                        <select
                          value={newActionFrom}
                          onChange={(e) => setNewActionFrom(e.target.value)}
                          className="mt-0.5 w-full rounded border border-border bg-background p-1.5 text-xs"
                        >
                          {nodes.map((n) => (
                            <option key={n.id} value={n.id}>
                              {n.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase text-muted-foreground">Destino</label>
                        <select
                          value={newActionTo}
                          onChange={(e) => setNewActionTo(e.target.value)}
                          className="mt-0.5 w-full rounded border border-border bg-background p-1.5 text-xs"
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
                      <label className="text-[10px] uppercase text-muted-foreground">Nodo Destino</label>
                      <select
                        value={newActionTarget}
                        onChange={(e) => setNewActionTarget(e.target.value)}
                        className="mt-0.5 w-full rounded border border-border bg-background p-1.5 text-xs"
                      >
                        {nodes.map((n) => (
                          <option key={n.id} value={n.id}>
                            {n.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {(newActionType === "packet" || newActionType === "tooltip") && (
                    <div>
                      <label className="text-[10px] uppercase text-muted-foreground">
                        Texto de Etiqueta
                      </label>
                      <input
                        type="text"
                        value={newActionText}
                        onChange={(e) => setNewActionText(e.target.value)}
                        placeholder={newActionType === "packet" ? "ARP REQ" : "Mensaje principal"}
                        className="mt-0.5 w-full rounded border border-border bg-background p-1.5 text-xs"
                      />
                    </div>
                  )}

                  {newActionType === "tooltip" && (
                    <div>
                      <label className="text-[10px] uppercase text-muted-foreground">Subtexto</label>
                      <input
                        type="text"
                        value={newActionSubText}
                        onChange={(e) => setNewActionSubText(e.target.value)}
                        placeholder="Detalle secundario..."
                        className="mt-0.5 w-full rounded border border-border bg-background p-1.5 text-xs"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-[10px] uppercase text-muted-foreground">Color</label>
                    <select
                      value={newActionColor}
                      onChange={(e) => setNewActionColor(e.target.value as any)}
                      className="mt-0.5 w-full rounded border border-border bg-background p-1.5 text-xs"
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
                      onClick={() => setIsAddingAction(false)}
                      className="h-7 text-xs"
                    >
                      Cancelar
                    </Button>
                    <Button size="sm" onClick={handleAddAction} className="h-7 text-xs">
                      Guardar Acción
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Render actions */}
            <div className="space-y-2">
              {activeStep.actions.map((act) => (
                <div
                  key={act.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-background p-2.5 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    {getActionIcon(act.type)}
                    <div>
                      <span className="font-semibold capitalize text-foreground">{act.type}</span>
                      {act.text && (
                        <span className="ml-1.5 rounded bg-accent/40 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                          {act.text}
                        </span>
                      )}
                    </div>
                  </div>
                  <Trash2
                    className="h-3.5 w-3.5 cursor-pointer text-muted-foreground transition-colors hover:text-destructive"
                    onClick={() => handleDeleteAction(act.id)}
                  />
                </div>
              ))}

              {activeStep.actions.length === 0 && !isAddingAction && (
                <p className="text-center text-xs text-muted-foreground py-4">
                  No hay acciones en este paso. Añade al menos una acción (ej. enviar paquete o resaltar nodo).
                </p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </aside>
  )
}
