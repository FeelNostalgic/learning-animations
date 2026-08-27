import type { Node, Edge } from "@xyflow/react"
import { MarkerType } from "@xyflow/react"
import type {
  UniversalAnimationData,
  UniversalNode,
  UniversalConnector,
  UniversalStep,
  DisciplineType,
  DifficultyLevel,
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
    type: node.type, // Custom node types: 'shape', 'math', 'text', 'network', 'container', 'code', 'icon'
    position: { x: node.x, y: node.y },
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
      iconName: node.iconName,
      shapeDetails: node.shapeDetails,
      props: node.props,
      ariaLabel: node.ariaLabel,
      nodeType: node.type,
    },
  }))

  const connectors: UniversalConnector[] = animation.connectors || (animation as any).links || []

  const edges: Edge[] = connectors.map((conn) => {
    const hasArrow = conn.directed === "forward" || conn.directed === "bidirectional"
    return {
      id: conn.id,
      source: (conn as any).sourceId || (conn as any).source,
      target: (conn as any).targetId || (conn as any).target,
      type: conn.type === "straight" ? "straight" : conn.type === "orthogonal" ? "step" : "smoothstep",
      animated: conn.dashed,
      label: conn.label,
      style: {
        stroke: conn.color || "var(--primary, #0070F3)",
        strokeWidth: conn.strokeWidth || 2,
        strokeDasharray: conn.dashed ? "6 6" : undefined,
      },
      markerEnd: hasArrow ? { type: MarkerType.ArrowClosed, color: conn.color || "var(--primary, #0070F3)" } : undefined,
      data: {
        connectorType: conn.type,
        directed: conn.directed,
        dashed: conn.dashed,
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
    return {
      id: n.id,
      type: (n.type as any) || d.nodeType || "shape",
      label: d.label || n.id,
      x: Math.round(n.position.x),
      y: Math.round(n.position.y),
      width: d.width,
      height: d.height,
      fill: d.fill,
      stroke: d.stroke,
      strokeWidth: d.strokeWidth,
      opacity: d.opacity,
      rotation: d.rotation,
      scale: d.scale,
      content: d.content,
      iconName: d.iconName,
      shapeDetails: d.shapeDetails,
      props: d.props,
      ariaLabel: d.ariaLabel,
    }
  })

  const universalConnectors: UniversalConnector[] = edges.map((e) => {
    const d = (e.data || {}) as Record<string, any>
    return {
      id: e.id,
      sourceId: e.source,
      targetId: e.target,
      type: d.connectorType || (e.type === "straight" ? "straight" : e.type === "step" ? "orthogonal" : "bezier"),
      directed: d.directed || (e.markerEnd ? "forward" : "none"),
      dashed: d.dashed || Boolean(e.animated),
      label: typeof e.label === "string" ? e.label : undefined,
      strokeWidth: typeof e.style?.strokeWidth === "number" ? e.style.strokeWidth : 2,
      color: typeof e.style?.stroke === "string" ? e.style.stroke : undefined,
    }
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
    nodes: universalNodes,
    connectors: universalConnectors,
    steps: steps || [],
    user_id: meta.user_id,
  }
}
