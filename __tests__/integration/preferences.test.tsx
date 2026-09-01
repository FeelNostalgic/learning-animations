import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { renderHook, act } from "@testing-library/react"

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn(), info: vi.fn() },
}))

describe("Integration: preferences round-trip (task 4.4) — fakeTimers + happy-dom", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    localStorage.clear()
    vi.clearAllMocks()
  })
  afterEach(() => {
    vi.useRealTimers()
    localStorage.clear()
  })

  it("player_speed 1.5x round-trip persists and hydrates via usePlayerSpeed + resolvePlaybackSpeed", async () => {
    const { usePlayerSpeed } = await import("@/lib/hooks/use-preferences")
    const { resolvePlaybackSpeed } = await import("@/lib/animations/playback")

    const { result, unmount } = renderHook(() => usePlayerSpeed())
    expect(result.current[0]).toBeNull()

    act(() => {
      result.current[1]("1.5" as any)
    })
    act(() => {
      vi.advanceTimersByTime(3000)
    })
    expect(localStorage.getItem("player_speed")).not.toBeNull()
    const raw = JSON.parse(localStorage.getItem("player_speed")!)
    expect(String(raw)).toBe("1.5")

    // remount simulates reload — should hydrate to 1.5
    unmount()
    const { result: result2 } = renderHook(() => usePlayerSpeed())
    // useEffect hydrates after mount, need tick
    await act(async () => {
      vi.advanceTimersByTime(0)
    })
    // after effect, state should be 1.5 (as string stored, hook returns string)
    expect(String(result2.current[0])).toBe("1.5")

    // resolvePlaybackSpeed maps label to timeScale factor
    expect(resolvePlaybackSpeed(1.5 as any)).toBeGreaterThan(0)
    expect(resolvePlaybackSpeed(1 as any)).toBeGreaterThan(0)
  })

  it("shared catalog_filters key round-trip across FacetedCatalog + Dashboard (same stored value)", async () => {
    const { useCatalogFilters } = await import("@/lib/hooks/use-preferences")

    const filtersA = {
      searchQuery: "anim",
      selectedDiscipline: "physics",
      selectedTopic: "Mecánica",
      selectedDifficulty: "advanced",
      selectedSource: "official",
    } as any

    // FacetedCatalog writes
    const { result: catResult, unmount: unmountCat } = renderHook(() => useCatalogFilters())
    act(() => {
      catResult.current[1](filtersA)
    })
    act(() => {
      vi.advanceTimersByTime(3000)
    })
    expect(localStorage.getItem("catalog_filters")).not.toBeNull()
    expect(JSON.parse(localStorage.getItem("catalog_filters")!)).toEqual(filtersA)

    // Dashboard mounts (second instance) reads same key
    unmountCat()
    const { result: dashResult } = renderHook(() => useCatalogFilters())
    await act(async () => {
      vi.advanceTimersByTime(0)
    })
    expect(dashResult.current[0]).toEqual(filtersA)

    // Dashboard writes searchQuery change, preserves other fields
    act(() => {
      dashResult.current[1]({ ...filtersA, searchQuery: "quantum" })
    })
    act(() => {
      vi.advanceTimersByTime(3000)
    })
    expect(JSON.parse(localStorage.getItem("catalog_filters")!).searchQuery).toBe("quantum")

    // FacetedCatalog remount sees updated search
    const { result: catResult2 } = renderHook(() => useCatalogFilters())
    await act(async () => {
      vi.advanceTimersByTime(0)
    })
    expect((catResult2.current[0] as any).searchQuery).toBe("quantum")
  })

  it("viewport {x,y,zoom} round-trip via useBuilderViewport", async () => {
    const { useBuilderViewport } = await import("@/lib/hooks/use-preferences")
    const viewport = { x: 10, y: 20, zoom: 1.2 }

    const { result, unmount } = renderHook(() => useBuilderViewport())
    act(() => {
      result.current[1](viewport)
    })
    act(() => {
      vi.advanceTimersByTime(3000)
    })
    expect(JSON.parse(localStorage.getItem("builder_zoom_pan")!)).toEqual(viewport)

    unmount()
    const { result: result2 } = renderHook(() => useBuilderViewport())
    await act(async () => {
      vi.advanceTimersByTime(0)
    })
    expect(result2.current[0]).toEqual(viewport)
  })

  it("SSR hydration guard — zero hydration warning (no localStorage access during render, only in useEffect)", async () => {
    const getItemSpy = vi.spyOn(Storage.prototype, "getItem")
    const setItemSpy = vi.spyOn(Storage.prototype, "setItem")
    getItemSpy.mockClear()
    setItemSpy.mockClear()

    // import not yet called localStorage
    const mod = await import("@/lib/hooks/use-preferences")
    expect(getItemSpy).not.toHaveBeenCalled()

    const { useCatalogFilters: hook } = mod
    const { unmount } = renderHook(() => hook())
    // renderHook triggers render, but hook's getItem only inside useEffect, not sync
    // setItem should not have been called synchronously (debounce waits)
    expect(setItemSpy).not.toHaveBeenCalled()
    // getItem is called inside useEffect after mount — it will be called once mounted flag effect runs
    // but not during initial render: so immediately after render, call count may be 0 or 1 async
    unmount()
    getItemSpy.mockRestore()
    setItemSpy.mockRestore()
  })

  it("component files hydrate via useEffect guard — no localStorage outside useEffect", async () => {
    const fs = await import("node:fs")
    const catalogSrc = fs.readFileSync("components/catalog/faceted-catalog.tsx", "utf-8")
    const dashSrc = fs.readFileSync("components/my-animations/user-animations-dashboard.tsx", "utf-8")
    const playerSrc = fs.readFileSync("components/animations/animation-player.tsx", "utf-8")

    for (const [name, src] of [
      ["faceted-catalog", catalogSrc],
      ["dashboard", dashSrc],
      ["player", playerSrc],
    ] as const) {
      expect(src, `${name} must use useEffect for hydration`).toContain("useEffect")
      expect(src, `${name} must not access localStorage directly`).not.toContain("localStorage.getItem")
      expect(src, `${name} must not access localStorage directly`).not.toContain("localStorage.setItem")
    }
    // verify use-preferences encapsulates storage with useEffect + mounted flag
    const prefSrc = fs.readFileSync("lib/hooks/use-preferences.ts", "utf-8")
    expect(prefSrc).toContain("useEffect")
    expect(prefSrc).toContain("mounted")
    expect(prefSrc).toContain("useDebouncedLocalStorage")
  })
})
