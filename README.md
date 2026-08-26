# Learning Animations

Motor interactivo de visualización y animación de protocolos y conceptos de red.

Proyecto desacoplado para desarrollo autónomo, pruebas y distribución embebible mediante iframe hacia plataformas educativas como **aula-it**.

---

## 🚀 Tecnologías

- **Next.js 16** (App Router) + **React 19**
- **TypeScript 5.9** (Modo estricto)
- **Tailwind CSS v4** + **next-themes** (Soporte Dark / Light mode)
- **GSAP 3.14** (Lógica de animación procedural y timelines de paquetes/tramas)
- **Framer Motion 12** (Transiciones e interfaz reactiva del reproductor)
- **Supabase** (`@supabase/supabase-js`, `@supabase/ssr` para futura persistencia)
- **DND-Kit** (Preparado para el builder visual de animaciones)
- **Vitest 4** (Tests unitarios de catálogo, velocidad e integridad de pasos)

---

## 📂 Estructura del Proyecto

```
learning-animations/
├── app/
│   ├── layout.tsx                # ThemeProvider y estilos globales
│   ├── page.tsx                  # Catálogo interactivo de animaciones
│   ├── animations/
│   │   └── [slug]/page.tsx       # Vista interactiva individual (standalone)
│   └── embed/
│       └── [slug]/page.tsx       # Vista limpia para embeber en <iframe>
├── components/
│   ├── animations/               # 24 componentes interactivos de red + Player
│   │   ├── animation-player.tsx
│   │   ├── animation-component-map.ts
│   │   ├── network-device-icons.tsx
│   │   ├── network-visual-primitives.tsx
│   │   ├── node-info-card.tsx
│   │   └── ... (arp, tcp, udp, dns, etc.)
│   └── ui/                       # Componentes base (Button, etc.)
├── lib/
│   └── animations/
│       ├── playback.ts           # Control de velocidad y constantes de reproducción
│       └── registry.ts           # Catálogo centralizado de pasos y metadatos
├── types/
│   └── animations.ts             # Definición de tipos AnimationStep y AnimationMeta
├── docs/
│   └── animaciones/              # Guías completas de creación y estilo
└── __tests__/
    └── lib/                      # Suite de pruebas unitarias
```

---

## 🛠️ Instalación y Uso

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo en puerto 3001
npm run dev

# 3. Ejecutar pruebas unitarias
npm test

# 4. Compilar para producción
npm run build
```

---

## 🌐 Integración Embebida (iFrame)

Para integrar cualquier animación en otra plataforma educativa (como `aula-it`):

```html
<iframe
  src="http://localhost:3001/embed/arp"
  width="100%"
  height="600"
  allow="fullscreen"
  style="border: none; border-radius: 8px;"
  title="Animación ARP"
></iframe>
```

---

## 📖 Cómo Crear Nuevas Animaciones

Consulta la documentación detallada en:
- `docs/animaciones/COMO-CREAR-ANIMACIONES.md`
- `docs/animation-style-guide.md`
