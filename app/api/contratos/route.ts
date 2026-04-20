import { NextRequest, NextResponse } from "next/server"
import { handleRouteError } from "@/lib/api/responses"
import { createContrato, listContratos } from "@/lib/data/contract-management"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const contratos = await listContratos()
    return NextResponse.json(contratos)
  } catch (error) {
    return handleRouteError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json()
    const contrato = await createContrato(payload)
    return NextResponse.json(contrato, { status: 201 })
  } catch (error) {
    return handleRouteError(error)
  }
}
