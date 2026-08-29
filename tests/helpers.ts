/**
 * Shared helpers and mock data generators for Playwright E2E tests.
 */

export function generateUniqueEmail(): string {
  return `test.${Date.now()}.${Math.floor(Math.random() * 1000)}@example.com`
}

export function generateTestAnimation() {
  const timestamp = Date.now()
  return {
    title: `Animación E2E Test #${timestamp}`,
    topic: "Redes y Telecomunicaciones",
    discipline: "computer_science" as const,
    difficulty: "beginner" as const,
    description: "Animación de prueba automatizada generada por el runner de tests.",
  }
}
