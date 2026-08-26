import { describe, it, expect, vi } from "vitest"
import { compileDynamicTimeline, type PaletteColors } from "@/lib/animations/dynamic-compiler"
import type { DynamicAnimationData } from "@/types/dynamic-animation"

const mockPalette: PaletteColors = {
  idle: "#94A3B8",
  active: "#2563EB",
  success: "#059669",
  warn: "#D97706",
  muted: "#CBD5E1",
  fg: "#0F172A",
  bg: "#E5EAF0",
  warnText: "#111827",
  successText: "#F8FAFC",
  subText: "#475569",
}

describe("compileDynamicTimeline", () => {
  it("compiles a valid GSAP timeline from animation data", () => {
    const mockData: DynamicAnimationData = {
      title: "Test Animation",
      description: "Test description",
      topic: "test",
      nodes: [
        { id: "node-1", type: "pc", label: "PC 1", x: 100, y: 100 },
        { id: "node-2", type: "switch", label: "Switch", x: 300, y: 100 },
      ],
      links: [
        { id: "link-1", source: "node-1", target: "node-2" },
      ],
      steps: [
        {
          id: "step-1",
          label: "Step 1",
          description: "First step",
          actions: [
            { id: "act-1", type: "highlight", targetId: "node-1", color: "active" },
            { id: "act-2", type: "pulse", targetId: "node-1" },
          ],
        },
        {
          id: "step-2",
          label: "Step 2",
          description: "Second step",
          actions: [
            {
              id: "act-3",
              type: "packet",
              fromId: "node-1",
              toId: "node-2",
              text: "PING",
              color: "warn",
            },
          ],
        },
      ],
    }

    // Create a mock SVG container in the happy-dom document
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
    svg.innerHTML = `
      <g id="node-node-1"><circle class="node-circle" /><circle class="ring" /></g>
      <g id="node-node-2"><circle class="node-circle" /><circle class="ring" /></g>
      <g id="pkt-act-3"></g>
    `
    document.body.appendChild(svg)

    const q = (selectorStr: string) => svg.querySelectorAll(selectorStr) as any

    const tl = compileDynamicTimeline(mockData, q, mockPalette)

    expect(tl).toBeDefined()
    expect(tl.labels).toHaveProperty("step-1")
    expect(tl.labels).toHaveProperty("step-2")

    // Cleanup
    document.body.removeChild(svg)
  })
})
