# Learning Animations

[![CI](https://github.com/FeelNostalgic/learning-animations/actions/workflows/ci.yml/badge.svg)](https://github.com/FeelNostalgic/learning-animations/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-000000?logo=next.js)](https://nextjs.org)
[![React 19](https://img.shields.io/badge/React-19-087ea4?logo=react)](https://react.dev)
[![pnpm 11](https://img.shields.io/badge/pnpm-11-F69220?logo=pnpm)](https://pnpm.io)
[![Node 22](https://img.shields.io/badge/Node-22-5FA04E?logo=node.js)](https://nodejs.org)

Motor interactivo de visualización y animación de protocolos y conceptos de red.

Cada animación es una escena animada y reproducible —paquete a paquete, trama a
trama— que explica paso a paso cómo funciona un protocolo: quién envía qué,
en qué orden, y por qué.

**26 animaciones** de protocolos de red · **Builder visual sin código** ·
Cuentas de usuario y animaciones comunitarias · **Embeber por iframe** en
cualquier plataforma educativa.

---

## ⚠️ Aviso sobre la licencia

Este repositorio usa **MIT para su propio código**, pero **no es un proyecto
100% open source**: la dependencia [`gsap`](https://gsap.com/standard-license) se
rige por la **GSAP Standard "No Charge" License** (© 2025 Webflow), que no es una
licencia OSI.

La licencia MIT **no** cubre GSAP ni el material de terceros en `.agents/`. El
detalle completo —incluida una cláusula de la licencia de GSAP que afecta
directamente al builder visual de este proyecto— está en
**[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)**. Léelo antes de construir
producto sobre este código.

---

## Qué es

Una aplicación Next.js que convierte protocolos de red —que en un libro son
párrafos y diagramas estáticos— en animaciones interactivas y secuenciadas.

Dos modos de uso:

1. **Consumo**: navega el catálogo y reproduction las 26 animaciones oficiales.
2. **Creación**: construye las tuyas en un editor visual, publícalas, compártelas
   o clona las de otros.

Cualquier animación se puede embeber en otra web con un `<iframe>`.

---

## Funcionalidades

### Animaciones

- **26 animaciones oficiales** con reproducción paso a paso (pausa, avanzar,
  retroceder, velocidad 0.25×–4×).
- Motor procedural en **GSAP**: las líneas de tiempo se compilan desde
  datos, no están codificadas a mano.
- Interactividad opcional por nodo: hover, sliders, toggles que cambian el
  estado de la escena en tiempo real.
- Renderizado de texto y fórmulas con **KaTeX**, Markdown con `remark-math`.
- Temas claro y oscuro.

### Builder visual

- Lienzo React Flow con nodos, conectores y pan/zoom persistente.
- Inspector de propiedades, de aristas, de pasos y de fondo.
- Línea de tiempo con **autosave** y recuperación de borradores.
- Compilación de un esquema universal a una línea de tiempo GSAP
  (`lib/animations/universal-compiler.ts`).
- Assets de imagen vía **Cloudflare R2**.

### Cuentas y comunidad

- Registro, login, recuperación de contraseña y username único vía **Supabase Auth**.
- Panel personal (`/my-animations`) con buscar, filtrar, publicar a privado o
  público, **clonar/forkear** y eliminar.
- Catálogo público con animaciones de la comunidad.
- Row-Level Security en 7 políticas sobre `profiles` y `animations`.

### Distribución

- Vista `/embed/[slug]` sin chrome, pensada para `<iframe>`.
- Diálogo de embed con el código listo para copiar.
- Página de showcase.

---

## Stack

| Capa | Tecnología |
| --- | --- |
| Framework | Next.js 16 (App Router), React 19.2 |
| Lenguaje | TypeScript 5.9 en modo estricto |
| Estilos | Tailwind CSS v4, `next-themes`, Radix UI |
| Animación | GSAP 3.15, Framer Motion 12 |
| Grafo | React Flow (`@xyflow/react`), DND-Kit |
| Datos | Supabase (Postgres + Auth + RLS) |
| Almacenamiento | Cloudflare R2 (S3-compatible) vía `@aws-sdk/client-s3` |
| Validación | Zod 4 |
| Tests | Vitest 4 (unitarios), Playwright (E2E) |

---

## Requisitos

- **Node.js 22** o superior
- **pnpm 11** — el proyecto fija la versión exacta vía el campo
  `packageManager` de `package.json`. Si tienes otro gestor instalado, activa
  Corepack:

  ```bash
  corepack enable
  ```

- Una cuenta de **Supabase** (opcional pero recomendado)
- Una cuenta de **Cloudflare R2** (solo para subir imágenes)

---

## Instalación

```bash
# 1. Clona el repositorio
git clone https://github.com/FeelNostalgic/learning-animations.git
cd learning-animations

# 2. Instala dependencias
pnpm install

# 3. Crea tu fichero de entorno
cp .env.example .env.local

# 4. Arranca el servidor de desarrollo (http://localhost:3001)
pnpm dev
```

Sin `.env.local` la aplicación **arranca igualmente**: las 26 animaciones
oficiales funcionan en modo standalone. Sin credenciales de Supabase you'll lose
las cuentas de usuario, el builder y el catálogo comunitario.

### Aplicar el esquema de base de datos

Las migraciones están en `supabase/migrations/`. Aplícalas en orden desde el
SQL Editor de tu proyecto Supabase, o con la CLI:

```bash
supabase link --project-ref <tu-project-ref>
supabase db push
```

| Migración | Contenido |
| --- | --- |
| `0001_initial_schema.sql` | Tablas `profiles` y `animations`, 7 políticas RLS |
| `0002_universal_animations.sql` | `is_public`, `discipline`, `tags`, `difficulty`, `connectors`, `views_count`, `likes_count`, `forked_from` |
| `0003_add_animation_background.sql` | Configuración de fondo por animación |

---

## Variables de entorno

Todas documentadas con instrucciones paso a paso en
[`.env.example`](.env.example). Resumen:

| Variable | Requerida | Para qué |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Para cuentas y builder | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Para cuentas y builder | Clave pública (anon) |
| `R2_ACCOUNT_ID` | Para subir imágenes | ID de cuenta Cloudflare |
| `R2_ACCESS_KEY_ID` | Para subir imágenes | Access key de R2 |
| `R2_SECRET_ACCESS_KEY` | Para subir imágenes | Secret key de R2 |
| `R2_BUCKET_NAME` | Para subir imágenes | Nombre del bucket |
| `NEXT_PUBLIC_R2_PUBLIC_URL` | Para servir imágenes | URL pública del bucket |

> Las variables `NEXT_PUBLIC_*` se exponen al navegador. `R2_SECRET_ACCESS_KEY`
> nunca debe salir del servidor. `.env.local` está en `.gitignore`; no lo subas.

---

## Scripts

| Comando | Qué hace |
| --- | --- |
| `pnpm dev` | Servidor de desarrollo en el puerto **3001** |
| `pnpm build` | Build de producción |
| `pnpm start` | Sirve el build en el puerto 3001 |
| `pnpm lint` | ESLint |
| `pnpm test` | Suite unitaria (Vitest) |
| `pnpm test:watch` | Vitest en modo watch |
| `pnpm test:coverage` | Vitest con cobertura |
| `pnpm test:e2e` | Tests end-to-end (Playwright) |
| `pnpm ci:sync` | Sincroniza con CI |
| `pnpm ship` | Flujo completo de commit y push |

---

## Estructura

```
learning-animations/
├── app/
│   ├── page.tsx                     # Redirige a /animations
│   ├── animations/                  # Catálogo público
│   ├── animations/[slug]/           # Reproductor (oficiales + comunidad)
│   ├── embed/[slug]/                # Vista limpia para iframe
│   ├── builder/                     # Editor visual (Server Actions)
│   ├── my-animations/               # Panel personal del usuario
│   ├── login/ · signup/             # Autenticación
│   ├── forgot-password/ · auth/     # Recuperación y callback OAuth
│   ├── docs/showcase/               # Showroom
│   └── api/upload/                  # Subida de assets a R2
├── components/
│   ├── animations/                  # 24 componentes de animación + player
│   │   ├── animation-player.tsx     # Reproductor con pasos y velocidad
│   │   ├── universal-animation-player.tsx
│   │   ├── animation-component-map.ts
│   │   └── network-visual-primitives.tsx
│   ├── builder/                     # Canvas, inspectores, timeline
│   ├── catalog/ · docs/ · my-animations/
│   └── ui/                          # Primitivas (Button, Slider, ...)
├── lib/
│   ├── animations/                  # Registro, compiladores, geometría, runtime
│   ├── supabase/                    # Clientes server/browser y middleware
│   ├── storage/r2.ts                # Cliente S3-compatible
│   ├── validations/                 # Esquemas Zod
│   ├── hooks/ · markdown/ · utils/
├── types/                           # AnimationMeta, AnimationStep, UniversalAnimationData
├── supabase/migrations/             # Esquema de base de datos
├── docs/animaciones/                # Guías de creación y estilo
├── __tests__/                       # 39 ficheros de tests unitarios
├── tests/                           # 6 specs E2E + page objects
├── .agents/                         # Agent skills (tooling, ver THIRD_PARTY_NOTICES)
└── AGENTS.md                        # Guía de trabajo para agentes de IA
```

---

## Animaciones disponibles

### Enlace y acceso
`arp` · `wifi` (802.11) · `csma-cd` · `csma-ca` · `ethernet` · `ppp`

### Modelo y direccionamiento IP
`osi-tcp-ip` · `ip-basico` · `ip-ruta` · `ip-hop-by-hop` · `ip-encapsulacion`

### Enrutamiento
`rip` · `ospf` · `bgp`

### Transporte y control
`icmp` · `tcp` · `udp` · `tcp-vs-udp`

### Aplicación
`dns` · `dhcp` · `ftp` · `tftp` · `http-https` · `smtp` · `pop3` · `ssh`

El registro vive en [`lib/animations/registry.ts`](lib/animations/registry.ts)
y el mapeo slug → componente en
[`components/animations/animation-component-map.ts`](components/animations/animation-component-map.ts).

---

## Embeber en otra web

Cualquier animación se incrusta con un `<iframe>`:

```html
<iframe
  src="https://tu-dominio.com/embed/arp"
  width="100%"
  height="600"
  allow="fullscreen"
  style="border: none; border-radius: 8px;"
  title="Animación ARP"
></iframe>
```

`/embed/[slug]` acepta tanto slugs de animaciones oficiales como UUIDs de
animaciones públicas de la comunidad.

---

## Testing

```bash
pnpm test          # 245 tests unitarios y de integración (39 ficheros)
pnpm test:e2e      # 6 specs de Playwright
```

| Suite | Ubicación | Qué cubre |
| --- | --- | --- |
| Unitarios y de integración | `__tests__/` | Registro, compiladores, geometría, runtime de interacción, hooks, validaciones Zod, cliente R2 |
| Accesibilidad | `__tests__/accessibility/` | Auditoría a11y |
| Componentes | `__tests__/components/` | Catálogo, reproductor, inspectores, canvas, nodos interactivos |
| E2E | `tests/` | Catálogo, builder, showcase, interactividad del canvas |

Los tests E2E corren contra la app sin credenciales reales: si detectan
variables de Supabase con el placeholder `placeholder-project`, la aplicación
opera en modo standalone.

---

## CI/CD

`.github/workflows/ci.yml` se dispara en push a `dev` y en PRs a `main`/`dev`:

1. **Unit & Integration Tests** — Vitest en `ubuntu-latest`.
2. **End-to-End Tests** — Playwright con Chromium, en paralelo.
3. **Semantic Release** — si ambos jobs pasan, calcula el bump a partir del
   conventional commit, versiona, etiqueta y hace merge de `dev` a `main`.

| Tipo de commit | Bump |
| --- | --- |
| `feat:`, `fix!:` o `BREAKING CHANGE:` | minor / major |
| `fix`, `refactor`, `perf`, `docs`, `test`, `ci`, `chore`, `build` | patch |
| `wip:` | ninguno |

```bash
git checkout dev
git add -A && git commit -m "feat(catalog): nueva animación DHCPv6"
git push
```

---

## Estado actual

**v1.19.5** · rama de trabajo `dev` · CI en verde.

### Lo que funciona

- Las 26 animaciones oficiales se reproducen, navegan y son responsive.
- El builder visual crea, guarda, recupera y publica animaciones.
- Cuentas de usuario completas con RLS aplicado.
- Catálogo comunitario con publicar, clonar y eliminar.
- Embeber por iframe operativo.
- 245 tests unitarios, 6 specs E2E, suite E2E en verde en CI.

### Limitaciones conocidas

Honestidad por delante del marketing:

- **Tres animaciones reutilizan el componente de otra** y **no tienen
  implementación visual propia**. En
  [`animation-component-map.ts`](components/animations/animation-component-map.ts):
  - `bgp` → reutiliza `IpEncapsulationAnimation`
  - `ospf` → reutiliza `IpHopByHopAnimation`
  - `rip` → reutiliza `IpRouteAnimation`

  Los pasos y el texto sí son propios, pero la escena animada es compartida.
  Son las candidatas más claras a una PR.

- **Dos tests son sensibles al tiempo.** En
  `__tests__/components/assets-sidebar-interactivity.test.tsx` y
  `__tests__/components/builder/canvas-viewport.test.tsx`, un import dinámico
  puede superar el `testTimeout` de 5 s si el suite completo satura la máquina.
  Aislados pasan en ~1,4 s. No son fallos de lógica.

- **El assets de imagen es el único punto de fallo de Cloudflare.** Sin
  credenciales de R2, el resto funciona; las imágenes no.

- **No hay i18n.** Toda la interfaz está en español.

- **Auth solo por email y contraseña.** Sin OAuth, aunque el callback de auth
  ya existe preparado.

### Rutas pendientes

- Animaciones dedicadas para `rip`, `ospf` y `bgp`
- Aumentar el `testTimeout` o mover esos imports dinámicos a carga estática
- README en inglés y opción de idioma
- Modo de reproducción por URL (deep-link a un paso concreto)

---

## Documentación

- [`docs/animaciones/COMO-CREAR-ANIMACIONES.md`](docs/animaciones/COMO-CREAR-ANIMACIONES.md) —
  cómo añadir una animación nueva
- [`docs/animation-style-guide.md`](docs/animation-style-guide.md) — guía de estilo visual
- [`docs/animaciones/README.md`](docs/animaciones/README.md) — índice
- [`AGENTS.md`](AGENTS.md) — convenciones de trabajo para agentes de IA
- [`.agents/`](.agents/) — agent skills instaladas

---

## Cómo contribuir

Lee [CONTRIBUTING.md](CONTRIBUTING.md). En corto:

1. Trabaja sobre `dev`, nunca sobre `main`.
2. Usa [Conventional Commits](CONTRIBUTING.md#mensajes-de-commit) —
   el bump de versión se calcula del mensaje.
3. `pnpm lint && pnpm test` antes de abrir la PR.
4. Si añades una animación, sigue la guía de estilo visual.

Las animaciones aportadas por la comunidad son el objetivo del proyecto. Si
tienes una que echaste de menos, mola.

---

## Licencia

**MIT** — ver [LICENSE](LICENSE). Copyright © 2026 Francisco Aragónes.

Aplica **solo al código propio de este repositorio**. Las dependencias con
licencia no-OSS (GSAP) y el material de terceros en `.agents/` se rigen por sus
propias licencias. Lee
**[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)** antes de redistribuir.

---

## Agradecimientos

- **GSAP** y su comunidad, por hacer la animación accesible desde 2025.
  Ojo: GSAP no es open source, pese a ser gratis. Ver el aviso de arriba.
- **Supabase**, por el backend completo en un proyecto self-hosted.
- **Vercel**, por Next.js y React.
- La comunidad de **Playwright**, **Vitest** y **React Flow**.
