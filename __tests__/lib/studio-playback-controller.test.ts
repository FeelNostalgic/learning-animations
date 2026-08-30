import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { StudioPlaybackController } from "@/lib/animations/studio-playback-controller"
import type { UniversalStep } from "@/types/universal-animation"

describe("StudioPlaybackController", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const mockSteps: UniversalStep[] = [
    {
      id: "step-1",
      label: "Paso 1",
      description: "Descripción del paso 1",
      duration: 1.0,
      actions: [],
    },
    {
      id: "step-2",
      label: "Paso 2",
      description: "Descripción del paso 2",
      duration: 1.0,
      actions: [],
    },
  ]

  it("plays current step and stops upon completion", () => {
    const onModeChange = vi.fn()
    const onStepChange = vi.fn()
    const onProgress = vi.fn()

    const controller = new StudioPlaybackController({
      onModeChange,
      onStepChange,
      onProgress,
    })

    controller.playCurrentStep(0, mockSteps)

    expect(controller.getMode()).toBe("playing_step")
    expect(onModeChange).toHaveBeenCalledWith("playing_step")
    expect(onStepChange).toHaveBeenCalledWith(0)

    // Fast-forward step duration (1000ms)
    vi.advanceTimersByTime(1050)

    expect(controller.getMode()).toBe("idle")
  })

  it("plays full sequence advancing across multiple steps", () => {
    const onModeChange = vi.fn()
    const onStepChange = vi.fn()
    const onProgress = vi.fn()

    const controller = new StudioPlaybackController({
      onModeChange,
      onStepChange,
      onProgress,
    })

    controller.playFullSequence(0, mockSteps)

    expect(controller.getMode()).toBe("playing_all")
    expect(onStepChange).toHaveBeenCalledWith(0)

    // Advance 1st step duration (1000ms)
    vi.advanceTimersByTime(1050)
    expect(onStepChange).toHaveBeenCalledWith(1)

    // Advance 2nd step duration (1000ms)
    vi.advanceTimersByTime(1050)
    expect(controller.getMode()).toBe("idle")
  })

  it("pauses and stops playback cleanly", () => {
    const onModeChange = vi.fn()
    const onStepChange = vi.fn()
    const onProgress = vi.fn()

    const controller = new StudioPlaybackController({
      onModeChange,
      onStepChange,
      onProgress,
    })

    controller.playFullSequence(0, mockSteps)
    controller.pause()
    expect(controller.getMode()).toBe("paused")

    controller.stop()
    expect(controller.getMode()).toBe("idle")
  })
})
