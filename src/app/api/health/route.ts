import * as Sentry from "@sentry/nextjs"
import { connection } from "next/server"

import prisma from "@/lib/prisma"

export async function GET() {
  await connection()
  try {
    // Check the application schema as well as database connectivity.
    await prisma.organization.count()
    return Response.json({ status: "ok" })
  } catch (error) {
    console.error("Health check failed", error)
    Sentry.captureException(error)
    return Response.json({ status: "unhealthy" }, { status: 503 })
  }
}
