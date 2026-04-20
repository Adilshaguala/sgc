import { NextRequest, NextResponse } from "next/server"
import { handleRouteError } from "@/lib/api/responses"
import {
  getCentroRecursosById,
  updateCentroRecursos,
  deleteCentroRecursos,
} from "@/lib/data/contract-management"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const centro = await getCentroRecursosById(id)

    if (!centro) {
      return NextResponse.json({ error: "Centro de recursos nao encontrado." }, { status: 404 })
    }

    return NextResponse.json(centro)
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
    const centro = await updateCentroRecursos(id, payload)
    return NextResponse.json(centro)
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
    const centro = await deleteCentroRecursos(id)
    return NextResponse.json(centro)
  } catch (error) {
    return handleRouteError(error)
  }
}