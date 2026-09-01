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

describe("useDebouncedLocalStorage", () => {
  const KEY = "test_key"

  beforeEach(() => {
    vi.restoreAllMocks()
    vi.useFakeTimers()
    localStorage.clear()
    vi.clearAllMocks()
    vi.spyOn(window, "addEventListener")
    vi.spyOn(window, "removeEventListener")
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    localStorage.clear()
  })

  it("does not access localStorage during render (SSR guard)", async () => {
    const getItemSpy = vi.spyOn(Storage.prototype, "getItem")
    const setItemSpy = vi.spyOn(Storage.prototype, "setItem")
    const mod = await import("@/lib/hooks/use-debounced-local-storage")
    // the hook should not have called localStorage synchronously at import
    expect(getItemSpy).not.toHaveBeenCalled()
    expect(setItemSpy).not.toHaveBeenCalled()

    // render hook — still should not write synchronously
    const { useDebouncedLocalStorage } = mod
    renderHook(() => useDebouncedLocalStorage(KEY, { a: 1 }, { delayMs: 3000 }))
    expect(setItemSpy).not.toHaveBeenCalled()
    getItemSpy.mockRestore()
    setItemSpy.mockRestore()
  })

  it("writes debounced value after 3s (happy path)", async () => {
    const { useDebouncedLocalStorage } = await import("@/lib/hooks/use-debounced-local-storage")
    const { rerender } = renderHook(
      ({ value }) => useDebouncedLocalStorage(KEY, value, { delayMs: 3000 }),
      { initialProps: { value: { count: 1 } } }
    )

    expect(localStorage.getItem(KEY)).toBeNull()

    act(() => {
      vi.advanceTimersByTime(3000)
    })

    expect(localStorage.getItem(KEY)).toBe(JSON.stringify({ count: 1 }))

    // update value and verify second write after debounce
    rerender({ value: { count: 2 } })
    act(() => {
      vi.advanceTimersByTime(2999)
    })
    expect(localStorage.getItem(KEY)).toBe(JSON.stringify({ count: 1 }))
    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(localStorage.getItem(KEY)).toBe(JSON.stringify({ count: 2 }))
  })

  it("coalesces 5 rapid edits into 1 write", async () => {
    const setItemSpy = vi.spyOn(window.localStorage, "setItem")
    const { useDebouncedLocalStorage } = await import("@/lib/hooks/use-debounced-local-storage")

    const { rerender } = renderHook(
      ({ value }) => useDebouncedLocalStorage(KEY, value, { delayMs: 3000 }),
      { initialProps: { value: 1 } }
    )

    for (let i = 2; i <= 5; i++) {
      rerender({ value: i })
      act(() => {
        vi.advanceTimersByTime(500)
      })
    }
    // No write yet because debounce hasn't elapsed since last edit
    expect(setItemSpy).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(3000)
    })

    expect(setItemSpy).toHaveBeenCalledTimes(1)
    expect(localStorage.getItem(KEY)).toBe(JSON.stringify(5))
    setItemSpy.mockRestore()
  })

  it("skips write when skip is true", async () => {
    const { useDebouncedLocalStorage } = await import("@/lib/hooks/use-debounced-local-storage")
    renderHook(() => useDebouncedLocalStorage(KEY, { x: 10 }, { delayMs: 3000, skip: true }))

    act(() => {
      vi.advanceTimersByTime(3000)
    })

    expect(localStorage.getItem(KEY)).toBeNull()
  })

  it("flushes pending write on unmount", async () => {
    const { useDebouncedLocalStorage } = await import("@/lib/hooks/use-debounced-local-storage")
    const { unmount } = renderHook(() =>
      useDebouncedLocalStorage(KEY, { pending: true }, { delayMs: 3000 })
    )

    expect(localStorage.getItem(KEY)).toBeNull()

    act(() => {
      unmount()
    })

    expect(localStorage.getItem(KEY)).toBe(JSON.stringify({ pending: true }))
  })

  it("flushes on beforeunload", async () => {
    const { useDebouncedLocalStorage } = await import("@/lib/hooks/use-debounced-local-storage")
    renderHook(() => useDebouncedLocalStorage(KEY, { unload: true }, { delayMs: 3000 }))

    expect(localStorage.getItem(KEY)).toBeNull()

    act(() => {
      window.dispatchEvent(new Event("beforeunload"))
    })

    expect(localStorage.getItem(KEY)).toBe(JSON.stringify({ unload: true }))
  })

  it("handles QuotaExceededError with toast and no crash", async () => {
    const quotaError = new DOMException("Quota exceeded", "QuotaExceededError")
    try {
      Object.defineProperty(quotaError, "code", { value: 22 })
    } catch {
      // ignore if read-only
    }

    const spy = vi.spyOn(window.localStorage, "setItem").mockImplementation(() => {
      throw quotaError
    })

    const { useDebouncedLocalStorage } = await import("@/lib/hooks/use-debounced-local-storage")
    renderHook(() => useDebouncedLocalStorage(KEY, { big: "data" }, { delayMs: 3000 }))

    act(() => {
      vi.advanceTimersByTime(3000)
    })

    expect(toast.error).toHaveBeenCalled()
    expect(localStorage.getItem(KEY)).toBeNull()
    spy.mockRestore()
  })

  it("uses custom serialize when provided", async () => {
    const { useDebouncedLocalStorage } = await import("@/lib/hooks/use-debounced-local-storage")
    const serialize = (v: number) => `custom-${v}`

    renderHook(() => useDebouncedLocalStorage(KEY, 42, { delayMs: 1000, serialize }))

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(localStorage.getItem(KEY)).toBe("custom-42")
  })
})
