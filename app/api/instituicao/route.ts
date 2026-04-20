import { NextRequest, NextResponse } from "next/server"
import { handleRouteError } from "@/lib/api/responses"
import { getInstituicaoActual, updateInstituicao } from "@/lib/data/contract-management"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const instituicao = await getInstituicaoActual()
    return NextResponse.json(instituicao)
  } catch (error) {
    return handleRouteError(error)
  }
}

export async function PUT(req: NextRequest) {
  try {
    const payload = await req.json()
    const instituicao = await updateInstituicao(payload)
    return NextResponse.json(instituicao)
  } catch (error) {
    return handleRouteError(error)
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const payload = await req.json()
    const instituicao = await updateInstituicao(payload)
    return NextResponse.json(instituicao)
  } catch (error) {
    return handleRouteError(error)
  }
}