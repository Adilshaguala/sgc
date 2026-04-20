import { NextResponse } from "next/server"
import { handleRouteError } from "@/lib/api/responses"
import { getDashboardData } from "@/lib/data/contract-management"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const data = await getDashboardData()
    return NextResponse.json(data)
  } catch (error) {
    return handleRouteError(error)
  }
}
