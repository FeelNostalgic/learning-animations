import gsap from "gsap"
import type {
  UniversalAnimationData,
  UniversalNode,
  UniversalConnector,
  UniversalStep,
  UniversalAction,
  ConnectorType,
} from "@/types/universal-animation"

export interface UniversalPaletteColors {
  idle: string
  active: string
  success: string
  warn: string
  destructive: string
  primary: string
  muted: string
  fg: string
  bg: string
  warnText: string
  successText: string
  subText: string
  [key: string]: string
}

export interface Point2D {
  x: number
  y: number
}

/**
 * Calculates SVG path data between two coordinates for various connector types.
 */
export function calculateConnectorPath(
  source: Point2D,
  target: Point2D,
  type: ConnectorType = "straight"
): string {
  const dx = target.x - source.x
  const dy = target.y - source.y

  switch (type) {
    case "bezier": {
      // Smooth cubic Bézier with natural curvature
      const cp1X = source.x + dx * 0.5
      const cp1Y = source.y
      const cp2X = source.x + dx * 0.5
      const cp2Y = target.y
      return `M ${source.x} ${source.y} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${target.x} ${target.y}`
    }

    case "orthogonal": {
      // Right-angled stepped connector
      const midX = source.x + dx * 0.5
      return `M ${source.x} ${source.y} L ${midX} ${source.y} L ${midX} ${target.y} L ${target.x} ${target.y}`
    }

    case "arc": {
      // Curved circular arc
      const dr = Math.sqrt(dx * dx + dy * dy)
      return `M ${source.x} ${source.y} A ${dr} ${dr} 0 0 1 ${target.x} ${target.y}`
    }

    case "straight":
    default:
      return `M ${source.x} ${source.y} L ${target.x} ${target.y}`
  }
}

/**
 * Samples N precise geometric waypoints along a connector trajectory for smooth path-following animations.
 */
export function sampleConnectorPoints(
  source: Point2D,
  target: Point2D,
  type: ConnectorType = "straight",
  sampleCount: number = 20
): Point2D[] {
  const count = Math.max(2, sampleCount)
  const points: Point2D[] = []
  const dx = target.x - source.x
  const dy = target.y - source.y

  if (type === "bezier") {
    const p0 = source
    const p1 = { x: source.x + dx * 0.5, y: source.y }
    const p2 = { x: source.x + dx * 0.5, y: target.y }
    const p3 = target

    for (let i = 0; i < count; i++) {
      const t = i / (count - 1)
      const u = 1 - t
      const tt = t * t
      const uu = u * u
      const uuu = uu * u
      const ttt = tt * t

      const x = uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x
      const y = uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y
      points.push({ x: +x.toFixed(2), y: +y.toFixed(2) })
    }
    return points
  }

  if (type === "orthogonal") {
    const midX = source.x + dx * 0.5
    const corner1 = { x: midX, y: source.y }
    const corner2 = { x: midX, y: target.y }

    for (let i = 0; i < count; i++) {
      const t = i / (count - 1)
      if (t <= 0.33) {
        const segT = t / 0.33
        points.push({ x: +(source.x + segT * (corner1.x - source.x)).toFixed(2), y: source.y })
      } else if (t <= 0.66) {
        const segT = (t - 0.33) / 0.33
        points.push({ x: midX, y: +(corner1.y + segT * (corner2.y - corner1.y)).toFixed(2) })
      } else {
        const segT = (t - 0.66) / 0.34
        points.push({ x: +(corner2.x + segT * (target.x - corner2.x)).toFixed(2), y: target.y })
      }
    }
    return points
  }

  // Straight line sampling
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1)
    points.push({
      x: +(source.x + t * dx).toFixed(2),
      y: +(source.y + t * dy).toFixed(2),
    })
  }

  return points
}

/**
 * Compiles a Universal Animation definition into an executable, frame-accurate GSAP timeline.
 */
