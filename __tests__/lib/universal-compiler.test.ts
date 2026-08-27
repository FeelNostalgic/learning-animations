import { describe, it, expect } from "vitest"
import gsap from "gsap"
import {
  compileUniversalTimeline,
  calculateConnectorPath,
  type UniversalPaletteColors,
} from "@/lib/animations/universal-compiler"
import type { UniversalAnimationData } from "@/types/universal-animation"

const DEFAULT_PALETTE: UniversalPaletteColors = {
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

describe("Universal GSAP Animation Compiler (TDD)", () => {
  it("compiles a multi-step timeline with exact accumulated step durations and labels", () => {
    const animation: UniversalAnimationData = {
      title: "Parábola y Vector Velocidad",
      description: "Animación de cinemática en física.",
      discipline: "physics",
      topic: "Cinemática",
      tags: ["física", "tiro parabólico"],
      difficulty: "intermediate",
      is_public: true,
      nodes: [
        { id: "node-projectile", type: "shape", label: "Proyectil", x: 100, y: 500 },
        { id: "node-apex", type: "shape", label: "Vértice", x: 400, y: 200 },
        { id: "node-target", type: "shape", label: "Diana", x: 700, y: 500 },
      ],
      connectors: [
        { id: "conn-traj-1", sourceId: "node-projectile", targetId: "node-apex", type: "bezier" },
        { id: "conn-traj-2", sourceId: "node-apex", targetId: "node-target", type: "bezier" },
      ],
      steps: [
        {
          id: "step-launch",
          label: "1. Lanzamiento inicial",
          description: "El proyectil sale con ángulo $\\theta = 45^\\circ$.",
          duration: 2.0,
          actions: [
            { id: "act-launch", type: "highlight", targetId: "node-projectile", color: "active" },
            { id: "act-pulse", type: "pulse", targetId: "node-projectile" },
          ],
        },
        {
          id: "step-apex",
          label: "2. Alcance del vértice",
          description: "La velocidad vertical $v_y = 0$ en el punto más alto.",
          duration: 3.0,
          actions: [
            {
              id: "act-move-apex",
              type: "transform",
              targetId: "node-projectile",
              transform: { x: 400, y: 200 },
              duration: 2.5,
            },
            {
              id: "act-badge",
              type: "badge",
              targetId: "node-projectile",
              text: "v_y = 0",
            },
          ],
        },
        {
          id: "step-impact",
          label: "3. Impacto en la diana",
          description: "El proyectil llega a la diana en $x = 700$.",
          duration: 2.5,
          actions: [
            {
              id: "act-move-target",
              type: "transform",
              targetId: "node-projectile",
              transform: { x: 700, y: 500 },
              duration: 2.0,
            },
            { id: "act-impact-success", type: "highlight", targetId: "node-target", color: "success" },
          ],
        },
      ],
    }

    const mockSelector: any = (sel: string) => {
      // Return a dummy object for GSAP targeting in headless environment
      return { className: sel, style: {} }
    }

    const tl = compileUniversalTimeline(animation, mockSelector, DEFAULT_PALETTE)

    expect(tl).toBeDefined()
    expect(tl.paused()).toBe(true)

    // Total duration should equal sum of steps: 2.0 + 3.0 + 2.5 = 7.5s
    expect(tl.totalDuration()).toBeCloseTo(7.5, 1)

    // Labels should be placed at exact timestamps
    const labels = tl.labels
    expect(labels["step-launch"]).toBe(0)
    expect(labels["step-apex"]).toBe(2.0)
    expect(labels["step-impact"]).toBe(5.0)
  })

  it("calculates bezier curves with smooth control points for connectors", () => {
    const source = { x: 100, y: 100 }
    const target = { x: 500, y: 300 }

    const straightPath = calculateConnectorPath(source, target, "straight")
    expect(straightPath).toBe("M 100 100 L 500 300")

    const bezierPath = calculateConnectorPath(source, target, "bezier")
    expect(bezierPath).toContain("M 100 100 C")
    expect(bezierPath).toContain("500 300")

    const orthogonalPath = calculateConnectorPath(source, target, "orthogonal")
    expect(orthogonalPath).toContain("M 100 100 L")
    expect(orthogonalPath).toContain("500 300")
  })

  it("handles backwards-compatible network animations seamlessly", () => {
    const legacyAnimation: UniversalAnimationData = {
      title: "ARP Request & Reply",
      description: "Protocolo de resolución de direcciones de capa 2/3.",
      discipline: "computer_science",
      topic: "Acceso a la Red",
      tags: ["arp", "redes"],
      difficulty: "beginner",
      is_public: true,
      nodes: [
        { id: "pc-a", type: "network", label: "PC A", x: 200, y: 400, props: { ip: "192.168.1.10" } },
        { id: "pc-b", type: "network", label: "PC B", x: 800, y: 400, props: { ip: "192.168.1.20" } },
      ],
      connectors: [
        { id: "conn-1", sourceId: "pc-a", targetId: "pc-b", dashed: true },
      ],
      steps: [
        {
          id: "step-1",
          label: "1. Enviar paquete",
          description: "PC A transmite la trama ARP.",
          duration: 2.0,
          actions: [
            {
              id: "pkt-1",
              type: "packet",
              fromId: "pc-a",
              toId: "pc-b",
              text: "ARP Broadcast",
              color: "warn",
            },
          ],
        },
      ],
    }

    const mockSelector: any = (sel: string) => ({ sel, style: {} })
    const tl = compileUniversalTimeline(legacyAnimation, mockSelector, DEFAULT_PALETTE)

    expect(tl.totalDuration()).toBeCloseTo(2.0, 1)
    expect(tl.labels["step-1"]).toBe(0)
  })
})
