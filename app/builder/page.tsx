"use client"

import { useState } from "react"
import { AssetsSidebar } from "@/components/builder/assets-sidebar"
import { Canvas } from "@/components/builder/canvas"
import { TimelineBottomBar } from "@/components/builder/timeline-bottom-bar"
import { StepInspector } from "@/components/builder/step-inspector"
import { AnimationPlayer } from "@/components/animations/animation-player"
import { DynamicAnimationPlayer } from "@/components/animations/dynamic-animation-player"
import { saveAnimation } from "@/app/builder/actions"
import { Button } from "@/components/ui/button"
import { Save, Eye, CheckCircle2, AlertCircle, Loader2, Tag, PenLine, X } from "lucide-react"
import type {
  DynamicAnimationData,
  DynamicNode,
  DynamicLink,
  DynamicStep,
  NodeType,
} from "@/types/dynamic-animation"

const TOPIC_SUGGESTIONS = [
  "Acceso a la Red",
  "Capa de Internet / IP",
  "Capa de Transporte",
  "Capa de Aplicación",
  "Seguridad y Cifrado",
]

const INITIAL_NODES: DynamicNode[] = [
  { id: "node-pc-a", type: "pc", label: "PC A", x: 180, y: 320, ip: "192.168.1.10", mac: "AA:BB:CC:11:22:33" },
  { id: "node-sw", type: "switch", label: "Switch", x: 400, y: 140 },
  { id: "node-pc-b", type: "pc", label: "PC B", x: 620, y: 320, ip: "192.168.1.20", mac: "B4:22:DA:FF:11:22" },
]

const INITIAL_LINKS: DynamicLink[] = [
  { id: "link-1", source: "node-pc-a", target: "node-sw", dashed: true },
  { id: "link-2", source: "node-pc-b", target: "node-sw", dashed: true },
]

const INITIAL_STEPS: DynamicStep[] = [
  {
    id: "step-1",
    label: "1. PC A prepara el envío",
    description: "PC A quiere comunicarse con PC B y resalta en amarillo para iniciar la petición.",
    duration: 2.0,
    actions: [
      { id: "act-1", type: "highlight", targetId: "node-pc-a", color: "warn" },
      { id: "act-2", type: "pulse", targetId: "node-pc-a" },
    ],
  },
  {
    id: "step-2",
    label: "2. Envío de paquete al Switch",
    description: "La trama sale de PC A con destino al Switch central.",
    duration: 2.5,
    actions: [
      {
        id: "act-3",
        type: "packet",
        fromId: "node-pc-a",
        toId: "node-sw",
        text: "ARP REQ",
        color: "warn",
      },
    ],
  },
]

