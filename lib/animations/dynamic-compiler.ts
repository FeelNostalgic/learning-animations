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

  // 2. Compile Steps & Actions into Timeline with exact step time alignment
  let currentTimelineTime = 0

  animation.steps.forEach((step, stepIndex) => {
    const stepDuration = step.duration || 2.0
    const stepStartTime = currentTimelineTime
    const stepLabel = step.id || `step-${stepIndex + 1}`

    // Add step label at exact accumulated second
    tl.addLabel(stepLabel, stepStartTime)

    if (step.actions && step.actions.length > 0) {
      step.actions.forEach((action) => {
        const actionDuration = Math.min(action.duration || 0.8, stepDuration)
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
                  duration: actionDuration,
                },
                stepStartTime
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
                  duration: actionDuration / 2,
                  transformOrigin: "50% 50%",
                },
                stepStartTime
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
                  duration: actionDuration,
                },
                stepStartTime
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
                  duration: Math.min(0.3, actionDuration),
                },
                stepStartTime
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
              stepStartTime
            )
            break
          }

          case "packet": {
            const fromNode = action.fromId ? nodeMap.get(action.fromId) : null
            const toNode = action.toId ? nodeMap.get(action.toId) : null

            if (fromNode && toNode) {
              const appearDuration = 0.05
              const moveDuration = Math.max(0.2, actionDuration - 0.15)
              const hideDuration = 0.1

              tl.to(
                q(`#pkt-${action.id}`),
                {
                  x: fromNode.x,
                  y: fromNode.y,
                  opacity: 1,
                  duration: appearDuration,
                },
                stepStartTime
              )
                .to(
                  q(`#pkt-${action.id}`),
                  {
                    x: toNode.x,
                    y: toNode.y,
                    duration: moveDuration,
                    ease: "power2.inOut",
                  },
                  stepStartTime + appearDuration
                )
                .to(
                  q(`#pkt-${action.id}`),
                  {
                    opacity: 0,
                    duration: hideDuration,
                  },
                  stepStartTime + appearDuration + moveDuration
                )
            }
            break
          }
        }
      })
    }

    // Advance timeline to stepStartTime + stepDuration
    currentTimelineTime = stepStartTime + stepDuration
    tl.set({}, {}, currentTimelineTime)
  })

  return tl
}
