import { describe, it, expect } from "vitest"
import { ACTION_DEFINITIONS } from "@/components/docs/action-definitions"

describe("Showcase Action Definitions & Scene Generators", () => {
  it("contains all 9 canonical action definitions", () => {
    expect(ACTION_DEFINITIONS).toHaveLength(9)
    const types = ACTION_DEFINITIONS.map((a) => a.type)
    expect(types).toContain("highlight")
    expect(types).toContain("pulse")
    expect(types).toContain("packet")
    expect(types).toContain("transform")
    expect(types).toContain("fade")
    expect(types).toContain("path_draw")
    expect(types).toContain("badge")
    expect(types).toContain("tooltip")
    expect(types).toContain("math_eval")
  })

  it("each action definition has complete metadata and valid jsonExample", () => {
    ACTION_DEFINITIONS.forEach((act) => {
      expect(act.title).toBeTruthy()
      expect(act.subtitle).toBeTruthy()
      expect(act.description).toBeTruthy()
      expect(act.whenToUse).toBeTruthy()
      expect(act.jsonExample).toBeDefined()
      expect(act.jsonExample.type).toBe(act.type)
      expect(typeof act.setupScene).toBe("function")
    })
  })

  it("each setupScene creates and returns a valid GSAP timeline", () => {
    ACTION_DEFINITIONS.forEach((act) => {
      const mockSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
      document.body.appendChild(mockSvg)

      const result = act.setupScene(mockSvg, `test-${act.type}`, "dark")
      expect(result).toBeDefined()
      expect(result.timeline).toBeDefined()
      expect(typeof result.timeline.play).toBe("function")
      expect(typeof result.timeline.pause).toBe("function")

      result.timeline.kill()
      document.body.removeChild(mockSvg)
    })
  })
})
