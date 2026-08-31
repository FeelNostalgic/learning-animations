// @ts-nocheck
import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { ReactFlowProvider } from "@xyflow/react"
import { InteractiveSliderNode } from "@/components/builder/nodes/InteractiveSliderNode"
import { QuizNode } from "@/components/builder/nodes/QuizNode"
import { BranchNode } from "@/components/builder/nodes/BranchNode"

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <ReactFlowProvider>{children}</ReactFlowProvider>
)

describe("Interactive Nodes — Phase 3 RED", () => {
  describe("InteractiveSliderNode", () => {
    it("renders slider with aria-valuenow/min/max/valuetext and variableName", () => {
      render(
        <Wrapper>
          <InteractiveSliderNode
            id="s1"
            data={{
              label: "Slider x",
              props: { variableName: "x", min: 0, max: 100, step: 1, defaultValue: 50 },
            }}
            selected={false}
          />
        </Wrapper>
      )
      const slider = screen.getByRole("slider")
      expect(slider).toBeInTheDocument()
      expect(slider.getAttribute("aria-valuenow")).toBe("50")
      expect(slider.getAttribute("aria-valuemin")).toBe("0")
      expect(slider.getAttribute("aria-valuemax")).toBe("100")
      expect(screen.getByText(/variable/i)).toBeInTheDocument()
    })

    it("renders variable name and unit", () => {
      render(
        <Wrapper>
          <InteractiveSliderNode
            id="s2"
            data={{ label: "Vel", props: { variableName: "vel", min: 0, max: 10, step: 1, defaultValue: 5, unit: "m/s" } }}
            selected={false}
          />
        </Wrapper>
      )
      expect(screen.getByText(/vel/)).toBeInTheDocument()
      expect(screen.getAllByText(/m\/s/).length).toBeGreaterThan(0)
    })
  })

  describe("QuizNode", () => {
    it("renders single quiz as radiogroup with aria-live feedback", () => {
      render(
        <Wrapper>
          <QuizNode
            id="q1"
            data={{
              label: "Quiz",
              props: {
                quizType: "single",
                question: "¿Cuánto es 2+2?",
                options: [
                  { id: "a", text: "3", isCorrect: false, feedback: "Incorrecto" },
                  { id: "b", text: "4", isCorrect: true, feedback: "Correcto" },
                ],
                blocksNextStep: true,
              },
            }}
            selected={false}
          />
        </Wrapper>
      )
      expect(screen.getByRole("radiogroup")).toBeInTheDocument()
      expect(screen.getByText("¿Cuánto es 2+2?")).toBeInTheDocument()
      const live = screen.getByTestId("quiz-feedback")
      expect(live.getAttribute("aria-live")).toBe("polite")
    })

    it("renders multi quiz as checkboxes", () => {
      render(
        <Wrapper>
          <QuizNode
            id="q2"
            data={{
              label: "Quiz multi",
              props: {
                quizType: "multi",
                question: "Selecciona",
                options: [
                  { id: "a", text: "A", isCorrect: true, feedback: "ok" },
                  { id: "b", text: "B", isCorrect: false, feedback: "no" },
                ],
                blocksNextStep: false,
              },
            }}
            selected={false}
          />
        </Wrapper>
      )
      expect(screen.getAllByRole("checkbox")).toHaveLength(2)
    })

    it("shows blocksNextStep indicator", () => {
      render(
        <Wrapper>
          <QuizNode
            id="q3"
            data={{
              label: "Quiz",
              props: {
                quizType: "single",
                question: "Q?",
                options: [
                  { id: "a", text: "A", isCorrect: true, feedback: "ok" },
                  { id: "b", text: "B", isCorrect: false, feedback: "no" },
                ],
                blocksNextStep: true,
              },
            }}
            selected={false}
          />
        </Wrapper>
      )
      expect(screen.getByText(/bloquea avance/i)).toBeInTheDocument()
    })
  })

  describe("BranchNode", () => {
    it("renders single target jump with fork visual", () => {
      render(
        <Wrapper>
          <BranchNode
            id="b1"
            data={{
              label: "Branch",
              props: { targetStepId: "step-5" },
            }}
            selected={false}
          />
        </Wrapper>
      )
      expect(screen.getByText(/salta a/i)).toBeInTheDocument()
      expect(screen.getByText("step-5")).toBeInTheDocument()
    })

    it("renders invalid guard role=alert when target missing", () => {
      render(
        <Wrapper>
          <BranchNode
            id="b2"
            data={{
              label: "Branch invalid",
              props: { targetStepId: "" },
            }}
            selected={false}
          />
        </Wrapper>
      )
      const alert = screen.getByRole("alert")
      expect(alert).toBeInTheDocument()
      expect(alert.getAttribute("aria-live")).toBe("assertive")
      expect(alert.textContent).toMatch(/inválido/i)
    })

    it("still supports legacy choices array (backwards compat)", () => {
      render(
        <Wrapper>
          <BranchNode
            id="b3"
            data={{
              label: "Branch legacy",
              props: { choices: [{ id: "c1", label: "Ir a paso 5", targetStepId: "step-5" }] } as any,
            }}
            selected={false}
          />
        </Wrapper>
      )
      expect(screen.getByText("step-5")).toBeInTheDocument()
    })
  })
})

