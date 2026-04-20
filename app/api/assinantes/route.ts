import { NextRequest, NextResponse } from "next/server"
import { handleRouteError } from "@/lib/api/responses"
import { createAssinante, listAssinantes } from "@/lib/data/contract-management"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const assinantes = await listAssinantes()
    return NextResponse.json(assinantes)
  } catch (error) {
    return handleRouteError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json()
    const assinante = await createAssinante(payload)
    return NextResponse.json(assinante, { status: 201 })
  } catch (error) {
    return handleRouteError(error)
  }
}