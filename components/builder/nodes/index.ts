import { ShapeNode } from "./ShapeNode"
import { MathNode } from "./MathNode"
import { TextNode } from "./TextNode"
import { ImageNode } from "./ImageNode"
import { NetworkNode } from "./NetworkNode"
import { ContainerNode } from "./ContainerNode"
import { InteractiveSliderNode } from "./InteractiveSliderNode"
import { QuizNode } from "./QuizNode"
import { BranchNode } from "./BranchNode"
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
  interactive_slider: InteractiveSliderNode,
  interactive_quiz: QuizNode,
  interactive_branch: BranchNode,
}

export { ShapeNode, MathNode, TextNode, ImageNode, NetworkNode, ContainerNode, InteractiveSliderNode, QuizNode, BranchNode }
