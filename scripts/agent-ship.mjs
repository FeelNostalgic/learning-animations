import { execSync } from "child_process"

/**
 * Agentic Git Ship & CI Sync Automation
 * Complete automated pipeline:
 * 1. Stages all changes (`git add .`)
 * 2. Commits with conventional commit message (`git commit -m "..."`)
 * 3. Pushes to remote (`git push origin <current-branch>`)
 * 4. Waits for GitHub Actions CI runner to trigger for this commit
 * 5. Actively monitors CI execution with live progress reporting
 * 6. If GREEN: Automatically runs `git pull` to sync the version bump and release tags!
 * 7. If RED: Extracts failure logs and alerts the user.
 */

function runCommand(cmd, options = {}) {
  try {
    return execSync(cmd, { encoding: "utf-8", ...options }).trim()
  } catch (err) {
    if (err.stdout) return err.stdout.trim()
    throw err
  }
}

function getGhBinary() {
  const possiblePaths = [
    "gh",
    "C:\\Program Files\\GitHub CLI\\gh.exe",
    "C:\\Users\\franc\\AppData\\Local\\Microsoft\\WinGet\\Packages\\GitHub.cli_Microsoft.Winget.Source_8wekyb3d8bbwe\\gh.exe",
  ]
  for (const p of possiblePaths) {
    try {
      execSync(`"${p}" --version`, { stdio: "ignore" })
      return p
    } catch {}
  }
  return "gh"
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function main() {
  const gh = getGhBinary()
  const args = process.argv.slice(2)
  let commitMessage = args.join(" ").trim()

  // 1. Check for working tree changes
  const statusOutput = runCommand("git status --porcelain")
  if (!statusOutput) {
    console.log("ℹ️ No hay cambios pendientes en el árbol de trabajo.")
    console.log("🔍 Comprobando si hay una GitHub Action pendiente para sincronizar...")
    execSync("node scripts/ci-sync.mjs", { stdio: "inherit" })
    return
  }

  // 2. Validate commit message
  if (!commitMessage) {
    console.error("❌ Por favor proporciona un mensaje de commit.")
    console.log('👉 Uso: pnpm ship -- "tipo(scope): descripción"')
    console.log('   Ejemplo: pnpm ship -- "feat(ui): añadir nuevo botón de acción"')
    process.exit(1)
  }

  console.log("🚀 ======================================================")
  console.log("🤖 INICIANDO PIPELINE AGÉNTICO: COMMIT -> PUSH -> CI -> PULL")
  console.log("========================================================\n")

  // Current branch
  const currentBranch = runCommand("git rev-parse --abbrev-ref HEAD")
  console.log(`🌿 Rama activa: ${currentBranch}`)

  // Step 1: git add .
  console.log("\n📦 1. Añadiendo archivos al stage (git add .)...")
  runCommand("git add .")

  // Step 2: git commit
  console.log(`📝 2. Creando commit con mensaje: "${commitMessage}"...`)
  try {
    const commitOutput = runCommand(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`)
    console.log(commitOutput)
  } catch (err) {
    console.error("❌ Error al hacer commit:", err.message)
    process.exit(1)
  }

  const commitSha = runCommand("git rev-parse HEAD")
  console.log(`🔑 Commit SHA: ${commitSha}`)

  // Step 3: git push
  console.log(`\n⬆️ 3. Enviando cambios al repositorio remoto (git push origin ${currentBranch})...`)
  try {
    const pushOutput = runCommand(`git push origin ${currentBranch}`)
    console.log(pushOutput || "Push completado.")
  } catch (err) {
    console.error("❌ Error al hacer push:", err.message)
    process.exit(1)
  }

  // Step 4: Wait for GitHub Actions to trigger
  console.log("\n⏳ 4. Esperando a que GitHub Actions inicie el workflow para este commit...")
  let targetRun = null
  let attempts = 0
  const maxAttempts = 15

  while (!targetRun && attempts < maxAttempts) {
    await sleep(2000)
    attempts++
    try {
      const raw = runCommand(`"${gh}" run list --commit ${commitSha} --json databaseId,status,conclusion,displayTitle,url,createdAt`)
      const parsed = JSON.parse(raw)
      if (parsed && parsed.length > 0) {
        targetRun = parsed[0]
      }
    } catch {}
  }

  if (!targetRun) {
    console.log("⚠️ No se pudo vincular directamente el run por SHA. Buscando el último run en curso...")
    try {
      const raw = runCommand(`"${gh}" run list --limit 1 --json databaseId,status,conclusion,displayTitle,url,createdAt`)
      const parsed = JSON.parse(raw)
      if (parsed && parsed.length > 0) {
        targetRun = parsed[0]
      }
    } catch {}
  }

  if (!targetRun) {
    console.log("ℹ️ No se detectó workflow activo. Puedes ejecutar 'pnpm ci:sync' más tarde.")
    return
  }

  const runId = targetRun.databaseId
  console.log(`\n📌 Workflow detectado: ID ${runId}`)
  console.log(`🔗 URL: ${targetRun.url}`)

  // Step 5: Active Monitoring Loop
  let status = targetRun.status
  let conclusion = targetRun.conclusion
  let elapsed = 0
  const pollIntervalSec = 5

  console.log("\n🔄 5. Monitorizando ejecución de pruebas CI (Vitest + Playwright E2E)...")

  while (status === "in_progress" || status === "queued" || !conclusion) {
    await sleep(pollIntervalSec * 1000)
    elapsed += pollIntervalSec

    try {
      const raw = runCommand(`"${gh}" run view ${runId} --json status,conclusion`)
      const updated = JSON.parse(raw)
      status = updated.status
      conclusion = updated.conclusion
      const timeStr = new Date().toLocaleTimeString("es-ES")
      process.stdout.write(`\r⏱️ [${timeStr}] Ejecutando pruebas en GitHub Actions... (${elapsed}s transcurridos)`)
    } catch {}
  }

  console.log(`\n\n🏁 Resultado de CI: ${conclusion ? conclusion.toUpperCase() : status.toUpperCase()}`)

  // Step 6: On Success -> git pull
  if (conclusion === "success") {
    console.log("\n✅ 6. ¡Todas las pruebas pasaron en VERDE y el release fue aprobado!")
    console.log("🚀 Sincronizando repositorio local con 'git pull' para traer la nueva versión...")

    try {
      const pullOutput = runCommand("git pull")
      console.log("📥 Resultado de 'git pull':")
      console.log(pullOutput)

      const latestCommit = runCommand("git log -1 --oneline")
      console.log(`\n🎉 PIPELINE COMPLETADO CON ÉXITO: ${latestCommit}`)
    } catch (err) {
      console.error("❌ Error al ejecutar 'git pull':", err.message)
    }
    return
  }

  // Step 7: On Failure -> Diagnose
  if (conclusion === "failure") {
    console.log("\n❌ 6. El workflow falló en ROJO.")
    console.log("🔍 Extrayendo diagnóstico detallado de logs fallidos...\n")

    try {
      const failedLogs = runCommand(`"${gh}" run view ${runId} --log-failed`)
      console.log("--- LOGS DEL FALLO ---")
      console.log(failedLogs.slice(-2500))
      console.log("-----------------------")
    } catch {
      console.log(`👉 Revisa el log completo en: ${targetRun.url}`)
    }

    console.log("\n⚠️ Se canceló el 'git pull'. Por favor soluciona los errores detectados.")
  }
}

main()
