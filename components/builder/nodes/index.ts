import { ShapeNode } from "./ShapeNode"
import { MathNode } from "./MathNode"
import { TextNode } from "./TextNode"
import { NetworkNode } from "./NetworkNode"
import { ContainerNode } from "./ContainerNode"
import type { NodeTypes } from "@xyflow/react"

export const nodeTypes: NodeTypes = {
  shape: ShapeNode,
  math: MathNode,
  text: TextNode,
  code: TextNode,
  network: NetworkNode,
  container: ContainerNode,
  icon: ShapeNode,
}

export { ShapeNode, MathNode, TextNode, NetworkNode, ContainerNode }
