import { appendFileSync } from "node:fs"
import { join } from "node:path"

export function debugLog(payload: {
  hypothesisId: string
  location: string
  message: string
  data?: Record<string, unknown>
  runId?: string
}) {
  try {
    appendFileSync(
      join(process.cwd(), "debug-5cb27c.log"),
      `${JSON.stringify({
        sessionId: "5cb27c",
        runId: payload.runId ?? "pre-fix",
        timestamp: Date.now(),
        ...payload
      })}\n`
    )
  } catch {
    // ignore logging failures
  }
}
