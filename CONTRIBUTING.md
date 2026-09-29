# Contributing

Gracias por querer contribuir. Este proyecto es un motor de animación
educativa, y lo que más aporta es **contenido**: una animación de un protocolo
que aún no está cubierta vale más que diez correcciones de estilos.

## Antes de empezar

Lee [`AGENTS.md`](AGENTS.md) — recoge las convenciones de trabajo del proyecto.
Si vienes con un agente de IA, es el primer fichero que debería leer.

## Flujo de trabajo

1. **Fork** el repositorio y crea una rama desde `dev`. Nunca desde `main`:
   `main` es la rama de release y solo se actualiza vía CI.

   ```bash
   git clone https://github.com/tu-usuario/learning-animations.git
   cd learning-animations
   git remote add upstream https://github.com/FeelNostalgic/learning-animations.git
   git checkout -b feat/mi-animacion dev
   ```

2. **Instala y arranca**:

   ```bash
   corepack enable
   pnpm install
   cp .env.example .env.local   # opcional para el catálogo
   pnpm dev                     # http://localhost:3001
   ```

3. **Trabaja** con `pnpm dev`.

4. **Verifica** antes de abrir la PR:

   ```bash
   pnpm lint
   pnpm test
   ```

5. **Abre la PR contra `dev`**.

## Mensajes de commit

El CI calcula el número de versión a partir del tipo del commit, así que el
formato no es decorativo: determina si sale un patch, un minor o un major.

Usamos [Conventional Commits](https://www.conventionalcommits.org/es/v1.0.0/):

```
<tipo>(<ámbito>): <descripción>
```

| Tipo | Cuándo | Bump |
| --- | --- | --- |
| `feat` | Funcionalidad nueva | minor |
| `fix` | Corrección de bug | patch |
| `refactor` | Reestructuración sin cambio de comportamiento | patch |
| `perf` | Mejora de rendimiento | patch |
| `docs` | Documentación | patch |
| `test` | Tests | patch |
| `ci` | Workflows y automatización | patch |
| `chore` | Tareas de mantenimiento | patch |
| `build` | Dependencias y build | patch |
| `wip` | Trabajo en curso, **no** dispara release | ninguno |

Ejemplos:

```
feat(animations): añade animación OSPF dedicada
fix(builder): evita perder el viewport al recargar
docs(readme): aclara la configuración de Cloudflare R2
```

Marcadores de ruptura, con `!` tras el tipo o `BREAKING CHANGE:` en el cuerpo:

```
feat(compiler)!: el esquema de pasos pasa a ser discriminated union
```

## Añadir una animación nueva

Es la contribución más valiosa. Hay dos caminos:

### A) Animación oficial (código)

1. Lee las guías, en este orden:
   - [`docs/animaciones/README.md`](docs/animaciones/README.md)
   - [`docs/animaciones/COMO-CREAR-ANIMACIONES.md`](docs/animaciones/COMO-CREAR-ANIMACIONES.md)
   - [`docs/animation-style-guide.md`](docs/animation-style-guide.md)
2. Crea el componente en `components/animations/<slug>-animation.tsx`.
3. Regístralo en `components/animations/animation-component-map.ts`.
4. Añade metadatos y pasos en `lib/animations/registry.ts`.
5. Añade un test en `__tests__/lib/animations-registry.test.ts`.

> **Importante:** cada slug debe tener su propio componente. Actualmente `rip`,
> `ospf` y `bgp` reutilizan el de otro protocolo porque no hay implementación
> visual dedicada. Si te animas, eso es una PR bien recibida.

### B) Animación comunitaria (sin código)

Regístrate en la app, créala en `/builder` y publícala. Aparece en el catálogo
público. Si te gusta y quieres que sea oficial, abre una PR con el export.

## Convenciones de código

- **TypeScript estricto.** Nada de `any` sin justificación, nada de
  `@ts-nocheck`. Si el tipado falla, el problema es el tipado.
- **Server Components por defecto.** `"use client"` solo cuando necesitas
  estado, efectos o refs.
- **Server Actions** para toda mutación con acceso a datos. Nada de
  `fetch` desde el cliente contra la base de datos.
- **Validación con Zod** en el límite: toda entrada externa se valida antes de
  tocar la base de datos.
- **No incluyas secretos.** Nada de claves, URLs privadas ni `.env.local`.
- **Accesibilidad**: los componentes interactivos necesitan teclado, foco
  visible y roles ARIA correctos. Hay tests de a11y en
  `__tests__/accessibility/`; no los rompas.

## Tests

- **Unitarios** (`__tests__/`): Vitest, importa desde `@/...`.
- **E2E** (`tests/`): Playwright con page objects en `tests/<area>/`.
  Los E2E deben pasar sin credenciales reales.

Si arreglas un bug, añade el test que lo habría detectado. Si añades
comportamiento, añade su test.

> Nota: dos tests del builder pueden superar el `testTimeout` de 5 s si el
> suite completo satura la máquina. Si te pasa, ejecuta el fichero aislado
> antes de asumir que hay un bug:
> `pnpm exec vitest run __tests__/components/builder/canvas-viewport.test.tsx`

## Revisión

El CI exige que pasen, en `ubuntu-latest`:

- `pnpm test` (Vitest)
- `pnpm run test:e2e` (Playwright + Chromium)

Las PRs se revisan por claridad, no por tamaño. Si tu PR toca 15 ficheros,
pregunta antes: quizá se pueda partir en tres.

## Licencia

Al contribuir aceptas que tu trabajo se publique bajo la [licencia MIT](LICENSE)
del proyecto.

**Antes de añadir una dependencia o material de terceros**, comprueba su
licencia. Si no es una licencia permisiva clara (MIT, Apache-2.0, ISC, BSD),
apúntalo en [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md) y menciónalo en la
PR. Ojo: **GSAP no es open source** — ver el aviso del README.

## Reportar en lugar de contribuir

- **Bug** → [plantilla de bug report](.github/ISSUE_TEMPLATE/bug_report.yml)
- **Idea o animación que falta** → [plantilla de feature request](.github/ISSUE_TEMPLATE/feature_request.yml)
- **Vulnerabilidad de seguridad** → [`SECURITY.md`](SECURITY.md), **no** abras
  un issue público.