// src/app/api/companies/companies_relationed/route.ts
import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth" // o donde obtengas el usuario logueado

export async function GET(req: NextRequest) {
  try {
    // Obtén el usuario en sesión (JWT/cookie, depende de tu auth)
    const session = await getSession()
    const userId = session?.sub
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Trae las empresas donde owner_user_id = usuario autenticado
    const companies = await prisma.companies.findMany({
      where: { owner_user_id: userId },
      select: {
        id: true,
        trade_name: true,
        logo_url: true,
        company_type: true,
        active: true,
      },
      orderBy: { trade_name: "asc" },
    })

    return NextResponse.json(companies)
  } catch (err) {
    console.error("❌ Error en companies_relationed:", err)
    return NextResponse.json({ error: "Error consultando empresas" }, { status: 500 })
  }
}
