export type DisciplineType =
  | "math"
  | "physics"
  | "computer_science"
  | "biology"
  | "chemistry"
  | "general"

export type DifficultyLevel = "beginner" | "intermediate" | "advanced"

export type UniversalNodeType =
  | "shape" // Geometric shapes: circle, rect, triangle, diamond, polygon, star
  | "math" // LaTeX formula node: e.g. f(x) = \int ...
  | "text" // Markdown rich text card or label
  | "image" // Image upload (Cloudflare R2, URL or data-URI)
  | "code" // Code snippet card
  | "network" // Backwards compatible network device (pc, switch, router, etc.)
  | "icon" // Lucide / visual symbol icon
  | "container" // Boundary / subsystem container box
  | "interactive_slider"
  | "interactive_quiz"
  | "interactive_branch"

export interface SliderProps {
  variableName: string
  min: number
  max: number
  step: number
  defaultValue: number
  unit?: string
}

export interface QuizProps {
  quizType: "single" | "multi"
  question: string
  options: QuizOption[]
  blocksNextStep: boolean
}

export interface BranchProps {
  choices: BranchChoice[]
}

export type InteractiveProps = SliderProps | QuizProps | BranchProps

export type ShapeKind =
  | "circle"
  | "rect"
  | "rounded_rect"
  | "triangle"
  | "diamond"
  | "star"
  | "pill"
  | "polygon"

export interface ShapeDetails {
  shapeType?: ShapeKind
  radius?: number
  width?: number
  height?: number
  rx?: number
  ry?: number
  sides?: number
  points?: string
}

export interface UniversalNode {
  id: string
  type: UniversalNodeType
  label: string
  x: number
  y: number
  width?: number
  height?: number
  fill?: string
  stroke?: string
  strokeWidth?: number
  opacity?: number
  rotation?: number
  scale?: number
  zIndex?: number // Layer depth
  textColor?: string
  iconColor?: string
  imageUrl?: string // Cloudflare R2 or web image URL / Data-URI
  imageFit?: "contain" | "cover" | "fill"
  content?: string // Markdown text, LaTeX formula, or code snippet
  iconName?: string // Lucide icon name
  shapeDetails?: ShapeDetails
  props?: Record<string, any> // IP, MAC, physics variables, etc.
  ariaLabel?: string
}

export type ConnectorType = "straight" | "bezier" | "orthogonal" | "arc"
export type ConnectorDirected = "none" | "forward" | "backward" | "bidirectional"
export type ArrowheadKind = "none" | "arrow" | "circle" | "diamond"

export interface UniversalConnector {
  id: string
  sourceId: string
  targetId: string
  type?: ConnectorType
  directed?: ConnectorDirected
  arrowStart?: ArrowheadKind
  arrowEnd?: ArrowheadKind
  dashed?: boolean
  color?: string
  strokeWidth?: number
  label?: string
  labelPosition?: number
  ariaLabel?: string
}

export type UniversalActionType =
  | "transform" // Move, rotate, scale
  | "style" // Change fill, stroke, opacity
  | "highlight" // Highlight node / connector
  | "pulse" // Pulse glow effect
  | "fade" // Fade in / fade out
  | "packet" // Particle or message along a connector
  | "badge" // Badge notification over node
  | "tooltip" // Tooltip info overlay
  | "math_eval" // Step-by-step formula evaluation
  | "path_draw" // SVG path draw animation

export interface UniversalAction {
  id: string
  type: UniversalActionType
  targetId?: string // Target node or connector ID
  fromId?: string // For packet/particle source
  toId?: string // For packet/particle destination
  connectorId?: string
  transform?: {
    x?: number
    y?: number
    scale?: number
    rotation?: number
  }
  style?: {
    fill?: string
    stroke?: string
    strokeWidth?: number
    opacity?: number
  }
  color?: "idle" | "active" | "success" | "warn" | "destructive" | "primary" | "muted" | string
  text?: string
  subText?: string
  duration?: number // Duration in seconds
  delay?: number
  ease?: string
}

export type InteractionType =
  | "variable_slider"
  | "branch_choice"
  | "quiz"
  | "drag_drop"
  | "clickable_hotspot"

export interface QuizOption {
  id: string
  text: string
  isCorrect: boolean
  feedback: string
}

export interface BranchChoice {
  id: string
  label: string
  targetStepId: string
}

export interface UniversalInteraction {
  type: InteractionType
  // For variable_slider
  variableName?: string
  min?: number
  max?: number
  step?: number
  defaultValue?: number
  unit?: string
  // For quiz
  question?: string
  options?: QuizOption[]
  // For branch_choice
  choices?: BranchChoice[]
  // For drag_drop
  dragTargetNodeId?: string
  dropZoneNodeId?: string
  onDropSuccessStepId?: string
  // For clickable_hotspot
  hotspotNodeId?: string
  hotspotContent?: string
}

export interface UniversalStep {
  id: string
  label: string
  description: string // Rich Markdown with KaTeX support
  duration?: number // In seconds
  actions: UniversalAction[]
  interaction?: UniversalInteraction
}

export interface AnimationBackground {
  type: "solid" | "gradient" | "image"
  color?: string // Hex, rgba, or CSS color value
  gradient?: {
    from: string
    to: string
    direction?: "to-r" | "to-b" | "to-br" | "radial"
  }
  imageUrl?: string // Cloudflare R2 or web image URL / Data-URI
  imageFit?: "cover" | "contain" | "repeat" | "center"
  opacity?: number // 0 to 1 for overlay blending
  pattern?: "none" | "grid" | "dots" | "cross" // Subtle decorative background pattern
}

export interface UniversalAnimationData {
  id?: string
  title: string
  description: string
  discipline: DisciplineType
  topic: string
  tags: string[]
  difficulty: DifficultyLevel
  is_public: boolean
  background?: AnimationBackground
  nodes: UniversalNode[]
  connectors: UniversalConnector[]
  steps: UniversalStep[]
  user_id?: string
  views_count?: number
  likes_count?: number
  forked_from?: string | null
  created_at?: string
  updated_at?: string
}
