"use client"

import React, { useState, useEffect, useCallback, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  type Connection,
  type Edge,
  type Node,
} from "@xyflow/react"
import { AssetsSidebar } from "@/components/builder/assets-sidebar"
import { Canvas } from "@/components/builder/canvas"
import { TimelineBottomBar } from "@/components/builder/timeline-bottom-bar"
import { StepInspector } from "@/components/builder/step-inspector"
import { BackgroundInspectorDialog } from "@/components/builder/background-inspector-dialog"
import { AnimationPlayer } from "@/components/animations/animation-player"
import { UniversalAnimationPlayer } from "@/components/animations/universal-animation-player"
import { saveAnimation, getAnimationById } from "@/app/builder/actions"
import { toast } from "sonner"
import {
  universalToReactFlow,
  reactFlowToUniversal,
} from "@/lib/animations/react-flow-adapter"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  Save,
  Eye,
  CheckCircle2,
  AlertCircle,
  Loader2,
  PenLine,
  FilePlus,
  Globe,
  Lock,
  GraduationCap,
  Layers,
  BookOpen,
} from "lucide-react"
import type {
  UniversalAnimationData,
  UniversalNode,
  UniversalStep,
  UniversalNodeType,
  DisciplineType,
  DifficultyLevel,
  AnimationBackground,
} from "@/types/universal-animation"

const DISCIPLINES: { key: DisciplineType; label: string }[] = [
  { key: "general", label: "General" },
  { key: "math", label: "Matemáticas" },
  { key: "physics", label: "Física" },
  { key: "computer_science", label: "Computación / TI" },
  { key: "chemistry", label: "Química" },
  { key: "biology", label: "Biología" },
]

const INITIAL_UNIVERSAL_ANIMATION: UniversalAnimationData = {
  title: "Concepto Educativo Interactivo",
  description: "Explicación paso a paso de conceptos abstractos con KaTeX y trayectorias.",
  discipline: "math",
  topic: "Cálculo y Álgebra",
  tags: ["educación", "interactivo"],
  difficulty: "intermediate",
  is_public: false,
  nodes: [
    {
      id: "node-func",
      type: "math",
      label: "Función f(x)",
      x: 320,
      y: 220,
      content: "f(x) = x^2 - 4x + 4",
      fill: "var(--card)",
      stroke: "#0070F3",
      strokeWidth: 2,
      width: 200,
      height: 80,
    },
    {
      id: "node-root",
      type: "shape",
      label: "Raíz x = 2",
      x: 720,
      y: 220,
      shapeDetails: { shapeType: "circle", radius: 36 },
      fill: "var(--card)",
      stroke: "#10B981",
      strokeWidth: 2,
      width: 80,
      height: 80,
    },
  ],
  connectors: [
    {
      id: "conn-1",
      sourceId: "node-func",
      targetId: "node-root",
      type: "bezier",
      directed: "forward",
      label: "Evaluación",
      color: "#0070F3",
      strokeWidth: 2,
      labelPosition: 0.5,
    },
  ],
  steps: [
    {
      id: "step-1",
      label: "1. Planteamiento de la función",
      description: "Analizamos la función cuadrática $f(x) = (x-2)^2$.",
      duration: 2.5,
      actions: [
        { id: "act-1", type: "highlight", targetId: "node-func", color: "active" },
        { id: "act-2", type: "pulse", targetId: "node-func" },
      ],
      interaction: {
        type: "variable_slider",
        variableName: "x",
        min: -5,
        max: 5,
        step: 0.5,
        defaultValue: 2,
      },
    },
    {
      id: "step-2",
      label: "2. Comprobación de la raíz",
      description: "Para $x = 2$, el valor de $f(2) = 0$.",
      duration: 2.0,
      actions: [
        { id: "act-3", type: "highlight", targetId: "node-root", color: "success" },
        { id: "act-4", type: "badge", targetId: "node-root", text: "f(2) = 0" },
      ],
      interaction: {
        type: "quiz",
        question: "¿Cuántas raíces reales tiene la función $f(x) = (x-2)^2$?",
        options: [
          { id: "opt-1", text: "1 raíz real doble ($x=2$)", isCorrect: true, feedback: "¡Correcto! El discriminante $\\Delta = 0$." },
          { id: "opt-2", text: "2 raíces reales distintas", isCorrect: false, feedback: "Incorrecto, la gráfica es tangente al eje x." },
        ],
      },
    },
  ],
}

