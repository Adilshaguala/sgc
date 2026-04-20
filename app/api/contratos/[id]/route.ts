import { NextRequest, NextResponse } from "next/server"
import { handleRouteError } from "@/lib/api/responses"
import {
  getContratoById,
  getInstituicaoActual,
  updateContratoEstado,
} from "@/lib/data/contract-management"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const [contrato, instituicao] = await Promise.all([
      getContratoById(id),
      getInstituicaoActual(),
    ])

    if (!contrato) {
      return NextResponse.json({ error: "Contrato nao encontrado." }, { status: 404 })
    }

    return NextResponse.json({ contrato, instituicao })
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
    const contrato = await updateContratoEstado(id, payload)
    return NextResponse.json(contrato)
  } catch (error) {
    return handleRouteError(error)
  }
}
