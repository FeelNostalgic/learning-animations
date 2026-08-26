import type { AnimationStep } from "./animations"

export type NodeType = "pc" | "switch" | "router" | "server" | "cloud"

export interface DynamicNode {
  id: string
  type: NodeType
  label: string
  x: number
  y: number
  ip?: string
  mask?: string
  mac?: string
  gateway?: string
}

export interface DynamicLink {
  id: string
  source: string // node ID
  target: string // node ID
  dashed?: boolean
}

export type ActionType = "highlight" | "pulse" | "packet" | "tooltip" | "fade" | "badge"

export interface DynamicAction {
  id: string
  type: ActionType
  targetId?: string // Target node ID (for highlight, pulse, tooltip, fade, badge)
  fromId?: string // Source node ID (for packet)
  toId?: string // Destination node ID (for packet)
  color?: "idle" | "active" | "success" | "warn" | "muted"
  text?: string // Message for packet, badge or tooltip
  subText?: string // Secondary text
  duration?: number // Duration in seconds (default ~0.5s)
}

export interface DynamicStep extends AnimationStep {
  actions: DynamicAction[]
}

export interface DynamicAnimationData {
  id?: string
  title: string
  description: string
  topic: string
  nodes: DynamicNode[]
  links: DynamicLink[]
  steps: DynamicStep[]
  user_id?: string
  created_at?: string
  updated_at?: string
}
