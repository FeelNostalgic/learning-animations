"use client"

import React, { useState } from "react"
import {
  Circle,
  Square,
  Diamond,
  Sigma,
  FileText,
  Image as ImageIcon,
  Laptop,
  Network,
  Shield,
  Server,
  Cloud,
  Box,
  Spline,
  Sliders,
  Sparkles,
  Check,
  Copy,
  Code2,
} from "lucide-react"
import { MarkdownView } from "@/components/ui/markdown-view"
import { toast } from "sonner"

interface ComponentSpec {
  id: string
  name: string
  category: "geometry" | "math" | "text" | "image" | "network" | "container" | "connector"
  icon: typeof Circle
  summary: string
  description: string
  properties: {
    name: string
    type: string
    defaultValue: string
    description: string
  }[]
  jsonSnippet: Record<string, any>
  interactivePreview: (theme: "light" | "dark") => React.ReactNode
}

export function ComponentCatalog() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [activeJsonId, setActiveJsonId] = useState<string | null>(null)

  const handleCopy = (id: string, obj: any, name?: string) => {
    navigator.clipboard.writeText(JSON.stringify(obj, null, 2))
    setCopiedId(id)
    toast.success("JSON copiado al portapapeles", {
      description: name ? `Snippet del componente "${name}" copiado.` : "Snippet JSON copiado.",
    })
    setTimeout(() => setCopiedId(null), 2000)
  }

  const COMPONENTS: ComponentSpec[] = [
    // 1. FORMAS GEOMÉTRICAS
    {
      id: "comp-shape",
      name: "Nodos de formas geométricas",
      category: "geometry",
      icon: Circle,
      summary: "Círculos, rectángulos redondeados, diamantes, píldoras y triángulos",
      description:
        "Elementos base vectoriales para diagramas de flujo, autómatas, máquinas de estado y nodos de redes neuronales.",
      properties: [
        { name: "shapeDetails.shapeType", type: "'circle' | 'rect' | 'rounded_rect' | 'diamond' | 'pill' | 'triangle'", defaultValue: "'circle'", description: "Geometría del nodo" },
        { name: "fill", type: "string (Hex / RGBA / 'transparent')", defaultValue: "'var(--card)'", description: "Color de fondo con soporte de canal alfa" },
        { name: "stroke", type: "string (Hex / RGBA / 'transparent')", defaultValue: "'var(--primary)'", description: "Color de borde con soporte de canal alfa" },
        { name: "strokeWidth", type: "number", defaultValue: "2", description: "Grosor del borde (0 para modo sin borde)" },
        { name: "width / height", type: "number (px)", defaultValue: "80 x 80", description: "Dimensiones ajustables interactivamente" },
        { name: "opacity", type: "number (0 a 1)", defaultValue: "1", description: "Opacidad global del nodo" },
      ],
      jsonSnippet: {
        id: "node-circle-1",
        type: "shape",
        label: "Estado inicial",
        x: 300,
        y: 200,
        width: 80,
        height: 80,
        shapeDetails: { shapeType: "circle", radius: 36 },
        fill: "rgba(0, 112, 243, 0.15)",
        stroke: "#0070F3",
        strokeWidth: 2.5,
        opacity: 1,
      },
      interactivePreview: () => (
        <div className="flex items-center justify-center gap-4 py-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary bg-primary/15 text-primary text-xs font-bold shadow-md">
            Círculo
          </div>
          <div className="flex h-14 w-22 items-center justify-center rounded-xl border-2 border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-bold shadow-md">
            Bloque
          </div>
          <div className="flex h-12 w-12 rotate-45 items-center justify-center rounded-md border-2 border-amber-500 bg-amber-500/15 text-amber-500 shadow-md">
            <span className="-rotate-45 text-[10px] font-bold">Cond</span>
          </div>
          <div className="flex h-10 w-24 items-center justify-center rounded-full border-2 border-purple-500 bg-purple-500/15 text-purple-500 text-[11px] font-bold shadow-md">
            Píldora
          </div>
        </div>
      ),
    },

    // 2. FÓRMULAS KATEX
    {
      id: "comp-math",
      name: "Nodos matemáticos KaTeX",
      category: "math",
      icon: Sigma,
      summary: "Renderizado algebraico de alta calidad con sintaxis LaTeX",
      description:
        "Permite insertar ecuaciones matemáticas complejas, integrales, límites, derivadas y matrices con edición inline mediante doble clic y previsualización en tiempo real.",
      properties: [
        { name: "content", type: "string (LaTeX / KaTeX)", defaultValue: "'f(x) = x^2'", description: "Código de la fórmula matemática a renderizar" },
        { name: "label", type: "string", defaultValue: "'Fórmula'", description: "Título visible en la cabecera del nodo" },
        { name: "fill", type: "string", defaultValue: "'var(--card)'", description: "Color de fondo del contenedor" },
        { name: "strokeWidth", type: "number", defaultValue: "2", description: "Grosor del borde (0px para fórmula flotante limpia)" },
        { name: "width / height", type: "number (px)", defaultValue: "200 x 80", description: "Dimensiones del recuadro" },
      ],
      jsonSnippet: {
        id: "node-math-1",
        type: "math",
        label: "Integral definida",
        content: "\\int_a^b f(x)\\,dx = F(b) - F(a)",
        x: 400,
        y: 250,
        width: 220,
        height: 80,
        fill: "var(--card)",
        stroke: "#8B5CF6",
        strokeWidth: 2,
      },
      interactivePreview: () => (
        <div className="flex items-center justify-center py-4">
          <div className="rounded-xl border-2 border-purple-500 bg-card p-3 shadow-lg min-w-[240px] text-center">
            <div className="text-[10px] font-bold uppercase tracking-wider text-purple-500 border-b border-border/50 pb-1 mb-2">
              Integral definida
            </div>
            <MarkdownView inline content="$\int_a^b f(x)\,dx = F(b) - F(a)$" />
          </div>
        </div>
      ),
    },

    // 3. TARJETA MARKDOWN
    {
      id: "comp-text",
      name: "Tarjetas de texto enriquecido / markdown",
      category: "text",
      icon: FileText,
      summary: "Notas explicativas con negrita, listas, código y fórmulas inline",
      description:
        "Nodos de documentación pedagógica para desglosar conceptos, presentar enunciados de problemas o dar instrucciones paso a paso.",
      properties: [
        { name: "content", type: "string (Markdown)", defaultValue: "'**Concepto**'", description: "Texto enriquecido compatible con Markdown y KaTeX inline" },
        { name: "label", type: "string", defaultValue: "'Nota'", description: "Título del encabezado" },
        { name: "strokeWidth", type: "number", defaultValue: "1", description: "0px para tarjeta sin bordes" },
        { name: "width / height", type: "number (px)", defaultValue: "220 x 110", description: "Dimensiones ajustables" },
      ],
      jsonSnippet: {
        id: "node-text-1",
        type: "text",
        label: "Concepto clave",
        content: "**Principio de Bernoulli**:\nEl aumento de velocidad reduce la presión interna del fluido.",
        x: 500,
        y: 300,
        width: 240,
        height: 110,
        fill: "var(--card)",
        stroke: "var(--border)",
        strokeWidth: 1,
      },
      interactivePreview: () => (
        <div className="flex items-center justify-center py-3">
          <div className="rounded-xl border border-border bg-card p-3 shadow-md max-w-xs text-xs space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary border-b border-border/40 pb-1">
              <FileText className="size-3" />
              <span>Concepto clave</span>
            </div>
            <p className="text-muted-foreground leading-relaxed pt-1">
              <strong className="text-foreground">Principio de Bernoulli:</strong> El aumento de velocidad reduce la presión interna del fluido.
            </p>
          </div>
        </div>
      ),
    },

    // 4. IMÁGENES
    {
      id: "comp-image",
      name: "Nodos de imagen (Cloudflare R2 / URL externa)",
      category: "image",
      icon: ImageIcon,
      summary: "Imágenes vectoriales SVG, PNG, WebP, JPEG o GIF",
      description:
        "Permite subir archivos locales (subidos automáticamente a Cloudflare R2 con CDN) o pegar enlaces directos de imágenes remotas.",
      properties: [
        { name: "imageUrl", type: "string (URL / Data-URI)", defaultValue: "''", description: "Enlace público o Data-URI de la imagen" },
        { name: "imageFit", type: "'contain' | 'cover' | 'fill'", defaultValue: "'contain'", description: "Modo de escalado y ajuste visual" },
        { name: "label", type: "string", defaultValue: "'Imagen'", description: "Pie de imagen descriptivo" },
        { name: "strokeWidth", type: "number", defaultValue: "1", description: "Grosor del marco exterior" },
      ],
      jsonSnippet: {
        id: "node-img-1",
        type: "image",
        label: "Logo de Ejemplo",
        imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/77/Google_Images_2015_logo.svg/330px-Google_Images_2015_logo.svg.png",
        imageFit: "contain",
        width: 140,
        height: 140,
        strokeWidth: 0,
      },
      interactivePreview: () => (
        <div className="flex items-center justify-center py-3">
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border/80 bg-card p-2 shadow-md w-36 h-36">
            <div className="flex-1 w-full flex items-center justify-center p-2 bg-muted/20 rounded-xl overflow-hidden">
              <ImageIcon className="size-12 text-primary/70" />
            </div>
            <span className="text-[11px] font-bold text-foreground mt-1">Diagrama.png</span>
          </div>
        </div>
      ),
    },

    // 5. DISPOSITIVOS DE RED
    {
      id: "comp-network",
      name: "Nodos de redes y computación",
      category: "network",
      icon: Laptop,
      summary: "Hosts (PC), Switches L2, Routers L3, Servidores y Nubes",
      description:
        "Iconografía vectorial optimizada para topologías de red, protocolos de telecomunicaciones y arquitecturas cliente-servidor.",
      properties: [
        { name: "props.networkType", type: "'pc' | 'switch' | 'router' | 'server' | 'cloud'", defaultValue: "'pc'", description: "Tipo de dispositivo de red" },
        { name: "props.ip", type: "string", defaultValue: "''", description: "Dirección IP o etiqueta de subred" },
        { name: "label", type: "string", defaultValue: "'Host'", description: "Nombre del dispositivo" },
      ],
      jsonSnippet: {
        id: "node-router-1",
        type: "network",
        label: "Gateway R1",
        props: { networkType: "router", ip: "192.168.1.1" },
        width: 100,
        height: 100,
      },
      interactivePreview: () => (
        <div className="flex items-center justify-center gap-3 py-3">
          <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-2 w-20 h-20 shadow-sm">
            <Laptop className="size-6 text-blue-500 mb-1" />
            <span className="text-[10px] font-bold text-foreground">PC 1</span>
          </div>
          <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-2 w-20 h-20 shadow-sm">
            <Network className="size-6 text-emerald-500 mb-1" />
            <span className="text-[10px] font-bold text-foreground">SW 1</span>
          </div>
          <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-2 w-20 h-20 shadow-sm">
            <Shield className="size-6 text-amber-500 mb-1" />
            <span className="text-[10px] font-bold text-foreground">Router</span>
          </div>
          <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-2 w-20 h-20 shadow-sm">
            <Server className="size-6 text-purple-500 mb-1" />
            <span className="text-[10px] font-bold text-foreground">Server</span>
          </div>
        </div>
      ),
    },

    // 6. CONTENEDOR / GRUPO
    {
      id: "comp-container",
      name: "Contenedores / grupos de subsistema",
      category: "container",
      icon: Box,
      summary: "Cajas agrupadoras translúcidas y no bloqueantes",
      description:
        "Se renderizan en una capa inferior dedicada (<g id='containers-layer'>) con eventos no bloqueantes para no tapar los elementos internos.",
      properties: [
        { name: "label", type: "string", defaultValue: "'Grupo'", description: "Etiqueta superior del subsistema" },
        { name: "fill", type: "string", defaultValue: "'transparent'", description: "Relleno translúcido suave" },
        { name: "stroke", type: "string", defaultValue: "'var(--border)'", description: "Borde perimetral discontinuo" },
        { name: "width / height", type: "number (px)", defaultValue: "320 x 200", description: "Dimensiones de la zona agrupada" },
      ],
      jsonSnippet: {
        id: "cont-lan-1",
        type: "container",
        label: "Subred LAN 10.0.0.0/24",
        width: 340,
        height: 220,
        fill: "transparent",
        stroke: "#64748B",
        strokeWidth: 1.5,
      },
      interactivePreview: () => (
        <div className="flex items-center justify-center py-3">
          <div className="w-64 h-28 rounded-2xl border-2 border-dashed border-muted-foreground/40 bg-muted/10 p-2.5 flex flex-col justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
              Subred LAN 192.168.1.0/24
            </span>
            <div className="flex items-center justify-center gap-2">
              <div className="h-8 w-14 rounded-lg bg-card border border-border flex items-center justify-center text-[9px] font-bold">Node A</div>
              <div className="h-8 w-14 rounded-lg bg-card border border-border flex items-center justify-center text-[9px] font-bold">Node B</div>
            </div>
          </div>
        </div>
      ),
    },

    // 7. CONECTORES & FLECHAS
    {
      id: "comp-connector",
      name: "Conectores, curvas Bézier y flechas",
      category: "connector",
      icon: Spline,
      summary: "Líneas Bézier, rectas u ortogonales con etiquetas arrastrables",
      description:
        "Vínculos magnéticos entre nodos con dirección de flecha customizable, grosor decimal, color con alpha y etiquetas arrastrables con DnD en tiempo real.",
      properties: [
        { name: "type", type: "'bezier' | 'straight' | 'orthogonal'", defaultValue: "'bezier'", description: "Geometría y suavizado de la curva" },
        { name: "directed", type: "'none' | 'forward' | 'backward' | 'bidirectional'", defaultValue: "'forward'", description: "Puntas de flecha" },
        { name: "dashed", type: "boolean", defaultValue: "false", description: "Línea continua o discontinua animada" },
        { name: "label", type: "string (opcional)", defaultValue: "''", description: "Texto o nombre del enlace" },
        { name: "labelPosition", type: "number (0.08 a 0.92)", defaultValue: "0.5", description: "Posición paramétrica a lo largo de la curva" },
        { name: "strokeWidth", type: "number", defaultValue: "2", description: "Grosor del trazado" },
      ],
      jsonSnippet: {
        id: "conn-req-1",
        sourceId: "node-client",
        targetId: "node-server",
        type: "bezier",
        directed: "forward",
        label: "Petición HTTP",
        labelPosition: 0.5,
        color: "#0070F3",
        strokeWidth: 2,
      },
      interactivePreview: () => (
        <div className="flex items-center justify-center py-4">
          <svg viewBox="0 0 280 80" className="w-72 h-20 overflow-visible">
            <defs>
              <marker id="demo-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#0070F3" />
              </marker>
            </defs>
            <path d="M 30,40 C 90,0 190,80 250,40" fill="none" stroke="#0070F3" strokeWidth="2.5" markerEnd="url(#demo-arrow)" />
            <circle cx="30" cy="40" r="16" fill="var(--card)" stroke="#0070F3" strokeWidth="2" />
            <text x="30" y="44" fill="currentColor" fontSize="9" fontWeight="bold" textAnchor="middle">Src</text>
            <circle cx="250" cy="40" r="16" fill="var(--card)" stroke="#0070F3" strokeWidth="2" />
            <text x="250" y="44" fill="currentColor" fontSize="9" fontWeight="bold" textAnchor="middle">Dst</text>
            <g transform="translate(140, 40)">
              <rect x="-30" y="-10" width="60" height="18" rx="4" fill="var(--card)" stroke="#94A3B8" strokeWidth="1" />
              <text y="2" fill="currentColor" fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="middle">Flujo</text>
            </g>
          </svg>
        </div>
      ),
    },
  ]

  const filteredComponents = selectedCategory === "all"
    ? COMPONENTS
    : COMPONENTS.filter((c) => c.category === selectedCategory)

  return (
    <div className="space-y-8">
      {/* ── Category Filter Pills ─────────────────────────────────── */}
      <div className="flex flex-wrap gap-1.5 border-b border-border pb-3">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            selectedCategory === "all"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-card border border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          Todos los componentes ({COMPONENTS.length})
        </button>
        <button
          onClick={() => setSelectedCategory("geometry")}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            selectedCategory === "geometry"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-card border border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          Formas
        </button>
        <button
          onClick={() => setSelectedCategory("math")}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            selectedCategory === "math"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-card border border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          KaTeX
        </button>
        <button
          onClick={() => setSelectedCategory("text")}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            selectedCategory === "text"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-card border border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          Texto markdown
        </button>
        <button
          onClick={() => setSelectedCategory("image")}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            selectedCategory === "image"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-card border border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          Imágenes
        </button>
        <button
          onClick={() => setSelectedCategory("network")}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            selectedCategory === "network"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-card border border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          Redes
        </button>
        <button
          onClick={() => setSelectedCategory("container")}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            selectedCategory === "container"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-card border border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          Contenedores
        </button>
        <button
          onClick={() => setSelectedCategory("connector")}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            selectedCategory === "connector"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-card border border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          Conectores & flechas
        </button>
      </div>

      {/* ── Component Cards Grid ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredComponents.map((comp) => {
          const Icon = comp.icon
          const isCopied = copiedId === comp.id
          const isJsonOpen = activeJsonId === comp.id

          return (
            <div
              key={comp.id}
              className="flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card shadow-lg transition-all hover:border-primary/50"
            >
              {/* Header */}
              <div className="border-b border-border/60 bg-muted/30 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-foreground">{comp.name}</h3>
                    <p className="text-[10px] text-muted-foreground">{comp.summary}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setActiveJsonId(isJsonOpen ? null : comp.id)}
                    className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                      isJsonOpen ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
                    }`}
                    title="Ver JSON"
                  >
                    <Code2 className="size-3" />
                    <span>{isJsonOpen ? "Vista" : "JSON"}</span>
                  </button>
                  <button
                    onClick={() => handleCopy(comp.id, comp.jsonSnippet)}
                    className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer"
                    title="Copiar JSON"
                  >
                    {isCopied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                  </button>
                </div>
              </div>

              {/* Visual Preview or Code Screen */}
              <div className="relative border-b border-border/40 bg-slate-950/20 dark:bg-slate-950/50 min-h-[140px] flex items-center justify-center p-4">
                {isJsonOpen ? (
                  <pre className="w-full font-mono text-[10px] text-primary-foreground/90 overflow-x-auto p-2 bg-muted/40 rounded-lg">
                    {JSON.stringify(comp.jsonSnippet, null, 2)}
                  </pre>
                ) : (
                  comp.interactivePreview("dark")
                )}
              </div>

              {/* Properties Table */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <p className="text-xs text-foreground font-medium leading-relaxed">
                  {comp.description}
                </p>

                <div className="space-y-1.5">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Propiedades de configuración
                  </h4>
                  <div className="overflow-x-auto rounded-xl border border-border/60">
                    <table className="w-full text-left text-[10px]">
                      <thead className="bg-muted/40 border-b border-border/40 text-muted-foreground font-semibold">
                        <tr>
                          <th className="py-1 px-2">Propiedad</th>
                          <th className="py-1 px-2">Tipo</th>
                          <th className="py-1 px-2">Default</th>
                          <th className="py-1 px-2">Detalle</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30">
                        {comp.properties.map((prop, idx) => (
                          <tr key={idx} className="hover:bg-muted/20">
                            <td className="py-1 px-2 font-mono font-bold text-primary">{prop.name}</td>
                            <td className="py-1 px-2 font-mono text-muted-foreground">{prop.type}</td>
                            <td className="py-1 px-2 font-mono text-emerald-600 dark:text-emerald-400">{prop.defaultValue}</td>
                            <td className="py-1 px-2 text-foreground">{prop.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
