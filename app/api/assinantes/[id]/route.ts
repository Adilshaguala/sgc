import { NextRequest, NextResponse } from "next/server"
import { handleRouteError } from "@/lib/api/responses"
import {
  getAssinanteById,
  updateAssinante,
  deleteAssinante,
} from "@/lib/data/contract-management"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const assinante = await getAssinanteById(id)

    if (!assinante) {
      return NextResponse.json({ error: "Assinante nao encontrado." }, { status: 404 })
    }

    return NextResponse.json(assinante)
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
    const assinante = await updateAssinante(id, payload)
    return NextResponse.json(assinante)
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
    const assinante = await deleteAssinante(id)
    return NextResponse.json(assinante)
  } catch (error) {
    return handleRouteError(error)
  }
}