function BuilderContent() {
  const searchParams = useSearchParams()
  const editId = searchParams.get("id")

  const [animationId, setAnimationId] = useState<string | null>(editId)
  const [title, setTitle] = useState(INITIAL_UNIVERSAL_ANIMATION.title)
  const [discipline, setDiscipline] = useState<DisciplineType>(INITIAL_UNIVERSAL_ANIMATION.discipline)
  const [topic, setTopic] = useState(INITIAL_UNIVERSAL_ANIMATION.topic)
  const [tags, setTags] = useState<string[]>(INITIAL_UNIVERSAL_ANIMATION.tags || [])
  const [description, setDescription] = useState(INITIAL_UNIVERSAL_ANIMATION.description)
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(INITIAL_UNIVERSAL_ANIMATION.difficulty)
  const [isPublic, setIsPublic] = useState(INITIAL_UNIVERSAL_ANIMATION.is_public)
  const [background, setBackground] = useState<AnimationBackground | undefined>(
    INITIAL_UNIVERSAL_ANIMATION.background
  )
  const [steps, setSteps] = useState<UniversalStep[]>(INITIAL_UNIVERSAL_ANIMATION.steps)

  // React Flow State
  const initialRf = universalToReactFlow(INITIAL_UNIVERSAL_ANIMATION)
  const [nodes, setNodes, onNodesChange] = useNodesState(initialRf.nodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialRf.edges)

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null)
  const [selectedStepIndex, setSelectedStepIndex] = useState(0)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingAnimation, setIsLoadingAnimation] = useState(false)

  // Connect handler in React Flow with forward arrowhead by default
  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            type: "smoothstep",
            animated: true,
            markerEnd: { type: MarkerType.ArrowClosed, color: "var(--primary, #0070F3)" },
            style: { stroke: "var(--primary, #0070F3)", strokeWidth: 2 },
            data: {
              connectorType: "bezier",
              directed: "forward",
              labelPosition: 0.5,
              showLabel: true,
            },
          },
          eds
        )
      )
    },
    [setEdges]
  )

  // Load existing animation if id is in URL
  useEffect(() => {
    if (!editId) return

    async function fetchAnimation() {
      setIsLoadingAnimation(true)
      const res = await getAnimationById(editId as string)
      setIsLoadingAnimation(false)

      if (res.success && res.data) {
        const anim = res.data
        setAnimationId(anim.id || null)
        setTitle(anim.title)
        setDiscipline(anim.discipline || "general")
        setTopic(anim.topic)
        setTags(anim.tags || [])
        setDescription(anim.description || "")
        setDifficulty(anim.difficulty || "beginner")
        setIsPublic(anim.is_public ?? false)
        setBackground(anim.background)
        setSteps(anim.steps || [])

        const rf = universalToReactFlow(anim)
        setNodes(rf.nodes)
        setEdges(rf.edges)
      } else {
        toast.error("No se pudo cargar la animación", {
          description: "Verifica que el identificador sea correcto o que tengas permisos de acceso.",
        })
      }
    }

    fetchAnimation()
  }, [editId, setNodes, setEdges])

  // Reset to brand new animation
  const handleNewAnimation = () => {
    setAnimationId(null)
    setTitle("Nueva Animación Educativa")
    setDiscipline("general")
    setTopic("Tema Personalizado")
    setTags(["educación"])
    setDescription("Descripción pedagógica...")
    setDifficulty("beginner")
    setIsPublic(false)
    setBackground(undefined)
    setSteps(INITIAL_UNIVERSAL_ANIMATION.steps)

    const rf = universalToReactFlow(INITIAL_UNIVERSAL_ANIMATION)
    setNodes(rf.nodes)
    setEdges(rf.edges)
    setSelectedNodeId(null)
    setSelectedEdgeId(null)
    setSelectedStepIndex(0)
    setIsPreviewOpen(false)
    toast.info("Lienzo reiniciado", {
      description: "Plantilla en blanco cargada para una nueva animación.",
    })
    window.history.replaceState(null, "", "/builder")
  }

  // Node operations
  const handleAddNode = (type: UniversalNodeType, preset?: Partial<UniversalNode>) => {
    const id = `node-${Date.now()}`
    const width = preset?.width || (type === "math" ? 200 : type === "text" ? 220 : type === "image" ? 140 : type === "container" ? 320 : 100)
    const height = preset?.height || (type === "math" ? 80 : type === "text" ? 110 : type === "image" ? 140 : type === "container" ? 200 : 60)

    const newNode: Node = {
      id,
      type,
      position: { x: 500, y: 250 },
      zIndex: 0,
      style: {
        width,
        height,
        zIndex: 0,
      },
      data: {
        label: preset?.label || `Nodo ${nodes.length + 1}`,
        content: preset?.content || "",
        fill: preset?.fill || "var(--card)",
        stroke: preset?.stroke || "var(--primary)",
        strokeWidth: preset?.strokeWidth !== undefined ? preset.strokeWidth : 2,
        opacity: preset?.opacity ?? 1,
        imageUrl: preset?.imageUrl,
        imageFit: preset?.imageFit || "contain",
        shapeDetails: preset?.shapeDetails,
        props: preset?.props,
        nodeType: type,
        width,
        height,
        zIndex: 0,
      },
    }
    setNodes((nds) => nds.concat(newNode))
    setSelectedNodeId(id)
    setSelectedEdgeId(null)
  }

  const handleUpdateNode = (updatedNode: UniversalNode) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === updatedNode.id) {
          return {
            ...n,
            position: { x: updatedNode.x, y: updatedNode.y },
            style: {
              ...n.style,
              width: updatedNode.width,
              height: updatedNode.height,
              zIndex: updatedNode.zIndex ?? n.zIndex ?? 0,
            },
            zIndex: updatedNode.zIndex ?? n.zIndex ?? 0,
            data: {
              ...n.data,
              label: updatedNode.label,
              content: updatedNode.content,
              fill: updatedNode.fill,
              stroke: updatedNode.stroke,
              strokeWidth: updatedNode.strokeWidth,
              opacity: updatedNode.opacity,
              imageUrl: updatedNode.imageUrl,
              imageFit: updatedNode.imageFit,
              shapeDetails: updatedNode.shapeDetails,
              props: updatedNode.props,
              width: updatedNode.width,
              height: updatedNode.height,
              zIndex: updatedNode.zIndex ?? n.zIndex ?? 0,
            },
          }
        }
        return n
      })
    )
  }

  const handleDeleteNode = (nodeId: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId))
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId))
    if (selectedNodeId === nodeId) setSelectedNodeId(null)
  }

  const handleDuplicateNode = (nodeId: string) => {
    const sourceNode = nodes.find((n) => n.id === nodeId)
    if (!sourceNode) return

    const newId = `node-${Date.now()}`
    const clonedNode: Node = {
      ...sourceNode,
      id: newId,
      position: {
        x: sourceNode.position.x + 40,
        y: sourceNode.position.y + 40,
      },
      data: {
        ...sourceNode.data,
        label: `${sourceNode.data.label || "Nodo"} (Copia)`,
      },
      selected: true,
    }

    setNodes((nds) => nds.map((n) => ({ ...n, selected: false })).concat(clonedNode))
    setSelectedNodeId(newId)
    setSelectedEdgeId(null)
  }

  const handleUpdateNodeZIndex = (nodeId: string, action: "front" | "back" | "up" | "down") => {
    setNodes((nds) => {
      const targetNode = nds.find((n) => n.id === nodeId)
      if (!targetNode) return nds

      const allZ = nds.map((n) => n.zIndex ?? 0)
      const maxZ = Math.max(0, ...allZ)
      const minZ = Math.min(0, ...allZ)
      const currentZ = targetNode.zIndex ?? 0

      let newZ = currentZ
      if (action === "front") newZ = maxZ + 1
      else if (action === "back") newZ = minZ - 1
      else if (action === "up") newZ = currentZ + 1
      else if (action === "down") newZ = currentZ - 1

      return nds.map((n) =>
        n.id === nodeId
          ? {
              ...n,
              zIndex: newZ,
              style: { ...n.style, zIndex: newZ },
              data: { ...n.data, zIndex: newZ },
            }
          : n
      )
    })
  }

  // Edge operations
  const handleUpdateEdge = (updatedEdge: Edge) => {
    setEdges((eds) => eds.map((e) => (e.id === updatedEdge.id ? updatedEdge : e)))
  }

  const handleDeleteEdge = (edgeId: string) => {
    setEdges((eds) => eds.filter((e) => e.id !== edgeId))
    if (selectedEdgeId === edgeId) setSelectedEdgeId(null)
  }

  // Step operations
  const handleAddStep = () => {
    const newStepIndex = steps.length + 1
    const newStep: UniversalStep = {
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

  const handleUpdateStep = (updatedStep: UniversalStep) => {
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

  // Current compiled universal animation
  const currentUniversalData = reactFlowToUniversal(nodes, edges, steps, {
    id: animationId || undefined,
    title,
    description,
    discipline,
    topic,
    tags,
    difficulty,
    is_public: isPublic,
    background,
  })

  // Save Animation to Supabase
  const handleSave = async () => {
    setIsSaving(true)

    const res = await saveAnimation(currentUniversalData)
    setIsSaving(false)

    if (res.success) {
      if (res.id) setAnimationId(res.id)
      if (isPublic) {
        toast.success("¡Animación guardada y publicada!", {
          description: "La animación ahora es visible en el catálogo de la comunidad.",
        })
      } else {
        toast.success("¡Animación guardada con éxito!", {
          description: "Guardada como borrador privado en tu panel de animaciones.",
        })
      }
    } else {
      toast.error("Error al guardar", {
        description: res.error || "No se pudo guardar la animación en Supabase.",
      })
    }
  }

  // Selected entities
  const selectedRfNode = nodes.find((n) => n.id === selectedNodeId)
  const selectedUniversalNode: UniversalNode | null = selectedRfNode
    ? {
        id: selectedRfNode.id,
        type: (selectedRfNode.type as any) || "shape",
        label: (selectedRfNode.data.label as string) || selectedRfNode.id,
        x: Math.round(selectedRfNode.position.x),
        y: Math.round(selectedRfNode.position.y),
        content: selectedRfNode.data.content as string,
        fill: selectedRfNode.data.fill as string,
        stroke: selectedRfNode.data.stroke as string,
        strokeWidth: selectedRfNode.data.strokeWidth as number,
        opacity: selectedRfNode.data.opacity as number,
        imageUrl: selectedRfNode.data.imageUrl as string,
        imageFit: selectedRfNode.data.imageFit as any,
        shapeDetails: selectedRfNode.data.shapeDetails as any,
        props: selectedRfNode.data.props as any,
        width: typeof selectedRfNode.style?.width === "number" ? selectedRfNode.style.width : (selectedRfNode.data.width as number),
        height: typeof selectedRfNode.style?.height === "number" ? selectedRfNode.style.height : (selectedRfNode.data.height as number),
        zIndex: selectedRfNode.zIndex ?? (selectedRfNode.data.zIndex as number) ?? 0,
      }
    : null

  const selectedEdge = edges.find((e) => e.id === selectedEdgeId) || null
  const selectedStep = steps[selectedStepIndex] || null

  if (isLoadingAnimation) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span>Cargando animación educativa...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      {/* ── Sub Toolbar (Title, Free Topic, Discipline, Visibility) ── */}
      <div className="flex h-13 items-center justify-between border-b border-border/80 bg-card/70 px-4 shrink-0 shadow-xs gap-3 overflow-x-auto">
        <div className="flex items-center gap-2.5">
          {/* Title Editor */}
          <div className="flex items-center gap-2 rounded-lg border border-border bg-background/80 px-2.5 py-1 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/30">
            <PenLine className="h-3.5 w-3.5 text-primary shrink-0" />
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-40 md:w-56 bg-transparent text-xs font-bold text-foreground focus:outline-none"
              placeholder="Título de la animación..."
              title="Haz clic para editar el título"
            />
          </div>

          {/* Free Custom Category / Topic */}
          <div className="flex items-center gap-1.5 rounded-lg border border-border bg-background/80 px-2.5 py-1">
            <Layers className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-32 md:w-44 bg-transparent text-xs font-semibold text-foreground focus:outline-none"
              placeholder="Categoría / Tema libre..."
              title="Escribe cualquier categoría personalizada"
            />
          </div>

          {/* Discipline Selector */}
          <div className="hidden sm:flex items-center gap-1.5 rounded-lg border border-border bg-background/80 px-2.5 py-1">
            <GraduationCap className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <select
              value={discipline}
              onChange={(e) => setDiscipline(e.target.value as DisciplineType)}
              className="bg-transparent text-xs font-semibold text-primary focus:outline-none cursor-pointer"
              title="Selecciona la disciplina pedagógica"
            >
              {DISCIPLINES.map((d) => (
                <option key={d.key} value={d.key} className="bg-card text-foreground">
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          {/* Public / Private Toggle */}
          <button
            type="button"
            onClick={() => setIsPublic(!isPublic)}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold border transition-all cursor-pointer ${
              isPublic
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "border-border bg-background/80 text-muted-foreground hover:text-foreground"
            }`}
            title={isPublic ? "Animación pública visible en el catálogo" : "Animación privada/borrador"}
          >
            {isPublic ? <Globe className="size-3.5" /> : <Lock className="size-3.5" />}
            <span className="hidden md:inline">{isPublic ? "Pública" : "Privada"}</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">


          {/* New Animation Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNewAnimation}
            className="gap-1.5 text-xs h-7 font-medium text-muted-foreground hover:text-foreground cursor-pointer"
            title="Crear una animación en blanco desde cero"
          >
            <FilePlus className="h-3.5 w-3.5 text-primary" />
            <span className="hidden sm:inline">Nueva</span>
          </Button>

          {/* Background Customizer Dialog */}
          <BackgroundInspectorDialog
            background={background}
            onUpdateBackground={setBackground}
          />

          {/* Preview Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPreviewOpen(!isPreviewOpen)}
            className="gap-1.5 text-xs h-7 font-semibold cursor-pointer"
          >
            <Eye className="h-3.5 w-3.5" />
            {isPreviewOpen ? "Editor Studio" : "Previsualizar"}
          </Button>

          {/* Save / Update Button */}
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="gap-1.5 text-xs h-7 font-semibold cursor-pointer"
            title="Guardar cambios en Supabase"
          >
            {isSaving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            <span>{animationId ? "Actualizar" : "Guardar"}</span>
          </Button>
        </div>
      </div>

      {/* ── Main Workspace Body ───────────────────────────────────── */}
      {isPreviewOpen ? (
        <div className="flex flex-1 overflow-hidden p-4">
          <div className="h-full w-full overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
            <AnimationPlayer steps={steps} title={title}>
              <UniversalAnimationPlayer animation={currentUniversalData} />
            </AnimationPlayer>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Main Top Area: Left (Full Height Assets), Center (Canvas + Floating Inspector), Right (Step Inspector) */}
          <div className="flex flex-1 overflow-hidden">
            {/* Left: Multidisciplinary Assets Palette (100% Vertical Space) */}
            <AssetsSidebar onAddNode={handleAddNode} />

            {/* Center: React Flow Canvas (Loose Handles, Context Menu & Floating Property Panel in Top-Left) */}
            <Canvas
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              selectedNodeId={selectedNodeId}
              selectedEdgeId={selectedEdgeId}
              selectedNode={selectedUniversalNode}
              selectedEdge={selectedEdge}
              background={background}
              onSelectNode={(id) => {
                setSelectedNodeId(id)
                if (id) setSelectedEdgeId(null)
              }}
              onSelectEdge={(id) => {
                setSelectedEdgeId(id)
                if (id) setSelectedNodeId(null)
              }}
              onUpdateNode={handleUpdateNode}
              onUpdateEdge={handleUpdateEdge}
              onDeleteNode={handleDeleteNode}
              onDeleteEdge={handleDeleteEdge}
              onDuplicateNode={handleDuplicateNode}
              onUpdateNodeZIndex={handleUpdateNodeZIndex}
            />

            {/* Right: Step Actions & Interactivity Inspector (Always Step Inspector) */}
            <StepInspector
              step={selectedStep}
              stepIndex={selectedStepIndex}
              nodes={currentUniversalData.nodes}
              allSteps={steps}
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
      <ReactFlowProvider>
        <BuilderContent />
      </ReactFlowProvider>
    </Suspense>
  )
}
