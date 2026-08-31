import { z } from "zod"

// Helper: coerce null -> undefined before validation, so .optional() and .default() handle DB nulls
const nilToUndef = (v: unknown) => (v === null || v === undefined ? undefined : v)
const opt = <T extends z.ZodTypeAny>(schema: T) => z.preprocess(nilToUndef, schema.optional())
const optDefault = <T extends z.ZodTypeAny>(schema: T, def: unknown) =>
  z.preprocess(nilToUndef, (schema as any).default(def))

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
    unit: opt(z.string()),
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
    blocksNextStep: optDefault(z.boolean(), true),
  })
  .refine((d) => d.options.filter((o) => o.isCorrect).length >= 1, {
    message: "≥1 correct",
    path: ["options"],
  })

export const branchPropsSchema = z
  .object({
    targetStepId: opt(z.string().min(1)),
    choices: opt(
      z.array(
        z.object({
          id: z.string().min(1),
          label: z.string().min(1),
          targetStepId: z.string().min(1),
        })
      )
    ),
  })
  .refine(
    (d) => {
      if (d.targetStepId && d.targetStepId.trim() !== "") return true
      if (d.choices && d.choices.length > 0 && d.choices.some((c) => c.targetStepId && c.targetStepId.trim() !== "")) return true
      return false
    },
    { message: "branch must have targetStepId or at least 1 choice", path: ["targetStepId"] }
  )

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
  shapeType: opt(shapeKindEnum),
  radius: opt(z.number().positive()),
  width: opt(z.number().positive()),
  height: opt(z.number().positive()),
  rx: opt(z.number().nonnegative()),
  ry: opt(z.number().nonnegative()),
  sides: opt(z.number().int().min(3)),
  points: opt(z.string()),
})

export const universalNodeSchema = z
  .object({
    id: z.string().min(1),
    type: universalNodeTypeEnum,
    label: z.string().min(1),
    x: z.number(),
    y: z.number(),
    width: opt(z.number()),
    height: opt(z.number()),
    fill: opt(z.string()),
    stroke: opt(z.string()),
    strokeWidth: opt(z.number()),
    opacity: opt(z.number().min(0).max(1)),
    rotation: opt(z.number()),
    scale: opt(z.number()),
    zIndex: opt(z.number()),
    textColor: opt(z.string()),
    iconColor: opt(z.string()),
    imageUrl: opt(z.string()),
    imageFit: opt(z.enum(["contain", "cover", "fill"])),
    content: opt(z.string()),
    iconName: opt(z.string()),
    shapeDetails: opt(shapeDetailsSchema),
    props: opt(z.record(z.string(), z.any())),
    ariaLabel: opt(z.string()),
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
  type: optDefault(connectorTypeEnum, "straight"),
  directed: optDefault(connectorDirectedEnum, "none"),
  arrowStart: opt(arrowheadKindEnum),
  arrowEnd: opt(arrowheadKindEnum),
  dashed: optDefault(z.boolean(), false),
  color: opt(z.string()),
  strokeWidth: opt(z.number().nonnegative()),
  label: opt(z.string()),
  labelPosition: opt(z.number().min(0).max(1)),
  ariaLabel: opt(z.string()),
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
  targetId: opt(z.string()),
  fromId: opt(z.string()),
  toId: opt(z.string()),
  connectorId: opt(z.string()),
  transform: opt(
    z.object({
      x: opt(z.number()),
      y: opt(z.number()),
      scale: opt(z.number()),
      rotation: opt(z.number()),
    })
  ),
  style: opt(
    z.object({
      fill: opt(z.string()),
      stroke: opt(z.string()),
      strokeWidth: opt(z.number()),
      opacity: opt(z.number().min(0).max(1)),
    })
  ),
  color: opt(z.string()),
  text: opt(z.string()),
  subText: opt(z.string()),
  duration: optDefault(z.number().positive(), 0.8),
  delay: opt(z.number().nonnegative()),
  ease: opt(z.string()),
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
  variableName: opt(z.string()),
  min: opt(z.number()),
  max: opt(z.number()),
  step: opt(z.number().positive()),
  defaultValue: opt(z.number()),
  unit: opt(z.string()),
  question: opt(z.string()),
  options: opt(z.array(quizOptionSchema)),
  choices: opt(z.array(branchChoiceSchema)),
  dragTargetNodeId: opt(z.string()),
  dropZoneNodeId: opt(z.string()),
  onDropSuccessStepId: opt(z.string()),
  hotspotNodeId: opt(z.string()),
  hotspotContent: opt(z.string()),
})

export const universalStepSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  description: optDefault(z.string(), ""),
  duration: optDefault(z.number().positive(), 2.0),
  actions: optDefault(z.array(universalActionSchema), []),
  interaction: opt(universalInteractionSchema),
})

export const animationBackgroundSchema = z.object({
  type: optDefault(z.enum(["solid", "gradient", "image"]), "solid"),
  color: opt(z.string()),
  gradient: opt(
    z.object({
      from: z.string(),
      to: z.string(),
      direction: opt(z.string()),
    })
  ),
  imageUrl: opt(z.string()),
  pattern: opt(z.enum(["dots", "grid", "lines", "cross", "none"])),
  opacity: opt(z.number().min(0).max(1)),
})

export const universalAnimationSchema = z.object({
  id: opt(z.string().min(1)),
  title: z.string().min(1, "El título es obligatorio").max(120),
  description: optDefault(z.string(), ""),
  discipline: optDefault(disciplineEnum, "general"),
  topic: z.string().min(1, "El tema es obligatorio"),
  tags: optDefault(z.array(z.string()), []),
  difficulty: optDefault(difficultyEnum, "beginner"),
  is_public: optDefault(z.boolean(), false),
  background: opt(animationBackgroundSchema),
  nodes: z.array(universalNodeSchema).min(1, "Debe tener al menos un nodo"),
  connectors: optDefault(z.array(universalConnectorSchema), []),
  steps: z.array(universalStepSchema).min(1, "Debe tener al menos un paso"),
  user_id: opt(z.string().uuid()),
  views_count: optDefault(z.number().int().nonnegative(), 0),
  likes_count: optDefault(z.number().int().nonnegative(), 0),
  forked_from: z.string().uuid().nullable().optional().transform((v) => v ?? undefined),
  created_at: opt(z.string()),
  updated_at: opt(z.string()),
})

export type UniversalAnimationInput = z.infer<typeof universalAnimationSchema>
export type UniversalNodeInput = z.infer<typeof universalNodeSchema>
export type UniversalConnectorInput = z.infer<typeof universalConnectorSchema>
export type UniversalStepInput = z.infer<typeof universalStepSchema>
export type UniversalActionInput = z.infer<typeof universalActionSchema>
export type UniversalInteractionInput = z.infer<typeof universalInteractionSchema>
