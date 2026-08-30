import type { DisciplineType, DifficultyLevel } from "./universal-animation"

export interface AnimationStep {
  id: string
  label: string
  description: string
}

export interface AnimationMeta {
  slug: string
  title: string
  description: string
  topic: string
  discipline?: DisciplineType
  difficulty?: DifficultyLevel
  tags?: string[]
  steps: AnimationStep[]
}
