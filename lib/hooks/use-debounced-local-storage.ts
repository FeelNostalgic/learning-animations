"use client"

import { useEffect, useRef } from "react"
import { toast } from "sonner"

export interface UseDebouncedLocalStorageOptions<T> {
  delayMs?: number
  skip?: boolean
  serialize?: (value: T) => string
  deserialize?: (raw: string) => T
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

export function useDebouncedLocalStorage<T>(
  key: string,
  value: T,
  options: UseDebouncedLocalStorageOptions<T> = {}
): void {
  const { delayMs = 3000, skip = false, serialize } = options

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingRef = useRef<T>(value)
  const keyRef = useRef(key)
  const serializeRef = useRef(serialize)
  const skipRef = useRef(skip)
  const hasPendingRef = useRef(false)

  keyRef.current = key
  serializeRef.current = serialize
  pendingRef.current = value
  skipRef.current = skip

  const doWrite = (val: T, k: string) => {
    if (typeof window === "undefined") return
    try {
      const raw = serializeRef.current ? serializeRef.current(val) : JSON.stringify(val)
      window.localStorage.setItem(k, raw)
    } catch (error) {
      if (isQuotaError(error)) {
        toast.error("No se pudo guardar localmente: almacenamiento lleno")
      } else {
        toast.error("No se pudo guardar localmente")
      }
    }
  }

  const flushIfPending = () => {
    if (skipRef.current) return
    if (!hasPendingRef.current) return
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    hasPendingRef.current = false
    doWrite(pendingRef.current as T, keyRef.current)
  }

  useEffect(() => {
    if (typeof window === "undefined") return
    if (skip) {
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
      doWrite(value, key)
    }, delayMs)

    const handleBeforeUnload = () => {
      flushIfPending()
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
      // do NOT flush here — only on unmount / beforeunload
      // hasPending stays true so unmount can flush
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, value, delayMs, skip])

  useEffect(() => {
    return () => {
      flushIfPending()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