export default function BuilderPage() {
  const [title, setTitle] = useState("Nueva Animación de Red")
  const [topic, setTopic] = useState("Acceso a la Red")
  const [description, setDescription] = useState("Descripción pedagógica de la animación")
  const [nodes, setNodes] = useState<DynamicNode[]>(INITIAL_NODES)
  const [links, setLinks] = useState<DynamicLink[]>(INITIAL_LINKS)
  const [steps, setSteps] = useState<DynamicStep[]>(INITIAL_STEPS)

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [selectedStepIndex, setSelectedStepIndex] = useState(0)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [isCustomTopic, setIsCustomTopic] = useState(false)

  // Node operations
  const handleAddNode = (type: NodeType) => {
    const id = `node-${Date.now()}`
    const newNode: DynamicNode = {
      id,
      type,
      label: `${type.toUpperCase()} ${nodes.length + 1}`,
      x: 400,
      y: 230,
    }
    setNodes([...nodes, newNode])
    setSelectedNodeId(id)
  }

  const handleUpdateNode = (updatedNode: DynamicNode) => {
    setNodes(nodes.map((n) => (n.id === updatedNode.id ? updatedNode : n)))
  }

  const handleDeleteNode = (nodeId: string) => {
    setNodes(nodes.filter((n) => n.id !== nodeId))
    setLinks(links.filter((l) => l.source !== nodeId && l.target !== nodeId))
    if (selectedNodeId === nodeId) setSelectedNodeId(null)
  }

  const handleUpdateNodePosition = (nodeId: string, x: number, y: number) => {
    setNodes(nodes.map((n) => (n.id === nodeId ? { ...n, x, y } : n)))
  }

  // Link operations
  const handleAddLink = (sourceId: string, targetId: string) => {
    const exists = links.some(
      (l) =>
        (l.source === sourceId && l.target === targetId) ||
        (l.source === targetId && l.target === sourceId)
    )
    if (exists) return

    const newLink: DynamicLink = {
      id: `link-${Date.now()}`,
      source: sourceId,
      target: targetId,
      dashed: true,
    }
    setLinks([...links, newLink])
  }

  const handleDeleteLink = (linkId: string) => {
    setLinks(links.filter((l) => l.id !== linkId))
  }

  // Step operations
  const handleAddStep = () => {
    const newStepIndex = steps.length + 1
    const newStep: DynamicStep = {
      id: `step-${Date.now()}`,
      label: `${newStepIndex}. Nuevo Paso`,
      description: "Descripción de las acciones que ocurren en este paso.",
      duration: 2.0,
      actions: [],
    }
    setSteps([...steps, newStep])
    setSelectedStepIndex(steps.length)
  }

  const handleDeleteStep = (index: number) => {
    if (steps.length <= 1) return
    const newSteps = steps.filter((_, i) => i !== index)
    setSteps(newSteps)
    if (selectedStepIndex >= newSteps.length) {
      setSelectedStepIndex(newSteps.length - 1)
    }
  }

  const handleUpdateStep = (updatedStep: DynamicStep) => {
    const newSteps = [...steps]
    newSteps[selectedStepIndex] = updatedStep
    setSteps(newSteps)
  }

  const handleUpdateStepDuration = (index: number, newDuration: number) => {
    const newSteps = [...steps]
    newSteps[index] = {
      ...newSteps[index],
      duration: newDuration,
    }
    setSteps(newSteps)
  }

  const handleReorderSteps = (fromIndex: number, toIndex: number) => {
    const updated = [...steps]
    const [moved] = updated.splice(fromIndex, 1)
    updated.splice(toIndex, 0, moved)
    setSteps(updated)
    setSelectedStepIndex(toIndex)
  }

  // Save Animation to Supabase
  const handleSave = async () => {
    setIsSaving(true)
    setStatusMessage(null)

    const animationData: DynamicAnimationData = {
      title,
      description,
      topic,
      nodes,
      links,
      steps,
    }

    const res = await saveAnimation(animationData)
    setIsSaving(false)

    if (res.success) {
      setStatusMessage({ type: "success", text: "¡Animación guardada y publicada en Supabase con éxito!" })
      setTimeout(() => setStatusMessage(null), 4000)
    } else {
      setStatusMessage({ type: "error", text: res.error || "Error al guardar" })
    }
  }

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || null
  const selectedStep = steps[selectedStepIndex] || null

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      {/* ── Sub Toolbar (Title & Category) ────────────────────────── */}
      <div className="flex h-14 items-center justify-between border-b border-border/80 bg-card/70 px-6 shrink-0 shadow-sm">
        <div className="flex items-center gap-4">
          {/* Title Editor */}
          <div className="flex items-center gap-2 rounded-xl border border-border bg-background/80 px-3 py-1.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
            <PenLine className="h-3.5 w-3.5 text-primary shrink-0" />
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-56 md:w-72 bg-transparent text-xs font-bold text-foreground focus:outline-none"
              placeholder="Título de la animación..."
              title="Haz clic para editar el título"
            />
          </div>

          {/* Topic / Category Selector with Cancel Option */}
          <div className="flex items-center gap-2 rounded-xl border border-border bg-background/80 px-3 py-1.5">
            <Tag className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            {!isCustomTopic ? (
              <select
                value={topic}
                onChange={(e) => {
                  if (e.target.value === "__custom__") {
                    setIsCustomTopic(true)
                  } else {
                    setTopic(e.target.value)
                  }
                }}
                className="bg-transparent text-xs font-semibold text-primary focus:outline-none cursor-pointer"
                title="Selecciona la categoría o tema"
              >
                {TOPIC_SUGGESTIONS.map((t) => (
                  <option key={t} value={t} className="bg-card text-foreground">
                    {t}
                  </option>
                ))}
                <option value="__custom__" className="bg-card text-muted-foreground">
                  + Otra categoría...
                </option>
              </select>
            ) : (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={topic}
                  autoFocus
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-36 bg-transparent text-xs font-semibold text-primary focus:outline-none"
                  placeholder="Nueva categoría..."
                />
                <button
                  type="button"
                  onClick={() => {
                    setTopic("Acceso a la Red")
                    setIsCustomTopic(false)
                  }}
                  className="p-0.5 rounded text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
                  title="Volver a categorías predefinidas"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {statusMessage && (
            <div
              className={`flex items-center gap-1.5 text-xs font-medium ${
                statusMessage.type === "success" ? "text-emerald-500" : "text-destructive"
              }`}
            >
              {statusMessage.type === "success" ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPreviewOpen(!isPreviewOpen)}
            className="gap-1.5 text-xs h-8 font-semibold"
          >
            <Eye className="h-3.5 w-3.5" />
            {isPreviewOpen ? "Modo Editor" : "Previsualizar"}
          </Button>

          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="gap-1.5 text-xs h-8 font-semibold"
          >
            {isSaving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            Guardar y Publicar
          </Button>
        </div>
      </div>

      {/* ── Main Workspace Body ───────────────────────────────────── */}
      {isPreviewOpen ? (
        <div className="flex flex-1 overflow-hidden p-6">
          <div className="h-full w-full overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
            <AnimationPlayer steps={steps} title={title}>
              <DynamicAnimationPlayer
                animation={{
                  title,
                  description,
                  topic,
                  nodes,
                  links,
                  steps,
                }}
              />
            </AnimationPlayer>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Main Top Area: Left (Assets), Center (Canvas), Right (Step Inspector) */}
          <div className="flex flex-1 overflow-hidden">
            {/* Left: Predefined Assets Palette */}
            <AssetsSidebar
              onAddNode={handleAddNode}
              selectedNode={selectedNode}
              onUpdateNode={handleUpdateNode}
              onDeleteNode={handleDeleteNode}
            />

            {/* Center: Interactive SVG Canvas (Zoom, Pan, Context Menu) */}
            <Canvas
              nodes={nodes}
              links={links}
              selectedNodeId={selectedNodeId}
              onSelectNode={setSelectedNodeId}
              onUpdateNodePosition={handleUpdateNodePosition}
              onAddLink={handleAddLink}
              onDeleteLink={handleDeleteLink}
              onDeleteNode={handleDeleteNode}
            />

            {/* Right: Step Inspector & Action Form */}
            <StepInspector
              step={selectedStep}
              stepIndex={selectedStepIndex}
              nodes={nodes}
              onUpdateStep={handleUpdateStep}
            />
          </div>

          {/* Bottom Area: Horizontal DAW-style Timeline */}
          <TimelineBottomBar
            steps={steps}
            selectedStepIndex={selectedStepIndex}
            onSelectStep={setSelectedStepIndex}
            onAddStep={handleAddStep}
            onDeleteStep={handleDeleteStep}
            onUpdateStepDuration={handleUpdateStepDuration}
            onReorderSteps={handleReorderSteps}
          />
        </div>
      )}
    </div>
  )
}
