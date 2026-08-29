import { describe, it, expect } from "vitest"
import {
  getNodeAnchorPoints,
  getOptimalAnchorPair,
  computeConnectorPathData,
} from "@/lib/animations/connector-geometry"
import type { UniversalNode } from "@/types/universal-animation"

describe("Connector Geometry Engine", () => {
  const nodeA: UniversalNode = {
    id: "a",
    type: "shape",
    label: "Node A",
    x: 100,
    y: 100,
    width: 100,
    height: 60,
  }

  const nodeB: UniversalNode = {
    id: "b",
    type: "shape",
    label: "Node B",
    x: 400,
    y: 100,
    width: 100,
    height: 60,
  }

  it("calculates accurate bounding box anchor points", () => {
    const anchors = getNodeAnchorPoints(nodeA)
    expect(anchors.width).toBe(100)
    expect(anchors.height).toBe(60)
    expect(anchors.center).toEqual({ x: 150, y: 130 })
    expect(anchors.top).toEqual({ x: 150, y: 100 })
    expect(anchors.bottom).toEqual({ x: 150, y: 160 })
    expect(anchors.left).toEqual({ x: 100, y: 130 })
    expect(anchors.right).toEqual({ x: 200, y: 130 })
  })

  it("finds optimal horizontal anchor pair between horizontally separated nodes", () => {
    const pair = getOptimalAnchorPair(nodeA, nodeB)
    expect(pair.sourcePoint).toEqual({ x: 200, y: 130 }) // right anchor of A
    expect(pair.targetPoint).toEqual({ x: 400, y: 130 }) // left anchor of B
  })

  it("computes cubic bezier path data and midpoint", () => {
    const geom = computeConnectorPathData({ x: 200, y: 130 }, { x: 400, y: 130 }, "bezier")
    expect(geom.pathData).toContain("M 200 130 C")
    expect(geom.midPoint.x).toBeGreaterThan(250)
    expect(geom.midPoint.x).toBeLessThan(350)
    expect(geom.length).toBe(200)
  })

  it("computes straight line path data", () => {
    const geom = computeConnectorPathData({ x: 200, y: 130 }, { x: 400, y: 130 }, "straight")
    expect(geom.pathData).toBe("M 200 130 L 400 130")
    expect(geom.midPoint).toEqual({ x: 300, y: 130 })
  })
})
