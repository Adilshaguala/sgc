import { NextRequest, NextResponse } from "next/server"
import { handleRouteError } from "@/lib/api/responses"
import {
  getDocenteById,
  listDocenteHistorico,
  updateDocente,
} from "@/lib/data/contract-management"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const [docente, historico] = await Promise.all([
      getDocenteById(id),
      listDocenteHistorico(id),
    ])

    if (!docente) {
      return NextResponse.json({ error: "Docente nao encontrado." }, { status: 404 })
    }

    return NextResponse.json({ docente, historico })
  } catch (error) {
    return handleRouteError(error)
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const payload = await req.json()
    const docente = await updateDocente(id, payload)
    return NextResponse.json(docente)
  } catch (error) {
    return handleRouteError(error)
  }
}
