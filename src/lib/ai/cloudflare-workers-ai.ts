import { env } from "@/env.mjs"

export type CloudflareWorkersAiMessage = {
  role: "system" | "user" | "assistant"
  content: string
}

type CloudflareWorkersAiRunOptions = {
  model: string
  messages: CloudflareWorkersAiMessage[]
  maxTokens?: number
  temperature?: number
}

type CloudflareAiErrorItem = {
  message?: string
  code?: number
}

type CloudflareAiRunResponse = {
  success?: boolean
  errors?: CloudflareAiErrorItem[]
  result?: {
    response?: string
    choices?: Array<{
      message?: {
        content?: string
      }
    }>
  }
}

function sleep(ms: number) {
  return new Promise<void>(resolve => {
    setTimeout(resolve, ms)
  })
}

function extractText(payload: unknown): string {
  const root = payload as CloudflareAiRunResponse

  if (root.success === false) {
    const details =
      root.errors
        ?.map(error => error.message)
        .filter(Boolean)
        .join("; ") ?? "Unknown Cloudflare Workers AI error"
    throw new Error(details)
  }

  const fromChoices = root.result?.choices?.[0]?.message?.content
  if (typeof fromChoices === "string" && fromChoices.trim()) {
    return fromChoices.trim()
  }

  if (
    typeof root.result?.response === "string" &&
    root.result.response.trim()
  ) {
    return root.result.response
  }

  throw new Error("Cloudflare Workers AI returned empty text")
}

function isRetryableStatus(status: number) {
  return status === 429 || status === 503 || status === 502
}

/**
 * Calls Cloudflare Workers AI REST API and returns the model text.
 * Server-only. Does not parse JSON schemas — callers do that.
 */

export async function runCloudflareWorkersAi(
  options: CloudflareWorkersAiRunOptions
): Promise<string> {
  const accountId = env.CLOUDFLARE_ACCOUNT_ID
  const apiToken = env.CLOUDFLARE_AI_API_TOKEN
  if (!accountId || !apiToken) {
    throw new Error("Cloudflare Workers AI is not configured")
  }
  const { model, messages, maxTokens = 8192, temperature = 0.2 } = options
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`
  const body = {
    messages,
    max_tokens: maxTokens,
    temperature
  }
  const maxAttempts = 2
  let lastError: Error | null = null
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      })
      const payload: unknown = await response.json().catch(() => null)
      if (!response.ok) {
        const message =
          typeof payload === "object" &&
          payload !== null &&
          "errors" in payload &&
          Array.isArray((payload as CloudflareAiRunResponse).errors)
            ? (payload as CloudflareAiRunResponse).errors
                ?.map(error => error.message)
                .filter(Boolean)
                .join("; ")
            : `HTTP ${response.status}`
        const error = new Error(
          message || `Cloudflare Workers AI request failed (${response.status})`
        )
        if (isRetryableStatus(response.status) && attempt < maxAttempts) {
          lastError = error
          await sleep(500 * attempt)
          continue
        }
        throw error
      }
      return extractText(payload)
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      // Network blips: one retry
      if (attempt < maxAttempts) {
        await sleep(500 * attempt)
        continue
      }
    }
  }
  throw lastError ?? new Error("Cloudflare Workers AI request failed")
}

export function isCloudflareWorkersAiConfigured() {
  return Boolean(env.CLOUDFLARE_ACCOUNT_ID && env.CLOUDFLARE_AI_API_TOKEN)
}
