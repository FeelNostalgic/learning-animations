"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { AssetsSidebar } from "@/components/builder/assets-sidebar"
import { Canvas } from "@/components/builder/canvas"
import { TimelineBottomBar } from "@/components/builder/timeline-bottom-bar"
import { StepInspector } from "@/components/builder/step-inspector"
import { AnimationPlayer } from "@/components/animations/animation-player"
import { DynamicAnimationPlayer } from "@/components/animations/dynamic-animation-player"
import { saveAnimation, getAnimationById } from "@/app/builder/actions"
import { Button } from "@/components/ui/button"
import {
  Save,
  Eye,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Tag,
  PenLine,
  X,
  FilePlus,
} from "lucide-react"
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
  { id: "node-pc-a", type: "pc", label: "PC A", x: 280, y: 440, ip: "192.168.1.10", mac: "AA:BB:CC:11:22:33" },
  { id: "node-sw", type: "switch", label: "Switch", x: 600, y: 220 },
  { id: "node-pc-b", type: "pc", label: "PC B", x: 920, y: 440, ip: "192.168.1.20", mac: "B4:22:DA:FF:11:22" },
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

function BuilderContent() {
  const searchParams = useSearchParams()
  const editId = searchParams.get("id")

  const [animationId, setAnimationId] = useState<string | null>(editId)
  const [title, setTitle] = useState("Nueva Animación de Red")
  const [topic, setTopic] = useState("Acceso a la Red")
  const [description, setDescription] = useState("Descripción pedagógica de la animación")
  const [nodes, setNodes] = useState<DynamicNode[]>(INITIAL_NODES)
  const [links, setLinks] = useState<DynamicLink[]>(INITIAL_LINKS)
  const [steps, setSteps] = useState<DynamicStep[]>(INITIAL_STEPS)
  const [lastSavedSnapshot, setLastSavedSnapshot] = useState<string | null>(null)

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [selectedStepIndex, setSelectedStepIndex] = useState(0)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingAnimation, setIsLoadingAnimation] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [isCustomTopic, setIsCustomTopic] = useState(false)

  // Load existing animation if id is in URL
  useEffect(() => {
    if (!editId) return

    async function fetchAnimation() {
      setIsLoadingAnimation(true)
      const res = await getAnimationById(editId as string)
      setIsLoadingAnimation(false)

      if (res.success && res.data) {
        setAnimationId(res.data.id || null)
        setTitle(res.data.title)
        setTopic(res.data.topic)
        setDescription(res.data.description || "")
        setNodes(res.data.nodes || [])
        setLinks(res.data.links || [])
        setSteps(res.data.steps || [])

        // Store snapshot of clean loaded state
        setLastSavedSnapshot(
          JSON.stringify({
            title: res.data.title,
            topic: res.data.topic,
            description: res.data.description || "",
            nodes: res.data.nodes || [],
            links: res.data.links || [],
            steps: res.data.steps || [],
          })
        )
      } else {
        setStatusMessage({ type: "error", text: "No se pudo cargar la animación solicitada." })
      }
    }

    fetchAnimation()
  }, [editId])

  // Reset to brand new animation
  const handleNewAnimation = () => {
    setAnimationId(null)
    setTitle("Nueva Animación de Red")
    setTopic("Acceso a la Red")
    setDescription("Descripción pedagógica de la animación")
    setNodes(INITIAL_NODES)
    setLinks(INITIAL_LINKS)
    setSteps(INITIAL_STEPS)
    setSelectedNodeId(null)
    setSelectedStepIndex(0)
    setIsPreviewOpen(false)
    setLastSavedSnapshot(null)
    setStatusMessage({ type: "success", text: "Lienzo reiniciado para una nueva animación." })
    setTimeout(() => setStatusMessage(null), 3000)
    window.history.replaceState(null, "", "/builder")
  }

  // Node operations
  const handleAddNode = (type: NodeType) => {
    const id = `node-${Date.now()}`
    const newNode: DynamicNode = {
      id,
      type,
      label: `${type.toUpperCase()} ${nodes.length + 1}`,
      x: 600,
      y: 325,
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
      id: animationId || undefined,
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
      if (res.id) setAnimationId(res.id)
      // Update saved snapshot
      setLastSavedSnapshot(
        JSON.stringify({
          title,
          topic,
          description,
          nodes,
          links,
          steps,
        })
      )
      setStatusMessage({
        type: "success",
        text: animationId
          ? "¡Animación actualizada con éxito!"
          : "¡Animación guardada y publicada en Supabase!",
      })
      setTimeout(() => setStatusMessage(null), 4000)
    } else {
      setStatusMessage({ type: "error", text: res.error || "Error al guardar" })
    }
  }

  // Dirty state tracking
  const currentSnapshot = JSON.stringify({
    title,
    topic,
    description,
    nodes,
    links,
    steps,
  })
  const isEditing = Boolean(animationId)
  const hasUnsavedChanges = isEditing
    ? lastSavedSnapshot === null || currentSnapshot !== lastSavedSnapshot
    : true

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || null
  const selectedStep = steps[selectedStepIndex] || null

  if (isLoadingAnimation) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span>Cargando animación...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      {/* ── Sub Toolbar (Title & Category) ────────────────────────── */}
      <div className="flex h-12 items-center justify-between border-b border-border/80 bg-card/70 px-4 shrink-0 shadow-xs">
        <div className="flex items-center gap-3">
          {/* Title Editor */}
          <div className="flex items-center gap-2 rounded-lg border border-border bg-background/80 px-2.5 py-1 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/30">
            <PenLine className="h-3.5 w-3.5 text-primary shrink-0" />
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-52 md:w-64 bg-transparent text-xs font-bold text-foreground focus:outline-none"
              placeholder="Título de la animación..."
              title="Haz clic para editar el título"
            />
          </div>

          {/* Topic / Category Selector with Cancel Option */}
          <div className="flex items-center gap-1.5 rounded-lg border border-border bg-background/80 px-2.5 py-1">
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
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={topic}
                  autoFocus
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-32 bg-transparent text-xs font-semibold text-primary focus:outline-none"
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
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {statusMessage && (
            <div
              className={`flex items-center gap-1.5 text-xs font-medium ${
                statusMessage.type === "success" ? "text-emerald-500" : "text-destructive"
              }`}
            >
              {statusMessage.type === "success" ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                <AlertCircle className="h-3.5 w-3.5" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* New Animation Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNewAnimation}
            className="gap-1.5 text-xs h-7 font-medium text-muted-foreground hover:text-foreground cursor-pointer"
            title="Crear una animación en blanco desde cero"
          >
            <FilePlus className="h-3.5 w-3.5 text-primary" />
            <span className="hidden sm:inline">Nueva Animación</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPreviewOpen(!isPreviewOpen)}
            className="gap-1.5 text-xs h-7 font-semibold cursor-pointer"
          >
            <Eye className="h-3.5 w-3.5" />
            {isPreviewOpen ? "Editor" : "Previsualizar"}
          </Button>

          {/* Save / Update Button */}
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving || (isEditing && !hasUnsavedChanges)}
            className={`gap-1.5 text-xs h-7 font-semibold transition-all ${
              isEditing && !hasUnsavedChanges
                ? "opacity-50 cursor-not-allowed bg-muted text-muted-foreground hover:bg-muted"
                : "cursor-pointer"
            }`}
            title={
              isEditing && !hasUnsavedChanges
                ? "No hay cambios pendientes por guardar"
                : isEditing
                ? "Actualizar cambios en Supabase"
                : "Guardar y publicar animación"
            }
          >
            {isSaving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            {isEditing ? (hasUnsavedChanges ? "Actualizar" : "Actualizado") : "Guardar y Publicar"}
          </Button>
        </div>
      </div>

      {/* ── Main Workspace Body ───────────────────────────────────── */}
      {isPreviewOpen ? (
        <div className="flex flex-1 overflow-hidden p-4">
          <div className="h-full w-full overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
            <AnimationPlayer steps={steps} title={title}>
              <DynamicAnimationPlayer
                animation={{
                  id: animationId || undefined,
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

export default function BuilderPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full w-full items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      }
    >
      <BuilderContent />
    </Suspense>
  )
}
