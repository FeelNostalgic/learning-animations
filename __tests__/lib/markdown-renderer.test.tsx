import { describe, it, expect } from "vitest"
import React from "react"
import { sanitizeMarkdownHtml } from "@/lib/markdown/render"

describe("Markdown & KaTeX Security & Sanitization", () => {
  it("allows safe markdown formatting (bold, italic, lists)", () => {
    const raw = "**Texto importante** con *cursiva* y una [guía](https://example.com)"
    const sanitized = sanitizeMarkdownHtml(raw)
    expect(sanitized).toContain("**Texto importante**")
    expect(sanitized).toContain("*cursiva*")
  })

  it("neutralizes script tags and javascript execution vectors", () => {
    const malicious = '<script>alert("XSS")</script>**Texto seguro**'
    const sanitized = sanitizeMarkdownHtml(malicious)
    expect(sanitized).not.toContain("<script>")
    expect(sanitized).not.toContain('alert("XSS")')
  })

  it("neutralizes onerror and inline event handler exploits", () => {
    const malicious = '<img src="invalid-image" onerror="alert(1)" />'
    const sanitized = sanitizeMarkdownHtml(malicious)
    expect(sanitized).not.toContain("onerror")
  })

  it("preserves LaTeX math formulas with dollar signs intact for KaTeX", () => {
    const mathContent = "La fórmula de Euler es $e^{i\\pi} + 1 = 0$ y la integral $$\\int_0^\\infty e^{-x} dx = 1$$."
    const sanitized = sanitizeMarkdownHtml(mathContent)
    expect(sanitized).toContain("$e^{i\\pi} + 1 = 0$")
    expect(sanitized).toContain("$$\\int_0^\\infty e^{-x} dx = 1$$")
  })
})
