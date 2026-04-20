import { NextResponse } from "next/server"

export function handleRouteError(error: unknown) {
  const message = error instanceof Error ? error.message : "Ocorreu um erro interno."
  return NextResponse.json({ error: message }, { status: 500 })
}
