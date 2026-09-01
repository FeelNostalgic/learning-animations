"use client"

import { useEffect, useState, useCallback } from "react"
import { useDebouncedLocalStorage } from "./use-debounced-local-storage"

export type BuilderViewport = { x: number; y: number; zoom: number }
export type CatalogFilters = {
  searchQuery: string
  selectedDiscipline: string
  selectedTopic: string
  selectedDifficulty: string
  selectedSource: string
}
export type PlaybackSpeedLabel = string

export const BUILDER_VIEWPORT_KEY = "builder_zoom_pan"
export const PLAYER_SPEED_KEY = "player_speed"
export const CATALOG_FILTERS_KEY = "catalog_filters"

function useHydratedState<T>(key: string, fallback: T | null): [T | null, (v: T) => void] {
  const [state, setState] = useState<T | null>(fallback)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (typeof window === "undefined") return
    try {
      const raw = window.localStorage.getItem(key)
      if (raw) {
        setState(JSON.parse(raw) as T)
      }
    } catch {
      // ignore corrupt
    }
  }, [key])

  const setAndPersist = useCallback((v: T) => {
    setState(v)
  }, [])

  useDebouncedLocalStorage(key, state as T, {
    delayMs: 3000,
    skip: !mounted || state === null,
  })

  return [state, setAndPersist]
}

export function useBuilderViewport(): [BuilderViewport | null, (v: BuilderViewport) => void] {
  return useHydratedState<BuilderViewport>(BUILDER_VIEWPORT_KEY, null)
}

export function usePlayerSpeed(): [PlaybackSpeedLabel | null, (v: PlaybackSpeedLabel) => void] {
  return useHydratedState<PlaybackSpeedLabel>(PLAYER_SPEED_KEY, null)
}

export function useCatalogFilters(): [CatalogFilters | null, (v: CatalogFilters) => void] {
  return useHydratedState<CatalogFilters>(CATALOG_FILTERS_KEY, null)
}
