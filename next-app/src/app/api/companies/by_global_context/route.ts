import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const cookies = req.cookies
  const contextId = cookies.get("relationedCompany")?.value

  if (!contextId) {
    return NextResponse.json({ error: "Contexto no definido" }, { status: 400 })
  }

  try {
    const companies = await prisma.companies.findMany({
      where: {
        global_company_context_id: contextId,
      },
      select: {
        id: true,
        trade_name: true,
        logo_url: true,
        active: true,
        company_type: true,
      },
    })

    return NextResponse.json({ companies }, { status: 200 })
  } catch (error: any) {
    console.error("❌ Error al obtener empresas:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
