import { describe, it, expect, beforeEach } from "vitest"
import gsap from "gsap"
import {
  compileUniversalTimeline,
  calculateConnectorPath,
  sampleConnectorPoints,
  type UniversalPaletteColors,
} from "@/lib/animations/universal-compiler"
import type { UniversalAnimationData } from "@/types/universal-animation"

const TEST_PALETTE: UniversalPaletteColors = {
  idle: "#94A3B8",
  active: "#2563EB",
  success: "#059669",
  warn: "#D97706",
  destructive: "#EF4444",
  primary: "#0070F3",
  muted: "#64748B",
  fg: "#0F172A",
  bg: "#E5EAF0",
  warnText: "#D97706",
  successText: "#059669",
  subText: "#64748B",
}

describe("Unified GSAP Single-Engine Compiler (Strict TDD)", () => {
  let mockDomElements: Map<string, any>
  let selectorCalls: string[]

  beforeEach(() => {
    mockDomElements = new Map()
    selectorCalls = []
  })

  const createMockSelector = () => {
    return (selector: string): any => {
      selectorCalls.push(selector)
      if (!mockDomElements.has(selector)) {
        mockDomElements.set(selector, {
          selector,
          style: {},
          classList: { add: () => {}, remove: () => {} },
          setAttribute: () => {},
          getAttribute: () => null,
        })
      }
      return mockDomElements.get(selector)
    }
  }

  const sampleAnimation: UniversalAnimationData = {
    title: "Ohm's Law & Circuit Analysis",
    description: "Interactive circuit physics animation.",
    discipline: "physics",
    topic: "Circuits",
    tags: ["physics", "circuits", "ohm"],
    difficulty: "intermediate",
    is_public: true,
    nodes: [
      { id: "battery", type: "shape", label: "Voltage Source", x: 150, y: 300, width: 100, height: 80 },
      { id: "resistor", type: "shape", label: "Resistor R1", x: 450, y: 150, width: 120, height: 60 },
      { id: "ground", type: "shape", label: "Ground", x: 450, y: 450, width: 80, height: 60 },
      { id: "math-formula", type: "math", label: "Ohm Formula", content: "V = I \\cdot R", x: 750, y: 250, width: 160, height: 70 },
    ],
    connectors: [
      { id: "c1", sourceId: "battery", targetId: "resistor", type: "orthogonal" },
      { id: "c2", sourceId: "resistor", targetId: "ground", type: "straight" },
      { id: "c3", sourceId: "ground", targetId: "battery", type: "bezier" },
    ],
    steps: [
      {
        id: "step-potential",
        label: "1. Apply Voltage",
        description: "Source establishes potential difference $V = 12\\text{V}$.",
        duration: 2.0,
        actions: [
          { id: "act-hl-battery", type: "highlight", targetId: "battery", color: "active" },
          { id: "act-pulse-battery", type: "pulse", targetId: "battery" },
          { id: "act-badge-battery", type: "badge", targetId: "battery", text: "12V" },
        ],
      },
      {
        id: "step-current-flow",
        label: "2. Current Flow",
        description: "Charge carriers flow through resistor $R = 4\\,\\Omega$.",
        duration: 3.0,
        actions: [
          { id: "act-pkt-flow", type: "packet", fromId: "battery", toId: "resistor", text: "I = 3A", color: "warn" },
          { id: "act-hl-resistor", type: "highlight", targetId: "resistor", color: "warn" },
        ],
      },
      {
        id: "step-eval",
        label: "3. Formula Calculation",
        description: "Compute $I = V / R = 3\\text{A}$.",
        duration: 2.5,
        actions: [
          { id: "act-formula-move", type: "transform", targetId: "math-formula", transform: { x: 750, y: 200, scale: 1.1 } },
          { id: "act-formula-hl", type: "highlight", targetId: "math-formula", color: "success" },
        ],
      },
    ],
  }

  it("compiles a timeline with accurate total duration, step labels and seek timestamps", () => {
    const selector = createMockSelector()
    const tl = compileUniversalTimeline(sampleAnimation, selector, TEST_PALETTE)

    expect(tl).toBeDefined()
    expect(tl.paused()).toBe(true)

    // Total duration: 2.0 + 3.0 + 2.5 = 7.5s
    expect(tl.totalDuration()).toBeCloseTo(7.5, 2)

    // Step labels mapped to exact start times
    expect(tl.labels["step-potential"]).toBe(0)
    expect(tl.labels["step-current-flow"]).toBe(2.0)
    expect(tl.labels["step-eval"]).toBe(5.0)
  })

  it("supports dual-compatible target selector queries for both React Flow DOM and SVG nodes", () => {
    const selector = createMockSelector()
    compileUniversalTimeline(sampleAnimation, selector, TEST_PALETTE)

    // Verify selectors include node targets with data attributes or IDs
    const checkedSelectors = selectorCalls.join(" ")
    expect(checkedSelectors).toMatch(/#node-battery|data-node-id="battery"/)
    expect(checkedSelectors).toMatch(/#node-resistor|data-node-id="resistor"/)
    expect(checkedSelectors).toMatch(/#node-math-formula|data-node-id="math-formula"/)
  })

  it("allows seamless bidirectional timeline scrubbing via seek and progress", () => {
    const selector = createMockSelector()
    const tl = compileUniversalTimeline(sampleAnimation, selector, TEST_PALETTE)

    // Initial state at 0%
    tl.progress(0)
    expect(tl.time()).toBe(0)

    // Scrub to 50%
    tl.progress(0.5)
    expect(tl.time()).toBeCloseTo(3.75, 2)

    // Seek directly to Step 2
    tl.seek("step-current-flow")
    expect(tl.time()).toBeCloseTo(2.0, 2)

    // Seek directly to Step 3
    tl.seek("step-eval")
    expect(tl.time()).toBeCloseTo(5.0, 2)

    // Scrub to 100%
    tl.progress(1.0)
    expect(tl.time()).toBeCloseTo(7.5, 2)
  })

  it("samples smooth continuous waypoints for orthogonal, straight, and bezier connectors", () => {
    const src = { x: 100, y: 100 }
    const tgt = { x: 400, y: 300 }

    const orthoPts = sampleConnectorPoints(src, tgt, "orthogonal", 10)
    expect(orthoPts.length).toBe(10)
    expect(orthoPts[0]).toEqual({ x: 100, y: 100 })
    expect(orthoPts[9]).toEqual({ x: 400, y: 300 })

    const bezierPts = sampleConnectorPoints(src, tgt, "bezier", 15)
    expect(bezierPts.length).toBe(15)
    expect(bezierPts[0]).toEqual({ x: 100, y: 100 })
    expect(bezierPts[14]).toEqual({ x: 400, y: 300 })

    const straightPts = sampleConnectorPoints(src, tgt, "straight", 5)
    expect(straightPts.length).toBe(5)
    expect(straightPts[0]).toEqual({ x: 100, y: 100 })
    expect(straightPts[4]).toEqual({ x: 400, y: 300 })
  })

  it("handles empty or single-step animations gracefully without errors", () => {
    const selector = createMockSelector()
    const emptyAnim: UniversalAnimationData = {
      title: "Empty Animation",
      description: "Empty test animation",
      discipline: "general",
      topic: "testing",
      tags: [],
      difficulty: "beginner",
      is_public: true,
      nodes: [],
      connectors: [],
      steps: [],
    }

    const tl = compileUniversalTimeline(emptyAnim, selector, TEST_PALETTE)
    expect(tl).toBeDefined()
    expect(tl.totalDuration()).toBe(0)
  })
})
