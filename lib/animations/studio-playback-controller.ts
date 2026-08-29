import type { UniversalAnimationData, UniversalStep } from "@/types/universal-animation"

export type PlaybackMode = "idle" | "playing_step" | "playing_all" | "paused"

export interface StudioPlaybackCallbacks {
  onModeChange: (mode: PlaybackMode) => void
  onStepChange: (stepIndex: number) => void
  onProgress: (progress: number) => void // 0 to 1
}

export class StudioPlaybackController {
  private mode: PlaybackMode = "idle"
  private currentStepIndex = 0
  private speed = 1.0
  private timer: any = null
  private progressTimer: any = null
  private startTime = 0
  private stepDuration = 2000
  private callbacks: StudioPlaybackCallbacks

  constructor(callbacks: StudioPlaybackCallbacks) {
    this.callbacks = callbacks
  }

  public getMode(): PlaybackMode {
    return this.mode
  }

  public getSpeed(): number {
    return this.speed
  }

  public setSpeed(speed: number) {
    this.speed = Math.max(0.25, Math.min(4.0, speed))
  }

  public playCurrentStep(stepIndex: number, steps: UniversalStep[]) {
    this.stop()
    this.currentStepIndex = stepIndex
    this.mode = "playing_step"
    this.callbacks.onModeChange(this.mode)
    this.callbacks.onStepChange(stepIndex)

    const step = steps[stepIndex] || steps[0]
    this.stepDuration = ((step?.duration || 2.0) * 1000) / this.speed
    this.startTime = Date.now()

    this.startProgressTracking()

    this.timer = setTimeout(() => {
      this.stop()
    }, this.stepDuration)
  }

  public playFullSequence(startIndex: number, steps: UniversalStep[]) {
    this.stop()
    this.currentStepIndex = startIndex
    this.mode = "playing_all"
    this.callbacks.onModeChange(this.mode)
    this.executeSequenceStep(startIndex, steps)
  }

  private executeSequenceStep(index: number, steps: UniversalStep[]) {
    if (index >= steps.length) {
      this.stop()
      return
    }

    this.currentStepIndex = index
    this.callbacks.onStepChange(index)

    const step = steps[index]
    this.stepDuration = ((step?.duration || 2.0) * 1000) / this.speed
    this.startTime = Date.now()

    this.startProgressTracking()

    this.timer = setTimeout(() => {
      if (this.mode === "playing_all") {
        this.executeSequenceStep(index + 1, steps)
      }
    }, this.stepDuration)
  }

  private startProgressTracking() {
    this.stopProgressTracking()
    const intervalMs = 50

    this.progressTimer = setInterval(() => {
      if (this.mode === "idle" || this.mode === "paused") return
      const elapsed = Date.now() - this.startTime
      const progress = Math.min(1.0, elapsed / this.stepDuration)
      this.callbacks.onProgress(progress)
    }, intervalMs)
  }

  private stopProgressTracking() {
    if (this.progressTimer) {
      clearInterval(this.progressTimer)
      this.progressTimer = null
    }
  }

  public pause() {
    if (this.mode === "playing_step" || this.mode === "playing_all") {
      this.mode = "paused"
      if (this.timer) clearTimeout(this.timer)
      this.stopProgressTracking()
      this.callbacks.onModeChange(this.mode)
    }
  }

  public resume(steps: UniversalStep[]) {
    if (this.mode === "paused") {
      this.mode = "playing_all"
      this.callbacks.onModeChange(this.mode)
      this.executeSequenceStep(this.currentStepIndex, steps)
    }
  }

  public stop() {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
    this.stopProgressTracking()
    this.mode = "idle"
    this.callbacks.onProgress(0)
    this.callbacks.onModeChange(this.mode)
  }
}
