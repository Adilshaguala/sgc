import { NextRequest, NextResponse } from "next/server"
import { handleRouteError } from "@/lib/api/responses"
import { createDocente, listDocentes } from "@/lib/data/contract-management"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const docentes = await listDocentes()
    return NextResponse.json(docentes)
  } catch (error) {
    return handleRouteError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json()
    const docente = await createDocente(payload)
    return NextResponse.json(docente, { status: 201 })
  } catch (error) {
    return handleRouteError(error)
  }
}
