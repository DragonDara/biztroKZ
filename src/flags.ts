import { flag } from "flags/next"

export const simulatePdfAi = flag({
  key: "simulate-pdf-ai",
  description: "Enable simulated PDF AI extraction in dev/testing",
  decide: () => process.env.FLAGS_SIMULATE_PDF_AI === "1",
  defaultValue: true
})

export const precomputedFlags = [simulatePdfAi] as const
