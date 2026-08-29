import { describe, it, expect } from "vitest"
import { evaluateStepScene } from "@/lib/animations/live-step-evaluator"
import type {
  UniversalNode,
  UniversalConnector,
  UniversalStep,
} from "@/types/universal-animation"

describe("Live Step Scene Evaluator (WYSIWYG 1:1)", () => {
  const mockNodes: UniversalNode[] = [
    {
      id: "node-pc1",
      type: "network",
      label: "PC 1",
      x: 100,
      y: 100,
      fill: "#0F172A",
      stroke: "#2563EB",
    },
    {
      id: "node-pc2",
      type: "network",
      label: "PC 2",
      x: 400,
      y: 100,
      fill: "#0F172A",
      stroke: "#2563EB",
    },
  ]

  const mockConnectors: UniversalConnector[] = [
    {
      id: "conn-1",
      sourceId: "node-pc1",
      targetId: "node-pc2",
      type: "straight",
      directed: "forward",
    },
  ]

  const mockSteps: UniversalStep[] = [
    {
      id: "step-1",
      label: "1. Envío de Petición",
      description: "PC 1 envía una trama ARP Request a PC 2.",
      duration: 2.5,
      actions: [
        {
          id: "act-1",
          type: "highlight",
          targetId: "node-pc1",
          color: "active",
        },
        {
          id: "act-2",
          type: "badge",
          targetId: "node-pc1",
          text: "ARP Req",
        },
        {
          id: "act-3",
          type: "packet",
          connectorId: "conn-1",
          text: "Who has 192.168.1.2?",
          color: "#3B82F6",
        },
      ],
    },
    {
      id: "step-2",
      label: "2. Respuesta y Transformación",
      description: "PC 2 recibe la petición y responde con su MAC.",
      duration: 3.0,
      actions: [
        {
          id: "act-4",
          type: "pulse",
          targetId: "node-pc2",
          color: "success",
        },
        {
          id: "act-5",
          type: "tooltip",
          targetId: "node-pc2",
          text: "MAC: AA:BB:CC:DD:EE:FF",
        },
        {
          id: "act-6",
          type: "style",
          targetId: "node-pc2",
          style: {
            fill: "#059669",
            stroke: "#34D399",
            strokeWidth: 4,
          },
        },
        {
          id: "act-7",
          type: "transform",
          targetId: "node-pc2",
          transform: {
            x: 20,
            y: -10,
            scale: 1.1,
            rotation: 5,
          },
        },
      ],
    },
  ]

  it("returns clean idle state in edit mode when isPlaying is false", () => {
    const scene = evaluateStepScene(mockNodes, mockConnectors, mockSteps, 0, false)

    expect(scene.activeStepLabel).toBe("1. Envío de Petición")
    expect(scene.nodeStates).toEqual({})
    expect(scene.edgeStates).toEqual({})
  })

  it("evaluates Step 1 actions during active playback (isPlaying: true)", () => {
    const scene = evaluateStepScene(mockNodes, mockConnectors, mockSteps, 0, true)

    expect(scene.activeStepLabel).toBe("1. Envío de Petición")
    expect(scene.stepDuration).toBe(2.5)

    // Node 1 state
    const pc1State = scene.nodeStates["node-pc1"]
    expect(pc1State).toBeDefined()
    expect(pc1State.highlightColor).toBe("active")
    expect(pc1State.badgeText).toBe("ARP Req")

    // Edge 1 state
    const conn1State = scene.edgeStates["conn-1"]
    expect(conn1State).toBeDefined()
    expect(conn1State.isAnimated).toBe(true)
    expect(conn1State.packetLabel).toBe("Who has 192.168.1.2?")
    expect(conn1State.packetColor).toBe("#3B82F6")
  })

  it("evaluates Step 2 actions during active playback (isPlaying: true)", () => {
    const scene = evaluateStepScene(mockNodes, mockConnectors, mockSteps, 1, true)

    expect(scene.activeStepLabel).toBe("2. Respuesta y Transformación")

    // Node 2 state
    const pc2State = scene.nodeStates["node-pc2"]
    expect(pc2State).toBeDefined()
    expect(pc2State.pulseGlow).toBe(true)
    expect(pc2State.highlightColor).toBe("success")
    expect(pc2State.tooltipText).toBe("MAC: AA:BB:CC:DD:EE:FF")
    expect(pc2State.overrideFill).toBe("#059669")
    expect(pc2State.overrideStroke).toBe("#34D399")
    expect(pc2State.overrideStrokeWidth).toBe(4)
    expect(pc2State.offsetX).toBe(20)
    expect(pc2State.offsetY).toBe(-10)
    expect(pc2State.scale).toBe(1.1)
    expect(pc2State.rotation).toBe(5)
  })

  it("returns safe defaults when steps list is empty", () => {
    const scene = evaluateStepScene(mockNodes, mockConnectors, [], 0, true)
    expect(scene.activeStepLabel).toBe("")
    expect(scene.nodeStates).toEqual({})
    expect(scene.edgeStates).toEqual({})
  })
})
