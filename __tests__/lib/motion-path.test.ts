import { describe, it, expect } from "vitest"
import {
  sampleConnectorPoints,
  calculateConnectorPath,
} from "@/lib/animations/universal-compiler"
import type { UniversalConnector } from "@/types/universal-animation"

describe("Motion Path & Geometric Curve Interpolation (TDD)", () => {
  const source = { x: 100, y: 100 }
  const target = { x: 500, y: 300 }

  it("generates smooth parametric sampling points along a cubic Bézier curve", () => {
    const bezierPoints = sampleConnectorPoints(source, target, "bezier", 5)

    expect(bezierPoints).toHaveLength(5)
    // First point should match source
    expect(bezierPoints[0].x).toBeCloseTo(100, 1)
    expect(bezierPoints[0].y).toBeCloseTo(100, 1)

    // Mid point should follow smooth curve (not a simple straight diagonal average)
    const midPoint = bezierPoints[2]
    expect(midPoint.x).toBeGreaterThan(100)
    expect(midPoint.x).toBeLessThan(500)

    // Last point should match target
    expect(bezierPoints[4].x).toBeCloseTo(500, 1)
    expect(bezierPoints[4].y).toBeCloseTo(300, 1)
  })

  it("generates precise orthogonal waypoints along a stepped connector", () => {
    const orthogonalPoints = sampleConnectorPoints(source, target, "orthogonal", 5)

    expect(orthogonalPoints).toHaveLength(5)
    expect(orthogonalPoints[0]).toEqual({ x: 100, y: 100 })
    expect(orthogonalPoints[orthogonalPoints.length - 1]).toEqual({ x: 500, y: 300 })
  })

  it("generates straight linear points for straight connectors", () => {
    const straightPoints = sampleConnectorPoints(source, target, "straight", 3)

    expect(straightPoints).toHaveLength(3)
    expect(straightPoints[0]).toEqual({ x: 100, y: 100 })
    expect(straightPoints[1]).toEqual({ x: 300, y: 200 })
    expect(straightPoints[2]).toEqual({ x: 500, y: 300 })
  })
})
