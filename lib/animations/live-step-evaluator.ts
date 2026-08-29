import type {
  UniversalNode,
  UniversalConnector,
  UniversalStep,
  UniversalAction,
} from "@/types/universal-animation"

export interface EvaluatedNodeState {
  highlightColor?: string
  pulseGlow?: boolean
  badgeText?: string
  tooltipText?: string
  overrideFill?: string
  overrideStroke?: string
  overrideStrokeWidth?: number
  overrideOpacity?: number
  offsetX?: number
  offsetY?: number
  scale?: number
  rotation?: number
}

export interface EvaluatedEdgeState {
  highlightColor?: string
  isAnimated?: boolean
  packetLabel?: string
  packetColor?: string
  strokeWidth?: number
}

export interface EvaluatedStepScene {
  nodeStates: Record<string, EvaluatedNodeState>
  edgeStates: Record<string, EvaluatedEdgeState>
  activeStepLabel: string
  activeStepDescription: string
  stepDuration: number
  hasInteraction: boolean
}

/**
 * Computes the real-time visual scene state for a specific step in the Studio.
 * Evaluates actions in the active step and any prior persistent state modifications.
 */
export function evaluateStepScene(
  nodes: UniversalNode[],
  connectors: UniversalConnector[],
  steps: UniversalStep[],
  targetStepIndex: number
): EvaluatedStepScene {
  const nodeStates: Record<string, EvaluatedNodeState> = {}
  const edgeStates: Record<string, EvaluatedEdgeState> = {}

  const activeStep = steps[targetStepIndex] || steps[0]

  if (!activeStep) {
    return {
      nodeStates,
      edgeStates,
      activeStepLabel: "",
      activeStepDescription: "",
      stepDuration: 2.0,
      hasInteraction: false,
    }
  }

  // 1. Process actions in the current step
  const actions: UniversalAction[] = activeStep.actions || []

  for (const act of actions) {
    const targetNodeId = act.targetId || act.fromId
    const targetEdgeId = act.connectorId || act.targetId

    // ── Actions applied to Nodes ─────────────────────────────────
    if (targetNodeId) {
      if (!nodeStates[targetNodeId]) {
        nodeStates[targetNodeId] = {}
      }
      const nState = nodeStates[targetNodeId]

      switch (act.type) {
        case "highlight": {
          nState.highlightColor = act.color || "active"
          break
        }
        case "pulse": {
          nState.pulseGlow = true
          nState.highlightColor = act.color || "warn"
          break
        }
        case "badge": {
          nState.badgeText = act.text || "1"
          break
        }
        case "tooltip": {
          nState.tooltipText = act.text || act.subText
          break
        }
        case "style": {
          if (act.style?.fill) nState.overrideFill = act.style.fill
          if (act.style?.stroke) nState.overrideStroke = act.style.stroke
          if (act.style?.strokeWidth !== undefined) nState.overrideStrokeWidth = act.style.strokeWidth
          if (act.style?.opacity !== undefined) nState.overrideOpacity = act.style.opacity
          break
        }
        case "fade": {
          nState.overrideOpacity = act.style?.opacity !== undefined ? act.style.opacity : 0.2
          break
        }
        case "transform": {
          if (act.transform?.x !== undefined) nState.offsetX = act.transform.x
          if (act.transform?.y !== undefined) nState.offsetY = act.transform.y
          if (act.transform?.scale !== undefined) nState.scale = act.transform.scale
          if (act.transform?.rotation !== undefined) nState.rotation = act.transform.rotation
          break
        }
        case "math_eval": {
          nState.badgeText = act.text || "="
          nState.highlightColor = act.color || "primary"
          break
        }
      }
    }

    // ── Actions applied to Connectors / Packets ──────────────────
    if (targetEdgeId || (act.fromId && act.toId)) {
      // Find matching connector ID if fromId and toId are provided
      let edgeId = targetEdgeId
      if (!edgeId && act.fromId && act.toId) {
        const foundConn = connectors.find(
          (c) =>
            (c.sourceId === act.fromId && c.targetId === act.toId) ||
            (c.sourceId === act.toId && c.targetId === act.fromId)
        )
        if (foundConn) edgeId = foundConn.id
      }

      if (edgeId) {
        if (!edgeStates[edgeId]) {
          edgeStates[edgeId] = {}
        }
        const eState = edgeStates[edgeId]

        if (act.type === "packet") {
          eState.isAnimated = true
          eState.packetLabel = act.text || "Paquete"
          eState.packetColor = act.color || "#3B82F6"
        } else if (act.type === "highlight") {
          eState.highlightColor = act.color || "active"
        } else if (act.type === "path_draw") {
          eState.isAnimated = true
          eState.highlightColor = act.color || "primary"
        }
      }
    }
  }

  return {
    nodeStates,
    edgeStates,
    activeStepLabel: activeStep.label,
    activeStepDescription: activeStep.description,
    stepDuration: activeStep.duration || 2.0,
    hasInteraction: Boolean(activeStep.interaction),
  }
}
