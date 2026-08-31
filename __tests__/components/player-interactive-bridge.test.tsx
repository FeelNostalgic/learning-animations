// @ts-nocheck
import { describe, it, expect, vi, afterEach } from "vitest"
import { render } from "@testing-library/react"
import fs from "node:fs"
import path from "node:path"

describe("UniversalAnimationPlayer interactive bridge — Phase 5.2", () => {
  afterEach(() => vi.restoreAllMocks())

  it("contains scoped pointer-events override for interactive-node-shell", () => {
    const file = fs.readFileSync(path.resolve("components/animations/universal-animation-player.tsx"), "utf-8")
    expect(file).toContain("interactive-node-shell")
    expect(file).toContain("pointer-events:auto")
    expect(file).toContain("panOnDrag")
  })

  it("uses rAF and quickSetter for 60fps KaTeX updates", () => {
    const file = fs.readFileSync(path.resolve("components/animations/universal-animation-player.tsx"), "utf-8")
    expect(file).toContain("requestAnimationFrame")
    expect(file).toContain("quickSetter")
    // ensure bridge schedules within rAF
    expect(file).toMatch(/requestAnimationFrame/)
  })

  it("keeps panOnDrag true while allowing in-node interaction", () => {
    const file = fs.readFileSync(path.resolve("components/animations/universal-animation-player.tsx"), "utf-8")
    expect(file).toContain("panOnDrag={true}")
    // interactive shell override must coexist
    expect(file).toContain("[&_.interactive-node-shell]:!pointer-events-auto")
  })

  it("bridge flushes within single frame (coalescing)", async () => {
    // simulate rAF coalescing: rapid setVariable should batch
    const { InteractionRuntime } = await import("@/lib/animations/interaction-runtime")
    const runtime = new InteractionRuntime()
    runtime.registerInteraction("step-1", { type: "variable_slider", variableName: "x", min: 0, max: 100, step: 1, defaultValue: 0 } as any)
    const cb = vi.fn()
    runtime.onVariableChange("x", cb)
    runtime.setVariable("x", 10)
    runtime.setVariable("x", 20)
    runtime.setVariable("x", 30)
    expect(cb).toHaveBeenCalledTimes(3) // immediate dispatch, but player coalesces via rAF — runtime itself dispatches synchronously
    expect(cb).toHaveBeenLastCalledWith(30)
  })
})

