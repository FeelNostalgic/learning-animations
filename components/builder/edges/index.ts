import { CustomFlowEdge } from "./custom-flow-edge"

export const edgeTypes = {
  custom: CustomFlowEdge,
  bezier: CustomFlowEdge,
  straight: CustomFlowEdge,
  orthogonal: CustomFlowEdge,
  step: CustomFlowEdge,
  smoothstep: CustomFlowEdge,
}

export { CustomFlowEdge }
