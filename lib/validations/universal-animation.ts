import { z } from "zod"

export const disciplineEnum = z.enum([
  "math",
  "physics",
  "computer_science",
  "biology",
  "chemistry",
  "general",
])

export const difficultyEnum = z.enum(["beginner", "intermediate", "advanced"])

export const universalNodeTypeEnum = z.enum([
  "shape",
  "math",
  "text",
  "image",
  "code",
  "network",
  "icon",
  "container",
  "interactive_slider",
  "interactive_quiz",
  "interactive_branch",
])

export const sliderPropsSchema = z
  .object({
    variableName: z
      .string()
      .min(1)
      .regex(/^[a-zA-Z_][\w]*$/, "variableName must start with letter or underscore"),
    min: z.number(),
    max: z.number(),
    step: z.number().positive("step must be > 0"),
    defaultValue: z.number(),
    unit: z.string().optional(),
  })
  .refine((d) => d.min < d.max, { message: "min < max", path: ["max"] })
  .refine((d) => d.defaultValue >= d.min && d.defaultValue <= d.max, {
    message: "defaultValue must be within [min,max]",
    path: ["defaultValue"],
  })

export const quizOptionSchemaInteractive = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  isCorrect: z.boolean(),
  feedback: z.string().min(1),
})

export const quizPropsSchema = z
  .object({
    quizType: z.enum(["single", "multi"]),
    question: z.string().min(1),
    options: z.array(quizOptionSchemaInteractive).min(2, "quiz must have at least 2 options"),
    blocksNextStep: z.boolean().default(true),
  })
  .refine((d) => d.options.filter((o) => o.isCorrect).length >= 1, {
    message: "≥1 correct",
    path: ["options"],
  })

export const branchPropsSchema = z.object({
  choices: z
    .array(
      z.object({
        id: z.string().min(1),
        label: z.string().min(1),
        targetStepId: z.string().min(1),
      })
    )
    .min(1, "branch must have at least 1 choice"),
})

export const shapeKindEnum = z.enum([
  "circle",
  "rect",
  "rounded_rect",
  "triangle",
  "diamond",
  "star",
  "pill",
  "polygon",
])

export const shapeDetailsSchema = z.object({
  shapeType: shapeKindEnum.optional(),
  radius: z.number().positive().optional(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  rx: z.number().nonnegative().optional(),
  ry: z.number().nonnegative().optional(),
  sides: z.number().int().min(3).optional(),
  points: z.string().optional(),
})

export const universalNodeSchema = z
  .object({
    id: z.string().min(1),
    type: universalNodeTypeEnum,
    label: z.string().min(1),
    x: z.number(),
    y: z.number(),
    width: z.number().optional(),
    height: z.number().optional(),
    fill: z.string().optional(),
    stroke: z.string().optional(),
    strokeWidth: z.number().optional(),
    opacity: z.number().min(0).max(1).optional(),
    rotation: z.number().optional(),
    scale: z.number().optional(),
    zIndex: z.number().optional(),
    textColor: z.string().optional(),
    iconColor: z.string().optional(),
    imageUrl: z.string().optional(),
    imageFit: z.enum(["contain", "cover", "fill"]).optional(),
    content: z.string().optional(),
    iconName: z.string().optional(),
    shapeDetails: shapeDetailsSchema.optional(),
    props: z.record(z.string(), z.any()).optional(),
    ariaLabel: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.props) return
    let result
    if (data.type === "interactive_slider") {
      result = sliderPropsSchema.safeParse(data.props)
    } else if (data.type === "interactive_quiz") {
      result = quizPropsSchema.safeParse(data.props)
    } else if (data.type === "interactive_branch") {
      result = branchPropsSchema.safeParse(data.props)
    } else {
      return
    }
    if (!result.success) {
      for (const issue of result.error.issues) {
        ctx.addIssue({ ...issue, path: ["props", ...(issue.path as (string | number)[])], code: issue.code as any })
      }
    }
  })

export const connectorTypeEnum = z.enum(["straight", "bezier", "orthogonal", "arc"])
export const connectorDirectedEnum = z.enum(["none", "forward", "backward", "bidirectional"])
export const arrowheadKindEnum = z.enum(["none", "arrow", "circle", "diamond"])

