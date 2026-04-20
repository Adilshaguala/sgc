import { NextResponse } from "next/server"
import { handleRouteError } from "@/lib/api/responses"
import { getContratoFormOptions } from "@/lib/data/contract-management"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const options = await getContratoFormOptions()
    return NextResponse.json(options)
  } catch (error) {
    return handleRouteError(error)
  }
}
