// src/app/api/empresas-asignables/route.ts
import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { Roles } from "@/lib/envRoles"

export async function GET(_: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const userId = session.sub
  const roleId = session.role  // Este campo debe venir del token/session

  try {
    let companies = []

    if (roleId === Roles.SUPER_ADMIN_EMPRESA) {
      // SuperAdminEmpresa: accede a empresas donde él es el owner
      companies = await prisma.companies.findMany({
        where: { owner_user_id: userId },
        select: {
          id: true,
          trade_name: true,
          legal_name: true,
          active: true,
          logo_url: true,
          created_at: true,
        },
      })
    } else if (roleId === Roles.ADMINISTRADOR_EMPRESA) {
      // AdminEmpresa: accede a las empresas asignadas vía UserCompany
      const relations = await prisma.userCompany.findMany({
        where: { user_id: userId },
        select: { company_id: true },
      })

      const companyIds = relations.map(r => r.company_id)

      companies = await prisma.companies.findMany({
        where: { id: { in: companyIds } },
        select: {
          id: true,
          trade_name: true,
          legal_name: true,
          active: true,
          logo_url: true,
          created_at: true,
        },
      })
    } else {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    return NextResponse.json(companies)
  } catch (err) {
    console.error("Error en GET /api/empresas-asignables:", err)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