export function compileUniversalTimeline(
  animation: UniversalAnimationData,
  q: gsap.utils.SelectorFunc,
  C: UniversalPaletteColors
): gsap.core.Timeline {
  const tl = gsap.timeline({ paused: true })
  const nodes = animation?.nodes || []
  const steps = animation?.steps || []
  const connectors = animation?.connectors || (animation as any)?.links || []
  const nodeMap = new Map<string, UniversalNode>(nodes.map((n) => [n.id, n]))
  const connectorMap = new Map<string, UniversalConnector>()

  connectors.forEach((conn: any) => {
    const sId = conn.sourceId || conn.source
    const tId = conn.targetId || conn.target
    connectorMap.set(`${sId}->${tId}`, conn)
    connectorMap.set(conn.id, conn)
  })

  const safeQ = (selector: string): any => {
    try {
      const res = q(selector)
      if (!res) return null
      if (Array.isArray(res) && res.length === 0) return null
      if (res instanceof NodeList && res.length === 0) return null
      return res
    } catch {
      return null
    }
  }

  // Multi-fallback query that matches React Flow nodes, DOM data attributes, and SVG IDs
  const resolveNodeTarget = (id: string, subSelector?: string): any => {
    const candidates = subSelector
      ? [
          `[data-node-id="${id}"] ${subSelector}`,
          `.react-flow__node[data-id="${id}"] ${subSelector}`,
          `#node-${id} ${subSelector}`,
          `[data-id="${id}"] ${subSelector}`,
        ]
      : [
          `[data-node-id="${id}"]`,
          `.react-flow__node[data-id="${id}"]`,
          `#node-${id}`,
          `[data-id="${id}"]`,
        ]

    for (const sel of candidates) {
      const el = safeQ(sel)
      if (el) return el
    }
    return safeQ(candidates[0])
  }

  const resolveEdgeTarget = (id: string): any => {
    const candidates = [
      `.react-flow__edge[data-id="${id}"] path.react-flow__edge-path`,
      `.react-flow__edge[data-id="${id}"] path`,
      `#connector-path-${id}`,
      `#conn-${id}`,
      `[data-edge-id="${id}"] path`,
    ]
    for (const sel of candidates) {
      const el = safeQ(sel)
      if (el) return el
    }
    return safeQ(candidates[0])
  }

  const safeSet = (target: any, vars: gsap.TweenVars) => {
    const els = typeof target === "string" ? safeQ(target) : target
    if (els) {
      gsap.set(els, vars)
    }
  }

  const safeTo = (target: any, vars: gsap.TweenVars, position?: gsap.Position) => {
    const els = typeof target === "string" ? safeQ(target) : target
    if (els) {
      tl.to(els, vars, position)
    }
  }

  // 1. Initial State Setup
  nodes.forEach((node) => {
    // Set initial transform state on the node view
    const nodeTarget = resolveNodeTarget(node.id)
    safeSet(nodeTarget, {
      scale: node.scale ?? 1,
      rotation: node.rotation ?? 0,
      opacity: node.opacity ?? 1,
    })

    const strokeWidth = node.strokeWidth !== undefined ? node.strokeWidth : 1.5
    const hasStroke = strokeWidth > 0 && node.stroke !== "none" && node.stroke !== "transparent"

    const shapeTarget = resolveNodeTarget(node.id, ".node-shape")
    safeSet(shapeTarget, {
      stroke: hasStroke ? node.stroke || C.idle : "none",
      strokeWidth: hasStroke ? strokeWidth : 0,
      fill: node.fill || "transparent",
      opacity: node.opacity ?? 1,
    })

    const ringTarget = resolveNodeTarget(node.id, ".ring")
    safeSet(ringTarget, {
      scale: 1,
      opacity: 0,
    })

    const badgeTarget = resolveNodeTarget(node.id, ".node-badge") || safeQ(`#badge-${node.id}`)
    safeSet(badgeTarget, {
      opacity: 0,
      y: 0,
    })
  })

  // Initial connector states
  connectors.forEach((conn: any) => {
    const edgeTarget = resolveEdgeTarget(conn.id)
    safeSet(edgeTarget, {
      stroke: conn.color ? C[conn.color] || conn.color : C.idle,
      strokeWidth: conn.strokeWidth || 2,
      opacity: 1,
    })
  })

  // Initial packet, tooltip and path draw states
  steps.forEach((step) => {
    step.actions?.forEach((action) => {
      if (action.type === "packet" && action.fromId) {
        const fromNode = nodeMap.get(action.fromId)
        if (fromNode) {
          safeSet(`#pkt-${action.id}`, {
            x: fromNode.x,
            y: fromNode.y,
            opacity: 0,
          })
        }
      } else if (action.type === "tooltip") {
        safeSet(`#tooltip-${action.id}`, {
          opacity: 0,
          y: 8,
        })
      } else if (action.type === "path_draw") {
        safeSet(`#draw-${action.id}`, {
          strokeDashoffset: 1000,
          opacity: 0,
        })
      }
    })
  })

  // 2. Sequential Step Compilation
  let currentTimelineTime = 0

  animation.steps.forEach((step, stepIndex) => {
    const stepDuration = step.duration || 2.0
    const stepStartTime = currentTimelineTime
    const stepLabel = step.id || `step-${stepIndex + 1}`

    // Register label for instant seek and step navigation
    tl.addLabel(stepLabel, stepStartTime)

    if (step.actions && step.actions.length > 0) {
      step.actions.forEach((action) => {
        const actionDuration = Math.min(action.duration || 0.8, stepDuration)
        const delay = action.delay || 0
        const actionStart = stepStartTime + delay
        const colorVal = action.color ? C[action.color] || action.color : C.active
        const ease = action.ease || "power2.inOut"

        switch (action.type) {
          case "transform": {
            if (action.targetId && action.transform) {
              const targetVars: gsap.TweenVars = {
                duration: actionDuration,
                ease,
              }
              const baseNode = nodeMap.get(action.targetId)
              if (action.transform.x !== undefined && baseNode) {
                targetVars.x = action.transform.x - baseNode.x
              } else if (action.transform.x !== undefined) {
                targetVars.x = action.transform.x
              }

              if (action.transform.y !== undefined && baseNode) {
                targetVars.y = action.transform.y - baseNode.y
              } else if (action.transform.y !== undefined) {
                targetVars.y = action.transform.y
              }

              if (action.transform.scale !== undefined) targetVars.scale = action.transform.scale
              if (action.transform.rotation !== undefined)
                targetVars.rotation = action.transform.rotation

              const target = resolveNodeTarget(action.targetId)
              safeTo(target, targetVars, actionStart)
            }
            break
          }

          case "style": {
            if (action.targetId && action.style) {
              const styleVars: gsap.TweenVars = {
                duration: actionDuration,
                ease,
              }
              if (action.style.fill !== undefined)
                styleVars.fill = C[action.style.fill] || action.style.fill
              if (action.style.stroke !== undefined)
                styleVars.stroke = C[action.style.stroke] || action.style.stroke
              if (action.style.strokeWidth !== undefined)
                styleVars.strokeWidth = action.style.strokeWidth
              if (action.style.opacity !== undefined) styleVars.opacity = action.style.opacity

              const shapeTarget = resolveNodeTarget(action.targetId, ".node-shape")
              safeTo(shapeTarget, styleVars, actionStart)
            }
            break
          }

          case "highlight": {
            if (action.targetId) {
              const shapeTarget = resolveNodeTarget(action.targetId, ".node-shape") || resolveNodeTarget(action.targetId)
              safeTo(
                shapeTarget,
                {
                  stroke: colorVal,
                  borderColor: colorVal,
                  strokeWidth: 3,
                  opacity: 1,
                  duration: actionDuration,
                  ease,
                },
                actionStart
              )
            }
            break
          }

          case "pulse": {
            if (action.targetId) {
              const ringTarget = resolveNodeTarget(action.targetId, ".ring") || resolveNodeTarget(action.targetId)
              safeTo(
                ringTarget,
                {
                  scale: 1.6,
                  opacity: 0.7,
                  repeat: 2,
                  yoyo: true,
                  ease: "power1.inOut",
                  duration: actionDuration / 2,
                  transformOrigin: "50% 50%",
                },
                actionStart
              )
            }
            break
          }

          case "fade": {
            if (action.targetId) {
              const target = resolveNodeTarget(action.targetId)
              safeTo(
                target,
                {
                  opacity: 0.25,
                  duration: actionDuration,
                  ease,
                },
                actionStart
              )
            }
            break
          }

          case "badge": {
            if (action.targetId) {
              const badgeTarget = resolveNodeTarget(action.targetId, ".node-badge") || safeQ(`#badge-${action.targetId}`)
              safeTo(
                badgeTarget,
                {
                  opacity: 1,
                  y: -12,
                  duration: Math.min(0.35, actionDuration),
                  ease: "back.out(1.5)",
                },
                actionStart
              )
            }
            break
          }

          case "tooltip": {
            const tooltipTarget = safeQ(`[data-tooltip-id="${action.id}"]`) || safeQ(`#tooltip-${action.id}`)
            safeTo(
              tooltipTarget,
              {
                opacity: 1,
                y: 0,
                duration: actionDuration,
                ease: "back.out(1.2)",
              },
              actionStart
            )
            break
          }

          case "packet": {
            const fromNode = action.fromId ? nodeMap.get(action.fromId) : null
            const toNode = action.toId ? nodeMap.get(action.toId) : null

            if (fromNode && toNode) {
              const matchingConn =
                connectorMap.get(`${action.fromId}->${action.toId}`) ||
                connectorMap.get(`${action.toId}->${action.fromId}`) ||
                (action.connectorId ? connectorMap.get(action.connectorId) : null)

              const connType = matchingConn?.type || "bezier"
              const waypoints = sampleConnectorPoints(fromNode, toNode, connType, 20)

              const appearDuration = 0.06
              const moveDuration = Math.max(0.2, actionDuration - 0.16)
              const hideDuration = 0.1

              const pktTarget = safeQ(`[data-packet-id="${action.id}"]`) || safeQ(`#pkt-${action.id}`)

              // 1. Appear at source
              safeTo(
                pktTarget,
                {
                  x: fromNode.x,
                  y: fromNode.y,
                  opacity: 1,
                  duration: appearDuration,
                },
                actionStart
              )

              // 2. Travel along the exact geometric path (curve/step) using sampled keyframes
              const stepInterval = moveDuration / (waypoints.length - 1)
              waypoints.forEach((pt, ptIdx) => {
                if (ptIdx > 0) {
                  safeTo(
                    pktTarget,
                    {
                      x: pt.x,
                      y: pt.y,
                      duration: stepInterval,
                      ease: "none",
                    },
                    actionStart + appearDuration + (ptIdx - 1) * stepInterval
                  )
                }
              })

              // 3. Hide at target
              safeTo(
                pktTarget,
                {
                  opacity: 0,
                  duration: hideDuration,
                },
                actionStart + appearDuration + moveDuration
              )
            }
            break
          }

          case "path_draw": {
            const edgeTarget = action.targetId ? resolveEdgeTarget(action.targetId) : safeQ(`#draw-${action.id}`)
            safeTo(
              edgeTarget,
              {
                opacity: 1,
                strokeDashoffset: 0,
                duration: actionDuration,
                ease: "power1.inOut",
              },
              actionStart
            )
            break
          }

          case "math_eval": {
            if (action.targetId) {
              const target = resolveNodeTarget(action.targetId)
              safeTo(
                target,
                {
                  scale: 1.15,
                  duration: actionDuration * 0.4,
                  yoyo: true,
                  repeat: 1,
                  ease: "power2.out",
                },
                actionStart
              )
            }
            break
          }
        }
      })
    }

    // Set timeline progress point to end of this step
    currentTimelineTime = stepStartTime + stepDuration
    tl.set({}, {}, currentTimelineTime)
  })

  return tl
}
