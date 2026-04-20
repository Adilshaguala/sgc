import { NextRequest, NextResponse } from "next/server"
import { handleRouteError } from "@/lib/api/responses"
import {
  getCursoById,
  updateCurso,
  deleteCurso,
} from "@/lib/data/contract-management"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const curso = await getCursoById(id)

    if (!curso) {
      return NextResponse.json({ error: "Curso nao encontrado." }, { status: 404 })
    }

    return NextResponse.json(curso)
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
    const curso = await updateCurso(id, payload)
    return NextResponse.json(curso)
  } catch (error) {
    return handleRouteError(error)
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const curso = await deleteCurso(id)
    return NextResponse.json(curso)
  } catch (error) {
    return handleRouteError(error)
  }
}