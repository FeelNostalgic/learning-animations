import { ShapeNode } from "./ShapeNode"
import { MathNode } from "./MathNode"
import { TextNode } from "./TextNode"
import { ImageNode } from "./ImageNode"
import { NetworkNode } from "./NetworkNode"
import { ContainerNode } from "./ContainerNode"
import type { NodeTypes } from "@xyflow/react"

export const nodeTypes: NodeTypes = {
  shape: ShapeNode,
  math: MathNode,
  text: TextNode,
  image: ImageNode,
  code: TextNode,
  network: NetworkNode,
  container: ContainerNode,
  icon: ShapeNode,
}

export { ShapeNode, MathNode, TextNode, ImageNode, NetworkNode, ContainerNode }
