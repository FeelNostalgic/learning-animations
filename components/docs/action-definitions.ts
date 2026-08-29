import gsap from "gsap"
import type { ActionDefinition } from "./action-loop-card"

export const ACTION_DEFINITIONS: ActionDefinition[] = [
  // 1. HIGHLIGHT
  {
    type: "highlight",
    title: "Highlight (Resaltado)",
    subtitle: "Enfoca la atención visual cambiando color y contorno",
    description:
      "Modifica de forma suave el color del borde, el relleno o el contorno de un nodo para destacar el elemento que está procesando información en el paso actual.",
    whenToUse:
      "Úsalo cuando un dispositivo recibe un paquete, cuando se evalúa una condición lógica en un rombo o para guiar al estudiante sobre qué nodo está activo.",
    jsonExample: {
      id: "act-highlight-1",
      type: "highlight",
      targetId: "node-server",
      color: "active",
      duration: 0.8,
    },
    setupScene: (svg, uid, theme) => {
      const fg = theme === "light" ? "#0F172A" : "#F8FAFC"
      const idleBorder = theme === "light" ? "#CBD5E1" : "#334155"
      const activeColor = "#0070F3"
      const nodeFill = theme === "light" ? "#FFFFFF" : "#1E293B"

      svg.innerHTML = `
        <g transform="translate(200, 110)">
          <!-- Glowing Aura -->
          <circle id="${uid}-aura" r="46" fill="${activeColor}" opacity="0" />
          <!-- Main Node -->
          <circle id="${uid}-node" r="38" fill="${nodeFill}" stroke="${idleBorder}" stroke-width="2.5" />
          <text y="4" fill="${fg}" font-size="12" font-weight="bold" font-family="sans-serif" text-anchor="middle">Server</text>
        </g>
      `

      const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.8 })
      tl.to(`#${uid}-node`, {
        stroke: activeColor,
        strokeWidth: 4,
        scale: 1.08,
        duration: 0.6,
        ease: "power2.out",
      })
        .to(
          `#${uid}-aura`,
          {
            opacity: 0.25,
            scale: 1.25,
            duration: 0.6,
            ease: "power2.out",
          },
          "<"
        )
        .to(`#${uid}-node`, {
          scale: 1,
          duration: 0.4,
          ease: "power2.inOut",
        })
        .to(
          `#${uid}-node`,
          {
            stroke: idleBorder,
            strokeWidth: 2.5,
            duration: 0.6,
            ease: "power2.inOut",
          },
          "+=0.8"
        )
        .to(
          `#${uid}-aura`,
          {
            opacity: 0,
            scale: 1,
            duration: 0.6,
            ease: "power2.inOut",
          },
          "<"
        )

      return { timeline: tl }
    },
  },

  // 2. PULSE
  {
    type: "pulse",
    title: "Pulse (Pulso Radial)",
    subtitle: "Emite ondas expansivas de señal o evento",
    description:
      "Genera anillos concéntricos que se expanden y desvanecen desde el centro del nodo, simulando emisión de señal WiFi, latido o transmisión.",
    whenToUse:
      "Ideal para representar eventos de broadcast, emisión de radio/antena, sincronización de relojes o activación de un proceso de red.",
    jsonExample: {
      id: "act-pulse-1",
      type: "pulse",
      targetId: "node-router",
      color: "#10B981",
      duration: 1.2,
    },
    setupScene: (svg, uid, theme) => {
      const fg = theme === "light" ? "#0F172A" : "#F8FAFC"
      const idleBorder = theme === "light" ? "#CBD5E1" : "#334155"
      const pulseColor = "#10B981"
      const nodeFill = theme === "light" ? "#FFFFFF" : "#1E293B"

      svg.innerHTML = `
        <g transform="translate(200, 110)">
          <!-- Pulse Rings -->
          <circle id="${uid}-ring1" r="36" fill="none" stroke="${pulseColor}" stroke-width="2.5" opacity="0" />
          <circle id="${uid}-ring2" r="36" fill="none" stroke="${pulseColor}" stroke-width="2" opacity="0" />
          <!-- Central Node -->
          <circle id="${uid}-node" r="36" fill="${nodeFill}" stroke="${idleBorder}" stroke-width="2" />
          <text y="4" fill="${fg}" font-size="12" font-weight="bold" font-family="sans-serif" text-anchor="middle">Router</text>
        </g>
      `

      const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.6 })
      tl.set([`#${uid}-ring1`, `#${uid}-ring2`], { scale: 1, opacity: 0.9 })
        .to(`#${uid}-node`, {
          scale: 1.06,
          duration: 0.2,
          yoyo: true,
          repeat: 1,
          ease: "power2.out",
        })
        .to(
          `#${uid}-ring1`,
          {
            scale: 2.2,
            opacity: 0,
            duration: 1.2,
            ease: "power2.out",
          },
          0
        )
        .to(
          `#${uid}-ring2`,
          {
            scale: 2.6,
            opacity: 0,
            duration: 1.4,
            ease: "power2.out",
          },
          0.2
        )

      return { timeline: tl }
    },
  },

  // 3. PACKET ALONG PATH
  {
    type: "packet",
    title: "Packet along Path (Envío de Paquete)",
    subtitle: "Movimiento continuo siguiendo curvas Bézier",
    description:
      "Transporta partículas o paquetes de datos a lo largo de conectores rectos o curvos paramétricos, con estela brillante y etiqueta de carga útil.",
    whenToUse:
      "Imprescindible para ilustrar flujos de mensajes cliente-servidor (HTTP Request/Response, handshake TCP, consultas DNS, paquetes ARP).",
    jsonExample: {
      id: "act-packet-1",
      type: "packet",
      sourceId: "node-client",
      targetId: "node-server",
      text: "GET /api",
      color: "#F59E0B",
      duration: 1.6,
    },
    setupScene: (svg, uid, theme) => {
      const fg = theme === "light" ? "#0F172A" : "#F8FAFC"
      const idleBorder = theme === "light" ? "#CBD5E1" : "#334155"
      const packetColor = "#F59E0B"
      const pathColor = theme === "light" ? "#94A3B8" : "#475569"
      const nodeFill = theme === "light" ? "#FFFFFF" : "#1E293B"

      svg.innerHTML = `
        <!-- Connector Curved Path -->
        <path id="${uid}-path" d="M 80,110 C 140,40 260,180 320,110" fill="none" stroke="${pathColor}" stroke-width="2" stroke-dasharray="4 4" />
        
        <!-- Source Node -->
        <g transform="translate(80, 110)">
          <circle r="30" fill="${nodeFill}" stroke="${idleBorder}" stroke-width="2" />
          <text y="4" fill="${fg}" font-size="11" font-weight="bold" font-family="sans-serif" text-anchor="middle">Client</text>
        </g>

        <!-- Target Node -->
        <g transform="translate(320, 110)">
          <circle r="30" fill="${nodeFill}" stroke="${idleBorder}" stroke-width="2" />
          <text y="4" fill="${fg}" font-size="11" font-weight="bold" font-family="sans-serif" text-anchor="middle">Server</text>
        </g>

        <!-- Traveling Packet -->
        <g id="${uid}-packet" opacity="0">
          <circle r="14" fill="${packetColor}" stroke="${fg}" stroke-width="1.5" />
          <text y="3.5" fill="#111827" font-size="8" font-family="monospace" font-weight="bold" text-anchor="middle">DATA</text>
        </g>
      `

      // 20 Bézier sampling waypoints for M 80,110 C 140,40 260,180 320,110
      const p0 = { x: 80, y: 110 }
      const p1 = { x: 140, y: 40 }
      const p2 = { x: 260, y: 180 }
      const p3 = { x: 320, y: 110 }

      const waypoints: { x: number; y: number }[] = []
      for (let i = 0; i <= 20; i++) {
        const t = i / 20
        const inv = 1 - t
        const x = inv * inv * inv * p0.x + 3 * inv * inv * t * p1.x + 3 * inv * t * t * p2.x + t * t * t * p3.x
        const y = inv * inv * inv * p0.y + 3 * inv * inv * t * p1.y + 3 * inv * t * t * p2.y + t * t * t * p3.y
        waypoints.push({ x: +x.toFixed(2), y: +y.toFixed(2) })
      }

      const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.6 })
      tl.set(`#${uid}-packet`, {
        x: waypoints[0].x,
        y: waypoints[0].y,
        opacity: 0,
        scale: 0.5,
      })
        .to(`#${uid}-packet`, {
          opacity: 1,
          scale: 1,
          duration: 0.2,
          ease: "power2.out",
        })
        .to(`#${uid}-packet`, {
          keyframes: waypoints.map((pt) => ({ x: pt.x, y: pt.y })),
          duration: 1.4,
          ease: "power1.inOut",
        })
        .to(`#${uid}-packet`, {
          opacity: 0,
          scale: 0.6,
          duration: 0.2,
          ease: "power2.in",
        })

      return { timeline: tl }
    },
  },

  // 4. TRANSFORM
  {
    type: "transform",
    title: "Transform (Transformación & Movimiento)",
    subtitle: "Traslación, escalado y rotación suave",
    description:
      "Aplica cambios de posición $(x, y)$, escala o ángulo de rotación a uno o múltiples nodos con interpolación natural basada en física.",
    whenToUse:
      "Ideal para reorganizar diagramas en tiempo de ejecución, expandir componentes para mostrar submódulos o girar elementos direccionales.",
    jsonExample: {
      id: "act-transform-1",
      type: "transform",
      targetId: "node-box",
      x: 280,
      y: 110,
      scale: 1.2,
      rotation: 45,
      duration: 1.2,
    },
    setupScene: (svg, uid, theme) => {
      const fg = theme === "light" ? "#0F172A" : "#F8FAFC"
      const idleBorder = "#8B5CF6"
      const nodeFill = theme === "light" ? "#FFFFFF" : "#1E293B"

      svg.innerHTML = `
        <g id="${uid}-target" transform="translate(130, 110)">
          <rect x="-40" y="-30" width="80" height="60" rx="10" fill="${nodeFill}" stroke="${idleBorder}" stroke-width="2.5" />
          <text y="4" fill="${fg}" font-size="11" font-weight="bold" font-family="sans-serif" text-anchor="middle">Objeto</text>
        </g>
      `

      const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.8 })
      tl.to(`#${uid}-target`, {
        x: 270,
        scale: 1.25,
        rotation: 45,
        duration: 1.2,
        ease: "back.out(1.5)",
      }).to(`#${uid}-target`, {
        x: 130,
        scale: 1,
        rotation: 0,
        duration: 1.0,
        ease: "power2.inOut",
        delay: 0.5,
      })

      return { timeline: tl }
    },
  },

  // 5. FADE
  {
    type: "fade",
    title: "Fade (Aparición / Desvanecimiento)",
    subtitle: "Control suave de visibilidad y opacidad",
    description:
      "Transiciona la opacidad de 0 a 1 o viceversa, permitiendo que elementos del diagrama aparezcan cuando son relevantes o se atenúen cuando pasan a segundo plano.",
    whenToUse:
      "Excelente para introducir nuevos conceptos paso a paso sin sobrecargar el diagrama inicialmente o para ocultar capas secundarias.",
    jsonExample: {
      id: "act-fade-1",
      type: "fade",
      targetId: "node-extra",
      opacity: 1,
      duration: 0.8,
    },
    setupScene: (svg, uid, theme) => {
      const fg = theme === "light" ? "#0F172A" : "#F8FAFC"
      const idleBorder = "#EC4899"
      const nodeFill = theme === "light" ? "#FFFFFF" : "#1E293B"

      svg.innerHTML = `
        <g id="${uid}-node" transform="translate(200, 110)" opacity="0">
          <rect x="-60" y="-35" width="120" height="70" rx="14" fill="${nodeFill}" stroke="${idleBorder}" stroke-width="2.5" />
          <text y="-6" fill="${fg}" font-size="11" font-weight="bold" font-family="sans-serif" text-anchor="middle">Módulo</text>
          <text y="14" fill="#EC4899" font-size="9" font-family="monospace" text-anchor="middle">opacity: 1.0</text>
        </g>
      `

      const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.8 })
      tl.to(`#${uid}-node`, {
        opacity: 1,
        scale: 1,
        duration: 0.8,
        ease: "power2.out",
      })
        .to(
          `#${uid}-node`,
          {
            opacity: 0.15,
            duration: 0.8,
            ease: "power2.inOut",
          },
          "+=1.0"
        )
        .to(`#${uid}-node`, {
          opacity: 0,
          duration: 0.4,
          ease: "power2.in",
        })

      return { timeline: tl }
    },
  },

  // 6. PATH DRAW
  {
    type: "path_draw",
    title: "Path Draw (Trazado Progresivo)",
    subtitle: "Dibuja líneas y curvas como con pluma digital",
    description:
      "Anima el atributo strokeDashoffset para dibujar progresivamente conexiones, vectores o gráficas de funciones matemáticas en tiempo real.",
    whenToUse:
      "Ideal para mostrar el establecimiento de una conexión nueva (enlace físico, túnel VPN) o el trazo de una gráfica cartesiana.",
    jsonExample: {
      id: "act-draw-1",
      type: "path_draw",
      targetId: "conn-vpn",
      duration: 1.4,
    },
    setupScene: (svg, uid, theme) => {
      const fg = theme === "light" ? "#0F172A" : "#F8FAFC"
      const idleBorder = theme === "light" ? "#CBD5E1" : "#334155"
      const drawColor = "#06B6D4"
      const nodeFill = theme === "light" ? "#FFFFFF" : "#1E293B"

      svg.innerHTML = `
        <g transform="translate(80, 110)">
          <circle r="28" fill="${nodeFill}" stroke="${idleBorder}" stroke-width="2" />
          <text y="4" fill="${fg}" font-size="10" font-weight="bold" font-family="sans-serif" text-anchor="middle">A</text>
        </g>

        <path id="${uid}-stroke" d="M 108,110 C 170,30 230,190 292,110" fill="none" stroke="${drawColor}" stroke-width="3" stroke-linecap="round" />

        <g transform="translate(320, 110)">
          <circle r="28" fill="${nodeFill}" stroke="${idleBorder}" stroke-width="2" />
          <text y="4" fill="${fg}" font-size="10" font-weight="bold" font-family="sans-serif" text-anchor="middle">B</text>
        </g>
      `

      const pathEl = svg.querySelector(`#${uid}-stroke`) as SVGPathElement
      const len = pathEl ? pathEl.getTotalLength() || 280 : 280

      gsap.set(pathEl, {
        strokeDasharray: len,
        strokeDashoffset: len,
      })

      const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.8 })
      tl.to(pathEl, {
        strokeDashoffset: 0,
        duration: 1.4,
        ease: "power2.inOut",
      }).to(pathEl, {
        strokeDashoffset: -len,
        duration: 1.0,
        ease: "power2.in",
        delay: 0.8,
      })

      return { timeline: tl }
    },
  },

  // 7. BADGE
  {
    type: "badge",
    title: "Badge (Insignia de Estado)",
    subtitle: "Pops flotantes de estado OK, FAIL o métricas",
    description:
      "Hace brotar con rebote elástico una insignia de estado o indicador sobre el nodo (por ejemplo: 'ACK', '200 OK', 'DROP', 'SYN-SENT').",
    whenToUse:
      "Para confirmar recepciones exitosas, caídas de paquetes, resultados de evaluación matemática o cambios de estado de protocolo.",
    jsonExample: {
      id: "act-badge-1",
      type: "badge",
      targetId: "node-pc1",
      text: "200 OK",
      color: "success",
      duration: 0.6,
    },
    setupScene: (svg, uid, theme) => {
      const fg = theme === "light" ? "#0F172A" : "#F8FAFC"
      const idleBorder = theme === "light" ? "#CBD5E1" : "#334155"
      const nodeFill = theme === "light" ? "#FFFFFF" : "#1E293B"

      svg.innerHTML = `
        <g transform="translate(200, 120)">
          <!-- Node -->
          <circle r="36" fill="${nodeFill}" stroke="${idleBorder}" stroke-width="2" />
          <text y="4" fill="${fg}" font-size="12" font-weight="bold" font-family="sans-serif" text-anchor="middle">Host</text>

          <!-- Badge -->
          <g id="${uid}-badge" transform="translate(0, -42)" opacity="0">
            <rect x="-35" y="-12" width="70" height="24" rx="12" fill="#059669" stroke="#10B981" stroke-width="1.5" />
            <text y="4" fill="#FFFFFF" font-size="10" font-family="monospace" font-weight="bold" text-anchor="middle">✓ 200 OK</text>
          </g>
        </g>
      `

      const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.8 })
      tl.set(`#${uid}-badge`, { scale: 0, opacity: 0 })
        .to(`#${uid}-badge`, {
          scale: 1.1,
          opacity: 1,
          duration: 0.4,
          ease: "back.out(2)",
        })
        .to(`#${uid}-badge`, {
          scale: 1,
          duration: 0.2,
          ease: "power2.inOut",
        })
        .to(
          `#${uid}-badge`,
          {
            scale: 0,
            opacity: 0,
            duration: 0.3,
            ease: "back.in(1.5)",
          },
          "+=1.2"
        )

      return { timeline: tl }
    },
  },

  // 8. TOOLTIP
  {
    type: "tooltip",
    title: "Tooltip (Bocadillo de Información)",
    subtitle: "Explicación contextual flotante con Markdown",
    description:
      "Despliega una tarjeta emergente conectada al nodo para brindar explicaciones pedagógicas detalladas sin saturar permanentemente el lienzo.",
    whenToUse:
      "Para glosarios de términos, pistas en pasos interactivos o aclaraciones técnicas secundarias.",
    jsonExample: {
      id: "act-tooltip-1",
      type: "tooltip",
      targetId: "node-calc",
      text: "La derivada f'(x) representa la pendiente de la recta tangente.",
      duration: 0.8,
    },
    setupScene: (svg, uid, theme) => {
      const fg = theme === "light" ? "#0F172A" : "#F8FAFC"
      const idleBorder = theme === "light" ? "#CBD5E1" : "#334155"
      const tooltipBg = theme === "light" ? "#0F172A" : "#1E293B"
      const tooltipText = theme === "light" ? "#F8FAFC" : "#E2E8F0"
      const nodeFill = theme === "light" ? "#FFFFFF" : "#1E293B"

      svg.innerHTML = `
        <g transform="translate(200, 140)">
          <!-- Main Node -->
          <circle r="32" fill="${nodeFill}" stroke="${idleBorder}" stroke-width="2" />
          <text y="4" fill="${fg}" font-size="11" font-weight="bold" font-family="sans-serif" text-anchor="middle">f'(x)</text>

          <!-- Floating Tooltip Bubble -->
          <g id="${uid}-tooltip" transform="translate(0, -65)" opacity="0">
            <rect x="-90" y="-22" width="180" height="44" rx="8" fill="${tooltipBg}" stroke="#0070F3" stroke-width="1.5" />
            <polygon points="-6,22 6,22 0,28" fill="${tooltipBg}" />
            <text y="-4" fill="${tooltipText}" font-size="10" font-weight="bold" font-family="sans-serif" text-anchor="middle">Pendiente Tangente</text>
            <text y="10" fill="#38BDF8" font-size="8.5" font-family="monospace" text-anchor="middle">m = lim_{h->0} [f(x+h)-f(x)]/h</text>
          </g>
        </g>
      `

      const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.8 })
      tl.set(`#${uid}-tooltip`, { y: -45, opacity: 0, scale: 0.85 })
        .to(`#${uid}-tooltip`, {
          y: -65,
          opacity: 1,
          scale: 1,
          duration: 0.5,
          ease: "power2.out",
        })
        .to(
          `#${uid}-tooltip`,
          {
            y: -50,
            opacity: 0,
            scale: 0.9,
            duration: 0.4,
            ease: "power2.in",
          },
          "+=1.5"
        )

      return { timeline: tl }
    },
  },

  // 9. MATH EVAL
  {
    type: "math_eval",
    title: "Math Eval (Evaluación KaTeX)",
    subtitle: "Sustitución y resolución algebraica paso a paso",
    description:
      "Transforma y resuelve expresiones matemáticas paso a paso mostrando la sustitución de incógnitas por sus valores numéricos calculados.",
    whenToUse:
      "Esencial para demostraciones de cálculo, álgebra, física, leyes de Ohm o cálculo de tiempos de propagación en redes.",
    jsonExample: {
      id: "act-eval-1",
      type: "math_eval",
      targetId: "node-formula",
      formula: "f(2) = 2^2 - 4(2) + 4 = 0",
      duration: 1.0,
    },
    setupScene: (svg, uid, theme) => {
      const fg = theme === "light" ? "#0F172A" : "#F8FAFC"
      const idleBorder = "#3B82F6"
      const nodeFill = theme === "light" ? "#FFFFFF" : "#1E293B"

      svg.innerHTML = `
        <g transform="translate(200, 110)">
          <!-- Node Container -->
          <rect x="-120" y="-36" width="240" height="72" rx="14" fill="${nodeFill}" stroke="${idleBorder}" stroke-width="2" />
          
          <!-- Step 1 Text -->
          <g id="${uid}-t1">
            <text y="-6" fill="${fg}" font-size="11" font-weight="bold" font-family="sans-serif" text-anchor="middle">f(x) = x² - 4x + 4</text>
            <text y="14" fill="#64748B" font-size="10" font-family="monospace" text-anchor="middle">Sustituyendo x = 2...</text>
          </g>

          <!-- Step 2 Text -->
          <g id="${uid}-t2" opacity="0">
            <text y="-6" fill="#3B82F6" font-size="11" font-weight="bold" font-family="sans-serif" text-anchor="middle">f(2) = (2)² - 4(2) + 4</text>
            <text y="14" fill="#10B981" font-size="11" font-weight="bold" font-family="monospace" text-anchor="middle">Resultado: f(2) = 0 ✓</text>
          </g>
        </g>
      `

      const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.8 })
      tl.to(`#${uid}-t1`, {
        opacity: 0,
        y: -10,
        duration: 0.4,
        ease: "power2.in",
        delay: 0.8,
      })
        .set(`#${uid}-t2`, { y: 10, opacity: 0 })
        .to(`#${uid}-t2`, {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "power2.out",
        })
        .to(
          `#${uid}-t2`,
          {
            opacity: 0,
            duration: 0.3,
            ease: "power2.in",
          },
          "+=1.4"
        )
        .to(`#${uid}-t1`, {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: "power2.out",
        })

      return { timeline: tl }
    },
  },
]
