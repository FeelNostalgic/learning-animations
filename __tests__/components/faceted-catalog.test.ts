import { describe, it, expect } from "vitest"
import type { UnifiedCatalogItem } from "@/components/catalog/faceted-catalog"

describe("Faceted Catalog Data Processing & Filtering (TDD)", () => {
  const sampleItems: UnifiedCatalogItem[] = [
    {
      id: "arp",
      slug: "arp",
      title: "Protocolo ARP (Address Resolution Protocol)",
      description: "Resolución de direcciones IPv4 a MAC en red local",
      topic: "Redes L2",
      discipline: "computer_science",
      difficulty: "beginner",
      tags: ["arp", "ethernet", "ip"],
      stepsCount: 5,
      isOfficial: true,
    },
    {
      id: "fourier-transform",
      slug: "fourier-transform",
      title: "Transformada de Fourier",
      description: "Descomposición en frecuencias sinusoidales",
      topic: "Cálculo y Señales",
      discipline: "math",
      difficulty: "advanced",
      tags: ["fourier", "integrales"],
      stepsCount: 4,
      isOfficial: false,
    },
    {
      id: "wave-propagation",
      slug: "wave-propagation",
      title: "Propagación de Ondas Electromagnéticas",
      description: "Ecuaciones de Maxwell en el vacío",
      topic: "Electromagnetismo",
      discipline: "physics",
      difficulty: "intermediate",
      tags: ["maxwell", "ondas"],
      stepsCount: 3,
      isOfficial: false,
    },
  ]

  it("filters items by discipline", () => {
    const mathItems = sampleItems.filter((i) => i.discipline === "math")
    expect(mathItems).toHaveLength(1)
    expect(mathItems[0].title).toBe("Transformada de Fourier")
  })

  it("filters items by source (official vs community)", () => {
    const officials = sampleItems.filter((i) => i.isOfficial)
    const communities = sampleItems.filter((i) => !i.isOfficial)
    expect(officials).toHaveLength(1)
    expect(communities).toHaveLength(2)
  })

  it("filters items by search query across title, description, and tags", () => {
    const q = "maxwell"
    const matched = sampleItems.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.tags.some((t) => t.toLowerCase().includes(q))
    )
    expect(matched).toHaveLength(1)
    expect(matched[0].id).toBe("wave-propagation")
  })
})
