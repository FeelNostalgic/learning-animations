import type { UniversalNode, UniversalConnector, ConnectorType } from "@/types/universal-animation"

export interface Point2D {
  x: number
  y: number
}

export interface ConnectorGeometryResult {
  pathData: string
  sourcePoint: Point2D
  targetPoint: Point2D
  midPoint: Point2D
  length: number
}

/**
 * Calculates node bounding box and its 4 anchor points (top, bottom, left, right).
 */
export function getNodeAnchorPoints(node: UniversalNode): {
  top: Point2D
  bottom: Point2D
  left: Point2D
  right: Point2D
  center: Point2D
  width: number
  height: number
} {
  const w = node.width || (node.type === "shape" && node.shapeDetails?.shapeType === "circle" ? 80 : 100)
  const h = node.height || (node.type === "shape" && node.shapeDetails?.shapeType === "circle" ? 80 : 60)
  const cx = node.x + w / 2
  const cy = node.y + h / 2

  return {
    top: { x: cx, y: node.y },
    bottom: { x: cx, y: node.y + h },
    left: { x: node.x, y: cy },
    right: { x: node.x + w, y: cy },
    center: { x: cx, y: cy },
    width: w,
    height: h,
  }
}

/**
 * Finds the optimal anchor pair between source and target nodes based on relative position.
 */
export function getOptimalAnchorPair(
  sourceNode: UniversalNode,
  targetNode: UniversalNode
): { sourcePoint: Point2D; targetPoint: Point2D } {
  const src = getNodeAnchorPoints(sourceNode)
  const tgt = getNodeAnchorPoints(targetNode)

  const dx = tgt.center.x - src.center.x
  const dy = tgt.center.y - src.center.y

  if (Math.abs(dx) >= Math.abs(dy)) {
    // Horizontal alignment
    if (dx >= 0) {
      return { sourcePoint: src.right, targetPoint: tgt.left }
    } else {
      return { sourcePoint: src.left, targetPoint: tgt.right }
    }
  } else {
    // Vertical alignment
    if (dy >= 0) {
      return { sourcePoint: src.bottom, targetPoint: tgt.top }
    } else {
      return { sourcePoint: src.top, targetPoint: tgt.bottom }
    }
  }
}

/**
 * Computes SVG Path data, mid-point, and points for any connector (bezier, straight, orthogonal).
 */
export function computeConnectorPathData(
  sourcePoint: Point2D,
  targetPoint: Point2D,
  type: ConnectorType = "bezier"
): ConnectorGeometryResult {
  const { x: sx, y: sy } = sourcePoint
  const { x: tx, y: ty } = targetPoint

  let pathData = ""
  let midPoint: Point2D = { x: (sx + tx) / 2, y: (sy + ty) / 2 }

  if (type === "straight") {
    pathData = `M ${sx} ${sy} L ${tx} ${ty}`
    midPoint = { x: (sx + tx) / 2, y: (sy + ty) / 2 }
  } else if (type === "orthogonal") {
    const midX = (sx + tx) / 2
    pathData = `M ${sx} ${sy} L ${midX} ${sy} L ${midX} ${ty} L ${tx} ${ty}`
    midPoint = { x: midX, y: (sy + ty) / 2 }
  } else {
    // Smooth Cubic Bezier
    const dx = tx - sx
    const dy = ty - sy
    const curvature = 0.4
    const cx1 = sx + Math.max(Math.abs(dx) * curvature, 40) * Math.sign(dx || 1)
    const cy1 = sy
    const cx2 = tx - Math.max(Math.abs(dx) * curvature, 40) * Math.sign(dx || 1)
    const cy2 = ty

    pathData = `M ${sx} ${sy} C ${cx1} ${cy1} ${cx2} ${cy2} ${tx} ${ty}`
    // Approximate midpoint on bezier curve at t = 0.5
    midPoint = {
      x: 0.125 * sx + 0.375 * cx1 + 0.375 * cx2 + 0.125 * tx,
      y: 0.125 * sy + 0.375 * cy1 + 0.375 * cy2 + 0.125 * ty,
    }
  }

  const dist = Math.hypot(tx - sx, ty - sy)

  return {
    pathData,
    sourcePoint,
    targetPoint,
    midPoint,
    length: dist,
  }
}
