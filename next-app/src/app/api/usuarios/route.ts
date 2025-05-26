// app/api/usuarios/route.ts
import { prisma } from "../../../../lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("Ejecutando GET /api/usuarios")
    const usuarios = await prisma.Usuario.findMany()
    return NextResponse.json(usuarios)
  } catch (error: any) {
    console.error("Error al obtener usuarios:", error.message || error)
    return new NextResponse(JSON.stringify({ error: "Error interno" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    })
  }
}
