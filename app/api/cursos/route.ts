import { NextRequest, NextResponse } from "next/server"
import { handleRouteError } from "@/lib/api/responses"
import {
  listCursos,
  createCurso,
} from "@/lib/data/contract-management"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const cursos = await listCursos()
    return NextResponse.json(cursos)
  } catch (error) {
    return handleRouteError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json()
    const curso = await createCurso(payload)
    return NextResponse.json(curso, { status: 201 })
  } catch (error) {
    return handleRouteError(error)
  }
}