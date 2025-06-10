import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getUserFromToken } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromToken(req)
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const dbUser = await prisma.users.findUnique({
      where: { id: user.sub },
      select: { status: true },
    })

    if (!dbUser) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ status: dbUser.status })
  } catch (error) {
    console.error("❌ Error al obtener status:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
