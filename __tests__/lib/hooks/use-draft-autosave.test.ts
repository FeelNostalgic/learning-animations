import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { renderHook, act } from "@testing-library/react"

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
  },
}))
import { toast } from "sonner"

const VALID_DATA = {
  title: "Titulo test",
  description: "desc",
  discipline: "general" as const,
  topic: "Tema test",
  tags: [] as string[],
  difficulty: "beginner" as const,
  is_public: false,
  nodes: [
    {
      id: "n1",
      type: "shape" as const,
      label: "Nodo 1",
      x: 0,
      y: 0,
    },
  ],
  connectors: [],
  steps: [
    {
      id: "s1",
      label: "Paso 1",
      description: "",
      duration: 1,
      actions: [],
    },
  ],
}

function makeEnvelope(overrides: Record<string, unknown> = {}) {
  return {
    v: 1,
    savedAt: "2026-09-01T12:00:00.000Z",
    serverUpdatedAt: "2026-09-01T10:00:00.000Z",
    data: VALID_DATA,
    ...overrides,
  }
}

describe("useDraftAutosave", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    localStorage.clear()
    vi.clearAllMocks()
  })
  afterEach(() => {
    vi.useRealTimers()
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it("writes envelope v1 with savedAt ISO and data after 3s when isDirty", async () => {
    const { useDraftAutosave } = await import("@/lib/hooks/use-draft-autosave")
    const { rerender } = renderHook(
      ({ data, opts }) => useDraftAutosave(data, opts),
      {
        initialProps: {
          data: VALID_DATA as any,
          opts: {
            animationId: null,
            isDirty: true,
            isSaving: false,
            serverUpdatedAt: null,
          },
        },
      }
    )
    expect(localStorage.getItem("learning_animations_draft_new")).toBeNull()
    act(() => {
      vi.advanceTimersByTime(3000)
    })
    const raw = localStorage.getItem("learning_animations_draft_new")
    expect(raw).not.toBeNull()
    const parsed = JSON.parse(raw!)
    expect(parsed.v).toBe(1)
    expect(typeof parsed.savedAt).toBe("string")
    expect(parsed.data.title).toBe("Titulo test")
    expect(parsed.serverUpdatedAt).toBeNull()
    // rerender not needed
    expect(rerender).toBeDefined()
  })

  it("debounce coalesces rapid edits into 1 write and respects isDirty gate", async () => {
    const spy = vi.spyOn(window.localStorage, "setItem")
    const { useDraftAutosave } = await import("@/lib/hooks/use-draft-autosave")
    const { rerender } = renderHook(
      ({ data }) =>
        useDraftAutosave(data, {
          animationId: "abc",
          isDirty: true,
          isSaving: false,
          serverUpdatedAt: null,
        }),
      { initialProps: { data: { ...VALID_DATA, title: "v1" } as any } }
    )
    for (let i = 2; i <= 5; i++) {
      rerender({ data: { ...VALID_DATA, title: `v${i}` } as any })
      act(() => {
        vi.advanceTimersByTime(500)
      })
    }
    expect(spy).not.toHaveBeenCalled()
    act(() => {
      vi.advanceTimersByTime(3000)
    })
    expect(spy).toHaveBeenCalledTimes(1)
    spy.mockRestore()
  })

  it("skips write when isDirty false or isSaving true", async () => {
    const { useDraftAutosave } = await import("@/lib/hooks/use-draft-autosave")
    renderHook(() =>
      useDraftAutosave(VALID_DATA as any, {
        animationId: null,
        isDirty: false,
        isSaving: false,
        serverUpdatedAt: null,
      })
    )
    act(() => {
      vi.advanceTimersByTime(3000)
    })
    expect(localStorage.getItem("learning_animations_draft_new")).toBeNull()

    const { useDraftAutosave: hook2 } = await import("@/lib/hooks/use-draft-autosave")
    renderHook(() =>
      hook2(VALID_DATA as any, {
        animationId: null,
        isDirty: true,
        isSaving: true,
        serverUpdatedAt: null,
      })
    )
    act(() => {
      vi.advanceTimersByTime(3000)
    })
    expect(localStorage.getItem("learning_animations_draft_new")).toBeNull()
  })

  it("flushes pending write on unmount and beforeunload", async () => {
    const { useDraftAutosave } = await import("@/lib/hooks/use-draft-autosave")
    const { unmount } = renderHook(() =>
      useDraftAutosave(VALID_DATA as any, {
        animationId: null,
        isDirty: true,
        isSaving: false,
        serverUpdatedAt: null,
      })
    )
    expect(localStorage.getItem("learning_animations_draft_new")).toBeNull()
    act(() => {
      unmount()
    })
    expect(localStorage.getItem("learning_animations_draft_new")).not.toBeNull()

    localStorage.clear()
    renderHook(() =>
      useDraftAutosave(VALID_DATA as any, {
        animationId: null,
        isDirty: true,
        isSaving: false,
        serverUpdatedAt: null,
      })
    )
    act(() => {
      window.dispatchEvent(new Event("beforeunload"))
    })
    expect(localStorage.getItem("learning_animations_draft_new")).not.toBeNull()
  })

  it("rejects envelope v!=1 and removes key", async () => {
    const { DRAFT_KEY } = await import("@/lib/hooks/use-draft-autosave")
    const key = DRAFT_KEY("xyz")
    localStorage.setItem(key, JSON.stringify(makeEnvelope({ v: 2 })))
    const { useDraftAutosave } = await import("@/lib/hooks/use-draft-autosave")
    const { result } = renderHook(() =>
      useDraftAutosave(VALID_DATA as any, {
        animationId: "xyz",
        isDirty: false,
        isSaving: false,
        serverUpdatedAt: null,
      })
    )
    // useEffect hydrates; draft should be null because invalid envelope removed
    expect(result.current.draft).toBeNull()
    expect(localStorage.getItem(key)).toBeNull()
  })

  it("rejects corrupt Zod data and removes key", async () => {
    const { DRAFT_KEY } = await import("@/lib/hooks/use-draft-autosave")
    const key = DRAFT_KEY("xyz")
    const corrupt = makeEnvelope({ data: { title: "", nodes: [], steps: [] } }) // fails Zod min1 title/nodes/steps
    localStorage.setItem(key, JSON.stringify(corrupt))
    const { useDraftAutosave } = await import("@/lib/hooks/use-draft-autosave")
    const { result } = renderHook(() =>
      useDraftAutosave(VALID_DATA as any, {
        animationId: "xyz",
        isDirty: false,
        isSaving: false,
        serverUpdatedAt: null,
      })
    )
    expect(result.current.draft).toBeNull()
    expect(localStorage.getItem(key)).toBeNull()
  })

  it("exposes isDraftNewer helper: savedAt > serverUpdatedAt and null as epoch", async () => {
    const mod = await import("@/lib/hooks/use-draft-autosave")
    expect(typeof (mod as any).isDraftNewer).toBe("function")
    const { isDraftNewer } = mod as any
    expect(isDraftNewer("2026-09-01T12:00:00.000Z", "2026-09-01T10:00:00.000Z")).toBe(true)
    expect(isDraftNewer("2026-09-01T09:00:00.000Z", "2026-09-01T10:00:00.000Z")).toBe(false)
    expect(isDraftNewer("2026-09-01T12:00:00.000Z", null)).toBe(true)
    expect(isDraftNewer("2026-09-01T12:00:00.000Z", undefined as any)).toBe(true)
  })

  it("stale draft not considered newer (ISO lexicographic)", async () => {
    const mod = await import("@/lib/hooks/use-draft-autosave")
    const { isDraftNewer } = mod as any
    expect(isDraftNewer("2026-09-01T08:00:00.000Z", "2026-09-01T10:00:00.000Z")).toBe(false)
  })

  it("handles QuotaExceededError with toast", async () => {
    const quotaError = new DOMException("Quota exceeded", "QuotaExceededError")
    try {
      Object.defineProperty(quotaError, "code", { value: 22 })
    } catch {}
    const spy = vi.spyOn(window.localStorage, "setItem").mockImplementation(() => {
      throw quotaError
    })
    const { useDraftAutosave } = await import("@/lib/hooks/use-draft-autosave")
    renderHook(() =>
      useDraftAutosave(VALID_DATA as any, {
        animationId: null,
        isDirty: true,
        isSaving: false,
        serverUpdatedAt: null,
      })
    )
    act(() => {
      vi.advanceTimersByTime(3000)
    })
    expect(toast.error).toHaveBeenCalled()
    spy.mockRestore()
  })

  it("clear removes key and cancels pending timer", async () => {
    const { useDraftAutosave, DRAFT_KEY } = await import("@/lib/hooks/use-draft-autosave")
    const { result } = renderHook(() =>
      useDraftAutosave(VALID_DATA as any, {
        animationId: null,
        isDirty: true,
        isSaving: false,
        serverUpdatedAt: null,
      })
    )
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    act(() => {
      result.current.clear()
    })
    expect(localStorage.getItem(DRAFT_KEY(null))).toBeNull()
    act(() => {
      vi.advanceTimersByTime(3000)
    })
    expect(localStorage.getItem(DRAFT_KEY(null))).toBeNull()
  })

  it("DRAFT_KEY uses learning_animations_draft_${id||new} pattern", async () => {
    const { DRAFT_KEY } = await import("@/lib/hooks/use-draft-autosave")
    expect(DRAFT_KEY(null)).toBe("learning_animations_draft_new")
    expect(DRAFT_KEY("abc-123")).toBe("learning_animations_draft_abc-123")
  })
})
