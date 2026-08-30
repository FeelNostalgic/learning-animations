import type { Node, Edge } from "@xyflow/react"
import { MarkerType } from "@xyflow/react"
import type {
  UniversalAnimationData,
  UniversalNode,
  UniversalConnector,
  UniversalStep,
  DisciplineType,
  DifficultyLevel,
  AnimationBackground,
} from "@/types/universal-animation"

export interface ReactFlowConversionMeta {
  id?: string
  title: string
  description?: string
  discipline?: DisciplineType
  topic?: string
  tags?: string[]
  difficulty?: DifficultyLevel
  is_public?: boolean
  background?: AnimationBackground
  user_id?: string
}

/**
 * Converts UniversalAnimationData domain structure into React Flow Nodes and Edges.
 */
export function universalToReactFlow(animation: UniversalAnimationData): {
  nodes: Node[]
  edges: Edge[]
} {
  const nodes: Node[] = (animation.nodes || []).map((node) => ({
    id: node.id,
    type: node.type,
    position: { x: node.x, y: node.y },
    zIndex: node.zIndex ?? 0,
    style: {
      width: node.width,
      height: node.height,
      zIndex: node.zIndex ?? 0,
    },
    data: {
      label: node.label,
      content: node.content,
      fill: node.fill,
      stroke: node.stroke,
      strokeWidth: node.strokeWidth,
      opacity: node.opacity,
      rotation: node.rotation,
      scale: node.scale,
      width: node.width,
      height: node.height,
      zIndex: node.zIndex ?? 0,
      textColor: node.textColor,
      iconColor: node.iconColor,
      imageUrl: node.imageUrl || (node.type === "image" ? node.content : undefined),
      imageFit: node.imageFit || "contain",
      iconName: node.iconName,
      shapeDetails: node.shapeDetails,
      props: node.props,
      ariaLabel: node.ariaLabel,
      nodeType: node.type,
    },
  }))

  const connectors: UniversalConnector[] = animation.connectors || (animation as any).links || []

  const edges: Edge[] = connectors.map((conn) => {
    const hasForwardArrow = conn.directed === "forward" || conn.directed === "bidirectional"
    const hasBackwardArrow = conn.directed === "backward" || conn.directed === "bidirectional"
    const strokeColor = conn.color || "var(--primary, #0070F3)"

    return {
      id: conn.id,
      source: (conn as any).sourceId || (conn as any).source,
      target: (conn as any).targetId || (conn as any).target,
      type: conn.type === "straight" ? "straight" : conn.type === "orthogonal" ? "step" : "smoothstep",
      animated: conn.dashed,
      label: conn.label,
      style: {
        stroke: strokeColor,
        strokeWidth: conn.strokeWidth !== undefined ? conn.strokeWidth : 2,
        strokeDasharray: conn.dashed ? "6 6" : undefined,
      },
      markerEnd: hasForwardArrow ? { type: MarkerType.ArrowClosed, color: strokeColor } : undefined,
      markerStart: hasBackwardArrow ? { type: MarkerType.ArrowClosed, color: strokeColor } : undefined,
      data: {
        connectorType: conn.type || "bezier",
        directed: conn.directed || "none",
        dashed: conn.dashed,
        rawLabel: conn.label,
        showLabel: conn.label !== undefined,
        labelPosition: (conn as any).labelPosition ?? 0.5,
      },
    }
  })

  return { nodes, edges }
}

/**
 * Reconstructs the UniversalAnimationData domain structure from React Flow Nodes and Edges.
 */
export function reactFlowToUniversal(
  nodes: Node[],
  edges: Edge[],
  steps: UniversalStep[],
  meta: ReactFlowConversionMeta
): UniversalAnimationData {
  const universalNodes: UniversalNode[] = nodes.map((n) => {
    const d = (n.data || {}) as Record<string, any>
    const width = typeof n.style?.width === "number" ? n.style.width : d.width
    const height = typeof n.style?.height === "number" ? n.style.height : d.height

    return {
      id: n.id,
      type: (n.type as any) || d.nodeType || "shape",
      label: d.label || n.id,
      x: Math.round(n.position.x),
      y: Math.round(n.position.y),
      width: typeof width === "number" ? Math.round(width) : undefined,
      height: typeof height === "number" ? Math.round(height) : undefined,
      fill: d.fill,
      stroke: d.stroke,
      strokeWidth: d.strokeWidth !== undefined ? d.strokeWidth : 2,
      opacity: d.opacity !== undefined ? d.opacity : 1,
      rotation: d.rotation,
      scale: d.scale,
      zIndex: n.zIndex ?? d.zIndex ?? 0,
      textColor: d.textColor,
      iconColor: d.iconColor,
      imageUrl: d.imageUrl || (n.type === "image" ? d.content : undefined),
      imageFit: d.imageFit || "contain",
      content: d.content || d.imageUrl,
      iconName: d.iconName,
      shapeDetails: d.shapeDetails,
      props: d.props,
      ariaLabel: d.ariaLabel,
    }
  })

  const universalConnectors: UniversalConnector[] = edges.map((e) => {
    const d = (e.data || {}) as Record<string, any>
    const directed =
      d.directed ||
      (e.markerStart && e.markerEnd
        ? "bidirectional"
        : e.markerStart
        ? "backward"
        : e.markerEnd
        ? "forward"
        : "none")

    return {
      id: e.id,
      sourceId: e.source,
      targetId: e.target,
      type: d.connectorType || (e.type === "straight" ? "straight" : e.type === "step" ? "orthogonal" : "bezier"),
      directed,
      dashed: d.dashed ?? Boolean(e.animated),
      label: d.showLabel === false ? undefined : typeof e.label === "string" ? e.label : d.rawLabel,
      strokeWidth: typeof e.style?.strokeWidth === "number" ? e.style.strokeWidth : 2,
      color: typeof e.style?.stroke === "string" ? e.style.stroke : undefined,
      ...(d.labelPosition !== undefined ? { labelPosition: d.labelPosition } : {}),
    } as UniversalConnector
  })

  return {
    id: meta.id,
    title: meta.title || "Nueva Animación Educativa",
    description: meta.description || "",
    discipline: meta.discipline || "general",
    topic: meta.topic || "General",
    tags: meta.tags || [],
    difficulty: meta.difficulty || "beginner",
    is_public: meta.is_public ?? false,
    background: meta.background,
    nodes: universalNodes,
    connectors: universalConnectors,
    steps: steps || [],
    user_id: meta.user_id,
  }
}
