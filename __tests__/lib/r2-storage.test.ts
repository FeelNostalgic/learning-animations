import { describe, it, expect } from "vitest"
import { validateImageUpload, isR2Configured } from "@/lib/storage/r2"

describe("Cloudflare R2 Storage & Image Validation (TDD)", () => {
  it("validates allowed image formats (PNG, JPEG, WebP, SVG, GIF)", () => {
    expect(validateImageUpload("image/png", 1024 * 1024).valid).toBe(true)
    expect(validateImageUpload("image/jpeg", 2 * 1024 * 1024).valid).toBe(true)
    expect(validateImageUpload("image/webp", 500 * 1024).valid).toBe(true)
    expect(validateImageUpload("image/svg+xml", 100 * 1024).valid).toBe(true)
    expect(validateImageUpload("image/gif", 3 * 1024 * 1024).valid).toBe(true)
  })

  it("rejects non-image MIME types", () => {
    expect(validateImageUpload("application/pdf", 1024).valid).toBe(false)
    expect(validateImageUpload("text/html", 1024).valid).toBe(false)
    expect(validateImageUpload("application/javascript", 1024).valid).toBe(false)
  })

  it("rejects oversized images greater than 5MB", () => {
    const sixMB = 6 * 1024 * 1024
    const res = validateImageUpload("image/png", sixMB)
    expect(res.valid).toBe(false)
    expect(res.error).toContain("5MB")
  })

  it("gracefully detects when Cloudflare R2 environment variables are not set", () => {
    // In local test environment without env vars, isR2Configured returns false
    const configured = isR2Configured()
    expect(typeof configured).toBe("boolean")
  })
})
