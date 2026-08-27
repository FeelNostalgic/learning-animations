import type {
  UniversalInteraction,
  QuizOption,
  BranchChoice,
} from "@/types/universal-animation"

export interface VariableConstraint {
  min?: number
  max?: number
  step?: number
  unit?: string
  defaultValue?: number
}

export interface QuizSubmissionResult {
  success: boolean
  isCorrect: boolean
  feedback: string
  selectedOption?: QuizOption
}

export interface DropValidationResult {
  isMatch: boolean
  targetStepId?: string
}

type VariableListener = (value: number | string | boolean) => void

/**
 * Runtime state and evaluation engine for interactive educational animations.
 * Manages live variables, user quiz submissions, decision branching, and drag-and-drop triggers.
 */
export class InteractionRuntime {
  private variables: Map<string, number | string | boolean> = new Map()
  private constraints: Map<string, VariableConstraint> = new Map()
  private listeners: Map<string, Set<VariableListener>> = new Map()
  private interactions: Map<string, UniversalInteraction> = new Map()
  private unlockedSteps: Map<string, boolean> = new Map()

  /**
   * Registers an interaction definition associated with a step.
   */
  public registerInteraction(stepId: string, interaction: UniversalInteraction): void {
    this.interactions.set(stepId, interaction)

    if (interaction.type === "variable_slider" && interaction.variableName) {
      const varName = interaction.variableName
      this.constraints.set(varName, {
        min: interaction.min,
        max: interaction.max,
        step: interaction.step,
        unit: interaction.unit,
        defaultValue: interaction.defaultValue,
      })

      const initialValue = interaction.defaultValue ?? interaction.min ?? 0
      this.variables.set(varName, initialValue)
      this.unlockedSteps.set(stepId, true)
    } else if (interaction.type === "quiz" || interaction.type === "drag_drop") {
      // Quizzes and drag-drop are locked until solved
      this.unlockedSteps.set(stepId, false)
    } else {
      this.unlockedSteps.set(stepId, true)
    }
  }

  /**
   * Retrieves the current value of a reactive variable.
   */
  public getVariable(name: string): number | string | boolean | undefined {
    return this.variables.get(name)
  }

  /**
   * Updates a reactive variable with constraint clamping and listener dispatch.
   */
  public setVariable(name: string, value: number | string | boolean): void {
    let finalValue = value

    if (typeof value === "number") {
      const constraint = this.constraints.get(name)
      if (constraint) {
        if (constraint.min !== undefined && finalValue < constraint.min) {
          finalValue = constraint.min
        }
        if (constraint.max !== undefined && finalValue > constraint.max) {
          finalValue = constraint.max
        }
      }
    }

    this.variables.set(name, finalValue)

    // Dispatch to subscribers
    const subs = this.listeners.get(name)
    if (subs) {
      subs.forEach((cb) => {
        try {
          cb(finalValue)
        } catch (err) {
          console.error(`Error in variable listener for ${name}:`, err)
        }
      })
    }
  }

  /**
   * Subscribes to changes on a specific variable. Returns an unsubscribe function.
   */
  public onVariableChange(name: string, callback: VariableListener): () => void {
    if (!this.listeners.has(name)) {
      this.listeners.set(name, new Set())
    }
    const set = this.listeners.get(name)!
    set.add(callback)

    return () => {
      set.delete(callback)
    }
  }

  /**
   * Checks if a step's interactive requirement has been satisfied to allow advancing.
   */
  public isStepUnlocked(stepId: string): boolean {
    return this.unlockedSteps.get(stepId) ?? true
  }

  /**
   * Evaluates a user answer to a quiz interaction.
   */
  public submitQuizAnswer(stepId: string, optionId: string): QuizSubmissionResult {
    const interaction = this.interactions.get(stepId)
    if (!interaction || interaction.type !== "quiz" || !interaction.options) {
      return {
        success: false,
        isCorrect: false,
        feedback: "No hay cuestionario activo en este paso.",
      }
    }

    const selectedOption = interaction.options.find((opt) => opt.id === optionId)
    if (!selectedOption) {
      return {
        success: false,
        isCorrect: false,
        feedback: "Opción de respuesta no válida.",
      }
    }

    if (selectedOption.isCorrect) {
      this.unlockedSteps.set(stepId, true)
    }

    return {
      success: true,
      isCorrect: selectedOption.isCorrect,
      feedback: selectedOption.feedback,
      selectedOption,
    }
  }

  /**
   * Selects a branch choice and returns the target step ID.
   */
  public selectBranchChoice(stepId: string, choiceId: string): string | null {
    const interaction = this.interactions.get(stepId)
    if (!interaction || interaction.type !== "branch_choice" || !interaction.choices) {
      return null
    }

    const choice = interaction.choices.find((c) => c.id === choiceId)
    if (!choice) return null

    this.unlockedSteps.set(stepId, true)
    return choice.targetStepId
  }

  /**
   * Validates if a dragged node was dropped onto the expected target zone.
   */
  public validateDrop(
    stepId: string,
    draggedNodeId: string,
    targetZoneId: string
  ): DropValidationResult {
    const interaction = this.interactions.get(stepId)
    if (!interaction || interaction.type !== "drag_drop") {
      return { isMatch: false }
    }

    const isMatch =
      interaction.dragTargetNodeId === draggedNodeId &&
      interaction.dropZoneNodeId === targetZoneId

    if (isMatch) {
      this.unlockedSteps.set(stepId, true)
      return {
        isMatch: true,
        targetStepId: interaction.onDropSuccessStepId,
      }
    }

    return { isMatch: false }
  }

  /**
   * Resets all runtime state to initial values.
   */
  public reset(): void {
    this.variables.clear()
    this.constraints.clear()
    this.listeners.clear()
    this.interactions.clear()
    this.unlockedSteps.clear()
  }
}
