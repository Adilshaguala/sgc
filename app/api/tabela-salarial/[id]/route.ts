import { NextRequest, NextResponse } from "next/server"
import { handleRouteError } from "@/lib/api/responses"
import { updateTabelaSalario, deleteTabelaSalario } from "@/lib/data/contract-management"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const payload = await req.json()
    const entrada = await updateTabelaSalario(id, payload)
    return NextResponse.json(entrada)
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
    const entrada = await deleteTabelaSalario(id)
    return NextResponse.json(entrada)
  } catch (error) {
    return handleRouteError(error)
  }
}