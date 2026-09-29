# Security Policy

## Versiones soportadas

Este proyecto está en pre-1.0 semántico (`v1.19.x`) y la API y el esquema de
base de datos todavía cambian. Solo la rama `main` —la que sale de CI— recibe
correcciones de seguridad.

| Rama | Estado | ¿Parches de seguridad? |
| --- | --- | --- |
| `main` | Estable | Sí |
| `dev` | Desarrollo | No |

## Reportar una vulnerabilidad

**No abras un issue público.** Un issue abierto tiene permisos de lectura para
todo el mundo y el detalle técnico se comparte antes de existir un parche.

Reporta por GitHub Security Advisories:

1. Ve a <https://github.com/FeelNostalgic/learning-animations/security/advisories/new>
2. Selecciona la rama `main` como afectada.
3. Describe el problema con los pasos de reproducción.

Si no puedes usar ese canal, escribe a **franciscoaragones2014@gmail.com**
asunto: `SECURITY: <resumen>`.

### Qué incluir

- Qué componente o ruta afectada (`app/`, `lib/`, `components/`, migraciones).
- Pasos de reproducción, idealmente con un fragmento mínimo.
- Impacto: qué puede lograr un atacante y a quién afecta.
- Si la explotación requiere cuenta de usuario, entorno concreto o
  configuración de Cloudflare.

### Qué esperar

| Etapa | Compromiso |
| --- | --- |
| Acuse de recibo | 72 horas |
| Evaluación inicial y clasificación | 7 días |
| Corrección o mitigación publicada | 30 días |
| Divulgación conjunta | 90 días, o antes si hay riesgo activo |

Si el fallo ya está siendo explotado, se publica un parche de emergencia lo
antes posible y la atribución se coordina contigo.

## Superficies de ataque conocidas

El proyecto tiene tres superficies que merecen atención. Al revisar, concéntrate
en ellas.

### 1. Renderizado de animaciones de usuario

Las animaciones de la comunidad son **contenido no confiable**: cualquiera con
cuenta puede publicarlas y se renderizan en `/animations/[slug]` y
`/embed/[slug]`.

Mitigaciones ya implementadas:
- Validación con **Zod 4** en el límite de servidor
  (`lib/validations/universal-animation.ts`).
- **DOMPurify** para el Markdown con KaTeX (`lib/markdown/render.tsx`).
- Renderizado en un modelo de datos estricto, no como HTML arbitrario.

Busca: inyección de HTML o SVG, bypass del sanitizador, `dangerouslySetInnerHTML`
con datos de usuario, evaluación de expresiones.

### 2. Row-Level Security de Supabase

Las políticas de `supabase/migrations/0001_initial_schema.sql` son la única
frontera entre usuarios. Una política mal escrita significa que un usuario lee
o borra animaciones ajenas.

Busca: consultas `.from("animations")` sin filtro por `user_id`, políticas que
no comprueban `auth.uid()`, uso de la `service_role` key en código de servidor
accesible desde el cliente.

### 3. Subida de archivos a R2

`app/api/upload/route.ts` acepta ficheros de los usuarios y los escribe en un
bucket de Cloudflare R2.

Busca: validación insuficiente de tipo y tamaño, nombres de objeto derivados de
la entrada sin sanear (path traversal), bucket con escritura pública, SSRF.

## Buenas prácticas al contribuir

- **Validar en el servidor, siempre.** El cliente no es una frontera.
- **No uses la `service_role` key** en código accesible al navegador. Solo
  `NEXT_PUBLIC_SUPABASE_ANON_KEY` es pública por diseño.
- **Escapa y sanea** cualquier contenido de usuario antes de interpolarlo.
- **Sube el `testTimeout` si un test es lento**, no el riesgo de una condición de
  carrera sin probar.
- **No subas secretos.** Ni a `.env.example`, ni a un test, ni a un comentario.
