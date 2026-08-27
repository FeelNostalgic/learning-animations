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

/**
 * Calculates SVG path data between two coordinates for various connector types.
 */
export function calculateConnectorPath(
  source: { x: number; y: number },
  target: { x: number; y: number },
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
 * Compiles a Universal Animation definition into an executable, frame-accurate GSAP timeline.
 */
export function compileUniversalTimeline(
  animation: UniversalAnimationData,
  q: gsap.utils.SelectorFunc,
  C: UniversalPaletteColors
): gsap.core.Timeline {
  const tl = gsap.timeline({ paused: true })
  const nodeMap = new Map<string, UniversalNode>(animation.nodes.map((n) => [n.id, n]))

  // 1. Initial State Setup
  animation.nodes.forEach((node) => {
    gsap.set(q(`#node-${node.id}`), {
      x: node.x,
      y: node.y,
      scale: node.scale ?? 1,
      rotation: node.rotation ?? 0,
      opacity: node.opacity ?? 1,
    })

    gsap.set(q(`#node-${node.id} .node-shape`), {
      stroke: node.stroke || C.idle,
      strokeWidth: node.strokeWidth || 1.5,
      fill: node.fill || "transparent",
      opacity: 1,
    })

    gsap.set(q(`#node-${node.id} .ring`), {
      scale: 1,
      opacity: 0,
    })

    gsap.set(q(`#badge-${node.id}`), {
      opacity: 0,
      y: 0,
    })
  })

  // Initial connector states
  const connectors = animation.connectors || []
  connectors.forEach((conn) => {
    gsap.set(q(`#conn-${conn.id}`), {
      stroke: conn.color ? C[conn.color] || conn.color : C.idle,
      strokeWidth: conn.strokeWidth || 1.5,
      opacity: 1,
    })
  })

  // Initial packet and tooltip states
  animation.steps.forEach((step) => {
    step.actions.forEach((action) => {
      if (action.type === "packet" && action.fromId) {
        const fromNode = nodeMap.get(action.fromId)
        if (fromNode) {
          gsap.set(q(`#pkt-${action.id}`), {
            x: fromNode.x,
            y: fromNode.y,
            opacity: 0,
          })
        }
      } else if (action.type === "tooltip") {
        gsap.set(q(`#tooltip-${action.id}`), {
          opacity: 0,
          y: 8,
        })
      } else if (action.type === "path_draw") {
        gsap.set(q(`#draw-${action.id}`), {
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
              if (action.transform.x !== undefined) targetVars.x = action.transform.x
              if (action.transform.y !== undefined) targetVars.y = action.transform.y
              if (action.transform.scale !== undefined) targetVars.scale = action.transform.scale
              if (action.transform.rotation !== undefined)
                targetVars.rotation = action.transform.rotation

              tl.to(q(`#node-${action.targetId}`), targetVars, actionStart)
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

              tl.to(q(`#node-${action.targetId} .node-shape`), styleVars, actionStart)
            }
            break
          }

          case "highlight": {
            if (action.targetId) {
              tl.to(
                q(`#node-${action.targetId} .node-shape`),
                {
                  stroke: colorVal,
                  strokeWidth: 2.5,
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
              tl.to(
                q(`#node-${action.targetId} .ring`),
                {
                  scale: 1.6,
                  opacity: 0.6,
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
              tl.to(
                q(`#node-${action.targetId}`),
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
              tl.to(
                q(`#badge-${action.targetId}`),
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
            tl.to(
              q(`#tooltip-${action.id}`),
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
              const appearDuration = 0.06
              const moveDuration = Math.max(0.2, actionDuration - 0.16)
              const hideDuration = 0.1

              tl.to(
                q(`#pkt-${action.id}`),
                {
                  x: fromNode.x,
                  y: fromNode.y,
                  opacity: 1,
                  duration: appearDuration,
                },
                actionStart
              )
                .to(
                  q(`#pkt-${action.id}`),
                  {
                    x: toNode.x,
                    y: toNode.y,
                    duration: moveDuration,
                    ease: "power2.inOut",
                  },
                  actionStart + appearDuration
                )
                .to(
                  q(`#pkt-${action.id}`),
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
            tl.to(
              q(`#draw-${action.id}`),
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
              tl.to(
                q(`#node-${action.targetId}`),
                {
                  scale: 1.1,
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
