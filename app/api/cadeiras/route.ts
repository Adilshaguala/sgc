import { NextRequest, NextResponse } from "next/server"
import { handleRouteError } from "@/lib/api/responses"
import { listCadeiras, createCadeira } from "@/lib/data/contract-management"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const cadeiras = await listCadeiras()
    return NextResponse.json(cadeiras)
  } catch (error) {
    return handleRouteError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json()
    const cadeira = await createCadeira(payload)
    return NextResponse.json(cadeira, { status: 201 })
  } catch (error) {
    return handleRouteError(error)
  }
}
