import { NextRequest, NextResponse } from "next/server"
import { handleRouteError } from "@/lib/api/responses"
import { createDepartamento, listDepartamentos } from "@/lib/data/contract-management"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const departamentos = await listDepartamentos()
    return NextResponse.json(departamentos)
  } catch (error) {
    return handleRouteError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json()
    const departamento = await createDepartamento(payload)
    return NextResponse.json(departamento, { status: 201 })
  } catch (error) {
    return handleRouteError(error)
  }
}