import { NextRequest, NextResponse } from "next/server"
import { handleRouteError } from "@/lib/api/responses"
import { createCentroRecursos, listCentrosRecursos } from "@/lib/data/contract-management"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const centros = await listCentrosRecursos()
    return NextResponse.json(centros)
  } catch (error) {
    return handleRouteError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json()
    const centro = await createCentroRecursos(payload)
    return NextResponse.json(centro, { status: 201 })
  } catch (error) {
    return handleRouteError(error)
  }
}