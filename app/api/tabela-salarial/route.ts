import { NextRequest, NextResponse } from "next/server"
import { handleRouteError } from "@/lib/api/responses"
import { createTabelaSalario, getTabelaSalarial } from "@/lib/data/contract-management"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const tabela = await getTabelaSalarial()
    return NextResponse.json(tabela)
  } catch (error) {
    return handleRouteError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json()
    const entrada = await createTabelaSalario(payload)
    return NextResponse.json(entrada, { status: 201 })
  } catch (error) {
    return handleRouteError(error)
  }
}