import { execSync } from "child_process"

/**
 * CI Sync & Monitor Script
 * Checks the latest GitHub Actions workflow run:
 * - If IN_PROGRESS / QUEUED: actively waits and polls until it finishes.
 * - If SUCCESS: performs `git pull` and reports updated state.
 * - If FAILURE: inspects failed logs and reports actionable error diagnosis.
 */
function runCommand(cmd) {
  try {
    return execSync(cmd, { encoding: "utf-8" }).trim()
  } catch (err) {
    if (err.stdout) return err.stdout.trim()
    throw err
  }
}

// Find gh binary path
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
    } catch {
      // try next
    }
  }
  return "gh"
}

function fetchRunDetails(gh, runId) {
  const flag = runId ? `view ${runId}` : "list --limit 1"
  const raw = runCommand(`"${gh}" run ${flag} --json databaseId,status,conclusion,displayTitle,name,url,headBranch,createdAt,event`)
  const parsed = JSON.parse(raw)
  return Array.isArray(parsed) ? parsed[0] : parsed
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function main() {
  const gh = getGhBinary()
  console.log("🔍 Consultando el estado de la última GitHub Action...")

  let latestRun
  try {
    latestRun = fetchRunDetails(gh)
  } catch (err) {
    console.error("❌ Error al consultar GitHub Actions:", err.message)
    process.exit(1)
  }

  if (!latestRun) {
    console.log("ℹ️ No se encontraron ejecuciones de GitHub Actions en este repositorio.")
    return
  }

  let { databaseId, status, conclusion, displayTitle, name, url, headBranch, createdAt } = latestRun
  const runTitle = displayTitle || name || "Workflow Run"

  console.log(`\n📌 Workflow: "${runTitle}"`)
  console.log(`🌿 Rama: ${headBranch} | ID: ${databaseId}`)
  console.log(`🔗 URL: ${url}`)
  console.log(`⏱️ Iniciado: ${new Date(createdAt).toLocaleString("es-ES")}`)

  // ── Polling Loop if Action is currently running ─────────────────
  if (status === "in_progress" || status === "queued" || !conclusion) {
    console.log(`\n⏳ La acción está en estado: ${status.toUpperCase()}. Esperando a que finalice...`)

    let elapsed = 0
    const pollIntervalSec = 5

    while (status === "in_progress" || status === "queued" || !conclusion) {
      await sleep(pollIntervalSec * 1000)
      elapsed += pollIntervalSec

      try {
        const updated = fetchRunDetails(gh, databaseId)
        status = updated.status
        conclusion = updated.conclusion
        const timeStr = new Date().toLocaleTimeString("es-ES")
        process.stdout.write(`\r🔄 [${timeStr}] Ejecutándose en GitHub Actions... (${elapsed}s transcurridos)`)
      } catch {
        // Ignorar fallo transitorio de red y reintentar
      }
    }

    console.log(`\n\n🏁 Acción finalizada con estado: ${status.toUpperCase()} -> ${conclusion?.toUpperCase()}`)
  } else {
    console.log(`📊 Estado: ${status.toUpperCase()} (${conclusion.toUpperCase()})\n`)
  }

  // ── Success Flow: Auto Git Pull ─────────────────────────────────
  if (conclusion === "success") {
    console.log("✅ ¡La GitHub Action finalizó en VERDE con éxito!")
    console.log("🚀 Sincronizando repositorio local con 'git pull'...\n")

    try {
      const pullOutput = runCommand("git pull")
      console.log("📥 Resultado de 'git pull':")
      console.log(pullOutput)
      console.log("\n🎉 Repositorio local sincronizado y actualizado con éxito.")
    } catch (err) {
      console.error("❌ Error al ejecutar 'git pull':", err.message)
      console.log("💡 Tip: Guarda o haz stash de tus cambios locales pendientes para completar el pull.")
    }
    return
  }

  // ── Failure Flow: Extract Diagnosis Logs ────────────────────────
  if (conclusion === "failure") {
    console.log("❌ La GitHub Action falló en ROJO.")
    console.log("🔍 Extrayendo diagnóstico de logs fallidos...\n")

    try {
      const failedLogs = runCommand(`"${gh}" run view ${databaseId} --log-failed`)
      console.log("--- LOGS DEL FALLO ---")
      console.log(failedLogs.slice(-2500))
      console.log("-----------------------")
    } catch {
      console.log(`👉 Consulta los logs detallados en: ${url}`)
    }

    console.log("\n⚠️ Se canceló el 'git pull' debido a fallos en la integración continua.")
    return
  }

  console.log(`ℹ️ La acción finalizó con conclusión: ${conclusion || status}`)
}

main()
