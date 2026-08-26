"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AssetsSidebar } from "@/components/builder/assets-sidebar"
import { Canvas } from "@/components/builder/canvas"
import { TimelinePanel } from "@/components/builder/timeline-panel"
import { AnimationPlayer } from "@/components/animations/animation-player"
import { DynamicAnimationPlayer } from "@/components/animations/dynamic-animation-player"
import { saveAnimation } from "@/app/builder/actions"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Play, Save, Eye, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import type {
  DynamicAnimationData,
  DynamicNode,
  DynamicLink,
  DynamicStep,
  NodeType,
} from "@/types/dynamic-animation"

const INITIAL_NODES: DynamicNode[] = [
  { id: "node-pc-a", type: "pc", label: "PC A", x: 180, y: 320, ip: "192.168.1.10" },
  { id: "node-sw", type: "switch", label: "Switch", x: 400, y: 140 },
  { id: "node-pc-b", type: "pc", label: "PC B", x: 620, y: 320, ip: "192.168.1.20" },
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
    actions: [
      { id: "act-1", type: "highlight", targetId: "node-pc-a", color: "warn" },
      { id: "act-2", type: "pulse", targetId: "node-pc-a" },
    ],
  },
  {
    id: "step-2",
    label: "2. Envío de paquete al Switch",
    description: "La trama sale de PC A con destino al Switch central.",
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
  const router = useRouter()
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

  const handleUpdateStep = (index: number, updatedStep: DynamicStep) => {
    const newSteps = [...steps]
    newSteps[index] = updatedStep
    setSteps(newSteps)
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

  const animationMeta = {
    slug: "preview",
    title,
    description,
    topic,
    steps,
  }

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || null

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* ── Top Header ────────────────────────────────────────────── */}
      <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4 shadow-sm">
        <div className="flex items-center gap-4">
          <Link
            href="/animations"
            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-md border border-transparent bg-transparent px-2 py-1 text-sm font-bold text-foreground hover:border-border focus:border-primary focus:bg-background focus:outline-none"
              placeholder="Título de la animación..."
            />
            <span className="text-xs text-muted-foreground">en</span>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="rounded-md border border-transparent bg-transparent px-2 py-1 text-xs text-muted-foreground hover:border-border focus:border-primary focus:bg-background focus:outline-none"
              placeholder="Tema (ej. Acceso a la Red)"
            />
          </div>
        </div>

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
            className="gap-1.5 text-xs"
          >
            <Eye className="h-3.5 w-3.5" />
            {isPreviewOpen ? "Modo Editor" : "Previsualizar"}
          </Button>

          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="gap-1.5 text-xs"
          >
            {isSaving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            Guardar y Publicar
          </Button>
        </div>
      </header>

      {/* ── Main Workspace Body ───────────────────────────────────── */}
      {isPreviewOpen ? (
        <div className="flex flex-1 overflow-hidden p-6">
          <div className="h-full w-full overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
            <AnimationPlayer animation={animationMeta}>
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
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Predefined Assets Palette */}
          <AssetsSidebar
            onAddNode={handleAddNode}
            selectedNode={selectedNode}
            onUpdateNode={handleUpdateNode}
            onDeleteNode={handleDeleteNode}
          />

          {/* Center: Interactive SVG Canvas */}
          <Canvas
            nodes={nodes}
            links={links}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
            onUpdateNodePosition={handleUpdateNodePosition}
            onAddLink={handleAddLink}
            onDeleteLink={handleDeleteLink}
          />

          {/* Right: Timeline & Actions Panel */}
          <TimelinePanel
            steps={steps}
            nodes={nodes}
            selectedStepIndex={selectedStepIndex}
            onSelectStep={setSelectedStepIndex}
            onAddStep={handleAddStep}
            onDeleteStep={handleDeleteStep}
            onUpdateStep={handleUpdateStep}
          />
        </div>
      )}
    </div>
  )
}
