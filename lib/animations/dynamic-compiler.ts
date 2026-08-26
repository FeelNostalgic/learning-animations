import gsap from "gsap"
import type { DynamicAnimationData, DynamicStep, DynamicAction } from "@/types/dynamic-animation"

export interface PaletteColors {
  idle: string
  active: string
  success: string
  warn: string
  muted: string
  fg: string
  bg: string
  warnText: string
  successText: string
  subText: string
}

export function compileDynamicTimeline(
  animation: DynamicAnimationData,
  q: gsap.utils.SelectorFunc,
  C: PaletteColors
): gsap.core.Timeline {
  const tl = gsap.timeline({ paused: true })
  const nodeMap = new Map(animation.nodes.map((n) => [n.id, n]))

  // 1. Initial State Setup
  animation.nodes.forEach((node) => {
    gsap.set(q(`#node-${node.id}`), { x: node.x, y: node.y, opacity: 1 })
    gsap.set(q(`#node-${node.id} .node-circle`), { stroke: C.idle, strokeWidth: 1.5, opacity: 1 })
    gsap.set(q(`#node-${node.id} .ring`), { scale: 1, opacity: 0 })
    gsap.set(q(`#badge-${node.id}`), { opacity: 0, y: 0 })
  })

  // Set packets hidden at their origin
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
        gsap.set(q(`#tooltip-${action.id}`), { opacity: 0, y: 8 })
      }
    })
  })

  // 2. Compile Steps & Actions into Timeline
  animation.steps.forEach((step, stepIndex) => {
    tl.addLabel(step.id || `step-${stepIndex + 1}`)

    if (!step.actions || step.actions.length === 0) {
      // Small dummy tween so the step has a timeline duration
      tl.to({}, { duration: 0.5 })
      return
    }

    step.actions.forEach((action, actionIndex) => {
      const position = actionIndex === 0 ? undefined : "<"
      const duration = action.duration || 0.5
      const colorVal = action.color ? C[action.color] || C.active : C.active

      switch (action.type) {
        case "highlight": {
          if (action.targetId) {
            tl.to(
              q(`#node-${action.targetId} .node-circle`),
              {
                stroke: colorVal,
                strokeWidth: 2.5,
                opacity: 1,
                duration,
              },
              position
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
                opacity: 0.5,
                repeat: 2,
                yoyo: true,
                ease: "power1.inOut",
                duration: duration / 2,
                transformOrigin: "50% 50%",
              },
              position
            )
          }
          break
        }

        case "fade": {
          if (action.targetId) {
            tl.to(
              q(`#node-${action.targetId}`),
              {
                opacity: 0.35,
                duration,
              },
              position
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
                y: -10,
                duration: 0.3,
              },
              position
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
              duration,
              ease: "back.out(1.2)",
            },
            position
          )
          break
        }

        case "packet": {
          const fromNode = action.fromId ? nodeMap.get(action.fromId) : null
          const toNode = action.toId ? nodeMap.get(action.toId) : null

          if (fromNode && toNode) {
            // Reveal packet at origin
            tl.to(
              q(`#pkt-${action.id}`),
              {
                x: fromNode.x,
                y: fromNode.y,
                opacity: 1,
                duration: 0.05,
              },
              position
            )
              // Animate packet to destination
              .to(q(`#pkt-${action.id}`), {
                x: toNode.x,
                y: toNode.y,
                duration,
                ease: "power2.inOut",
              })
              // Hide packet after arrival
              .to(q(`#pkt-${action.id}`), {
                opacity: 0,
                duration: 0.1,
              })
          }
          break
        }
      }
    })
  })

  return tl
}
