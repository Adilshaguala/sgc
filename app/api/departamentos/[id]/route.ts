import { NextRequest, NextResponse } from "next/server"
import { handleRouteError } from "@/lib/api/responses"
import {
  getDepartamentoById,
  updateDepartamento,
  deleteDepartamento,
} from "@/lib/data/contract-management"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const departamento = await getDepartamentoById(id)

    if (!departamento) {
      return NextResponse.json({ error: "Departamento nao encontrado." }, { status: 404 })
    }

    return NextResponse.json(departamento)
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
    const departamento = await updateDepartamento(id, payload)
    return NextResponse.json(departamento)
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
    const departamento = await deleteDepartamento(id)
    return NextResponse.json(departamento)
  } catch (error) {
    return handleRouteError(error)
  }
}