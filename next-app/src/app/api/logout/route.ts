// src/app/api/logout/route.ts
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  /* -- Borra la cookie -- */
  cookies().delete("token", { path: "/" })   // asegúrate de usar el mismo path

  /* Puedes devolver lo que quieras; un 204 también valdría */
  return NextResponse.json({ ok: true })
}