export const universalConnectorSchema = z.object({
  id: z.string().min(1),
  sourceId: z.string().min(1),
  targetId: z.string().min(1),
  type: connectorTypeEnum.optional().default("straight"),
  directed: connectorDirectedEnum.optional().default("none"),
  arrowStart: arrowheadKindEnum.optional(),
  arrowEnd: arrowheadKindEnum.optional(),
  dashed: z.boolean().optional().default(false),
  color: z.string().optional(),
  strokeWidth: z.number().nonnegative().optional(),
  label: z.string().optional(),
  labelPosition: z.number().min(0).max(1).optional(),
  ariaLabel: z.string().optional(),
})

export const universalActionTypeEnum = z.enum([
  "transform",
  "style",
  "highlight",
  "pulse",
  "fade",
  "packet",
  "badge",
  "tooltip",
  "math_eval",
  "path_draw",
])

export const universalActionSchema = z.object({
  id: z.string().min(1),
  type: universalActionTypeEnum,
  targetId: z.string().optional(),
  fromId: z.string().optional(),
  toId: z.string().optional(),
  connectorId: z.string().optional(),
  transform: z
    .object({
      x: z.number().optional(),
      y: z.number().optional(),
      scale: z.number().optional(),
      rotation: z.number().optional(),
    })
    .optional(),
  style: z
    .object({
      fill: z.string().optional(),
      stroke: z.string().optional(),
      strokeWidth: z.number().optional(),
      opacity: z.number().min(0).max(1).optional(),
    })
    .optional(),
  color: z.string().optional(),
  text: z.string().optional(),
  subText: z.string().optional(),
  duration: z.number().positive().optional().default(0.8),
  delay: z.number().nonnegative().optional(),
  ease: z.string().optional(),
})

export const quizOptionSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  isCorrect: z.boolean(),
  feedback: z.string(),
})

export const branchChoiceSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  targetStepId: z.string().min(1),
})

export const universalInteractionSchema = z.object({
  type: z.enum([
    "variable_slider",
    "branch_choice",
    "quiz",
    "drag_drop",
    "clickable_hotspot",
  ]),
  variableName: z.string().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().positive().optional(),
  defaultValue: z.number().optional(),
  unit: z.string().optional(),
  question: z.string().optional(),
  options: z.array(quizOptionSchema).optional(),
  choices: z.array(branchChoiceSchema).optional(),
  dragTargetNodeId: z.string().optional(),
  dropZoneNodeId: z.string().optional(),
  onDropSuccessStepId: z.string().optional(),
  hotspotNodeId: z.string().optional(),
  hotspotContent: z.string().optional(),
})

export const universalStepSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  description: z.string().default(""),
  duration: z.number().positive().optional().default(2.0),
  actions: z.array(universalActionSchema).default([]),
  interaction: universalInteractionSchema.optional(),
})

export const animationBackgroundSchema = z.object({
  type: z.enum(["solid", "gradient", "image"]).default("solid"),
  color: z.string().optional(),
  gradient: z
    .object({
      from: z.string(),
      to: z.string(),
      direction: z.string().optional(),
    })
    .optional(),
  imageUrl: z.string().optional(),
  pattern: z.enum(["dots", "grid", "lines", "cross", "none"]).optional(),
  opacity: z.number().min(0).max(1).optional(),
})

export const universalAnimationSchema = z.object({
  id: z.string().min(1).optional(),
  title: z.string().min(1, "El título es obligatorio").max(120),
  description: z.string().default(""),
  discipline: disciplineEnum.default("general"),
  topic: z.string().min(1, "El tema es obligatorio"),
  tags: z.array(z.string()).default([]),
  difficulty: difficultyEnum.default("beginner"),
  is_public: z.boolean().default(false),
  background: animationBackgroundSchema.optional(),
  nodes: z.array(universalNodeSchema).min(1, "Debe tener al menos un nodo"),
  connectors: z.array(universalConnectorSchema).default([]),
  steps: z.array(universalStepSchema).min(1, "Debe tener al menos un paso"),
  user_id: z.string().uuid().optional(),
  views_count: z.number().int().nonnegative().optional().default(0),
  likes_count: z.number().int().nonnegative().optional().default(0),
  forked_from: z.string().uuid().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})

export type UniversalAnimationInput = z.infer<typeof universalAnimationSchema>
export type UniversalNodeInput = z.infer<typeof universalNodeSchema>
export type UniversalConnectorInput = z.infer<typeof universalConnectorSchema>
export type UniversalStepInput = z.infer<typeof universalStepSchema>
export type UniversalActionInput = z.infer<typeof universalActionSchema>
export type UniversalInteractionInput = z.infer<typeof universalInteractionSchema>
