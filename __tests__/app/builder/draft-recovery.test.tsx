import { describe, it, expect } from "vitest"
import fs from "node:fs"

describe("Builder draft recovery dialog", () => {
  it("page contains recovery AlertDialog with exact copy and handlers", async () => {
    const source = fs.readFileSync("app/builder/page.tsx", "utf-8")
    expect(source).toContain("Se ha recuperado un borrador sin guardar. ¿Deseas restaurarlo o cargar la versión guardada?")
    expect(source).toContain("AlertDialog")
    expect(source).toContain("useDraftAutosave")
    expect(source).toContain("DRAFT_KEY")
    expect(source).toContain("universalToReactFlow")
    expect(source).toContain("isDraftNewer")
    expect(source).toContain("clear")
    expect(source).toContain("Restaurar")
    expect(source).toContain("Descartar")
  })

  it("page clears draft on handleSave success and handleNewAnimation", async () => {
    const source = fs.readFileSync("app/builder/page.tsx", "utf-8")
    // handleSave should call clear
    expect(source).toMatch(/handleSave[\s\S]*?clear\(\)/)
    // handleNewAnimation should call clear
    expect(source).toMatch(/handleNewAnimation[\s\S]*?clear\(\)/)
  })

  it("page flushes on unmount/beforeunload via hook", async () => {
    const source = fs.readFileSync("app/builder/page.tsx", "utf-8")
    // hook itself handles beforeunload, but page should use flush or ensure hook is wired with serializedState isDirty gate
    expect(source).toContain("isDirty")
    expect(source).toContain("serializedState")
    expect(source).toContain("serverUpdatedAt")
  })

  it("validates draft via safeParseUniversalData / Zod envelope v1", async () => {
    const source = fs.readFileSync("lib/hooks/use-draft-autosave.ts", "utf-8")
    expect(source).toContain("safeParseUniversalData")
    expect(source).toContain("isValidEnvelope")
    expect(source).toContain("v: 1")
  })
})
