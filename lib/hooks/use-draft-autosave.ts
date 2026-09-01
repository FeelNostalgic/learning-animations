"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { toast } from "sonner"
import { safeParseUniversalData } from "@/lib/validations/universal-animation"
import type { UniversalAnimationData } from "@/types/universal-animation"

export const DRAFT_KEY = (id: string | null) => `learning_animations_draft_${id ?? "new"}`

export function isDraftNewer(savedAt: string, serverUpdatedAt: string | null | undefined): boolean {
  if (!serverUpdatedAt) return true
  return savedAt > serverUpdatedAt
}

export type DraftEnvelope = {
  v: 1
  savedAt: string
  serverUpdatedAt: string | null
  data: UniversalAnimationData
}

function isQuotaError(error: unknown): boolean {
  if (error instanceof DOMException) {
    return error.name === "QuotaExceededError" || (error as unknown as { code: number }).code === 22
  }
  if (error && typeof error === "object" && "name" in error) {
    return (error as { name: string }).name === "QuotaExceededError"
  }
  if (error && typeof error === "object" && "code" in error) {
    return (error as { code: number }).code === 22
  }
  return false
}

function isValidEnvelope(raw: unknown): raw is DraftEnvelope {
  if (typeof raw !== "object" || raw === null) return false
  const obj = raw as Record<string, unknown>
  if (obj.v !== 1) return false
  if (typeof obj.savedAt !== "string") return false
  if (obj.serverUpdatedAt !== null && typeof obj.serverUpdatedAt !== "string") return false
  if (typeof obj.data !== "object" || obj.data === null) return false
  return true
}

export interface UseDraftAutosaveOptions {
  animationId: string | null
  isDirty: boolean
  isSaving: boolean
  serverUpdatedAt: string | null
}

export function useDraftAutosave(
  data: UniversalAnimationData,
  options: UseDraftAutosaveOptions
): { draft: DraftEnvelope | null; clear: () => void; flush: () => void } {
  const { animationId, isDirty, isSaving, serverUpdatedAt } = options

  const [draft, setDraft] = useState<DraftEnvelope | null>(null)

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasPendingRef = useRef(false)
  const dataRef = useRef(data)
  const serverUpdatedAtRef = useRef(serverUpdatedAt)
  const animationIdRef = useRef(animationId)
  const isDirtyRef = useRef(isDirty)
  const isSavingRef = useRef(isSaving)

  dataRef.current = data
  serverUpdatedAtRef.current = serverUpdatedAt
  animationIdRef.current = animationId
  isDirtyRef.current = isDirty
  isSavingRef.current = isSaving

  const readDraft = useCallback(() => {
    if (typeof window === "undefined") return null
    const key = DRAFT_KEY(animationIdRef.current)
    try {
      const raw = window.localStorage.getItem(key)
      if (!raw) return null
      const parsed = JSON.parse(raw)
      if (!isValidEnvelope(parsed)) {
        window.localStorage.removeItem(key)
        return null
      }
      const result = safeParseUniversalData(parsed.data)
      if (!result.success) {
        window.localStorage.removeItem(key)
        return null
      }
      return parsed as DraftEnvelope
    } catch {
      try {
        window.localStorage.removeItem(DRAFT_KEY(animationIdRef.current))
      } catch {
        // ignore
      }
      return null
    }
  }, [])

  // hydrate draft on mount / animationId change
  useEffect(() => {
    if (typeof window === "undefined") return
    const loaded = readDraft()
    setDraft(loaded)
  }, [animationId, readDraft])

  const doWrite = useCallback(() => {
    if (typeof window === "undefined") return
    if (!isDirtyRef.current || isSavingRef.current) return
    const envelope: DraftEnvelope = {
      v: 1,
      savedAt: new Date().toISOString(),
      serverUpdatedAt: serverUpdatedAtRef.current,
      data: dataRef.current,
    }
    const key = DRAFT_KEY(animationIdRef.current)
    try {
      window.localStorage.setItem(key, JSON.stringify(envelope))
      setDraft(envelope)
    } catch (error) {
      if (isQuotaError(error)) {
        toast.error("No se pudo guardar localmente: almacenamiento lleno")
      } else {
        toast.error("No se pudo guardar localmente")
      }
    }
  }, [])

  const flush = useCallback(() => {
    if (typeof window === "undefined") return
    if (!hasPendingRef.current) return
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    hasPendingRef.current = false
    doWrite()
  }, [doWrite])

  const clear = useCallback(() => {
    if (typeof window === "undefined") return
    const key = DRAFT_KEY(animationIdRef.current)
    try {
      window.localStorage.removeItem(key)
    } catch {
      // ignore
    }
    setDraft(null)
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    hasPendingRef.current = false
  }, [])

  // debounced autosave
  useEffect(() => {
    if (typeof window === "undefined") return
    if (!isDirty || isSaving) {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
      hasPendingRef.current = false
      return
    }

    if (timerRef.current) clearTimeout(timerRef.current)
    hasPendingRef.current = true
    timerRef.current = setTimeout(() => {
      timerRef.current = null
      hasPendingRef.current = false
      doWrite()
    }, 3000)

    const handleBeforeUnload = () => {
      flush()
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isDirty, isSaving, data, serverUpdatedAt, animationId, doWrite, flush])

  // flush on unmount if pending
  useEffect(() => {
    return () => {
      if (hasPendingRef.current) {
        flush()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { draft, clear, flush }
}
