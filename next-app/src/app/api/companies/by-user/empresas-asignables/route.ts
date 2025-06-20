// src/app/api/empresas-asignables/route.ts
import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth"

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const userId = session.sub
  const level  = session.level

  try {
    let ownerId: string | null = null

    if (level === 4) {
      // SuperAdminEmpresa accede a sus propias empresas
      ownerId = userId
    } else if (level === 3) {
      // AdminEmpresa: buscar el super admin que lo creó
      const user = await prisma.users.findUnique({
        where: { id: userId },
        select: { created_by_id: true },
      })

      if (!user?.created_by_id) {
        return NextResponse.json({ error: "No se pudo determinar el creador" }, { status: 403 })
      }

      ownerId = user.created_by_id
    } else {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const companies = await prisma.companies.findMany({
      where: {
        owner_user_id: ownerId,
      },
      select: {
        id: true,
        trade_name: true,
        legal_name: true,
        active: true,
        logo_url: true,
        created_at: true,
      },
    })

    return NextResponse.json(companies)
  } catch (err) {
    console.error("Error en GET /api/empresas-asignables:", err)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
