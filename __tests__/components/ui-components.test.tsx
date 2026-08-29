import { describe, it, expect } from "vitest"
import { badgeVariants } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"

describe("Shadcn UI Class Variance Authority Variants", () => {
  it("computes badge variants properly", () => {
    expect(badgeVariants({ variant: "default" })).toContain("bg-primary")
    expect(badgeVariants({ variant: "success" })).toContain("bg-emerald-500/10")
    expect(badgeVariants({ variant: "warning" })).toContain("bg-amber-500/10")
    expect(badgeVariants({ variant: "outline" })).toContain("border-border")
  })

  it("computes button variants properly", () => {
    expect(buttonVariants({ variant: "default" })).toContain("bg-primary")
    expect(buttonVariants({ variant: "destructive" })).toContain("bg-destructive")
    expect(buttonVariants({ variant: "outline" })).toContain("border-input")
    expect(buttonVariants({ variant: "ghost" })).toContain("hover:bg-accent")
  })
})
