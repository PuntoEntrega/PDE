// src/app/api/pdes/route.ts
import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { randomUUID } from "crypto"
import { getSession } from "@/lib/auth"
import { Roles } from "@/lib/envRoles"

const baseSelect = {
  id: true,
  name: true,
  created_at: true,
  updated_at: true,
  active: true,
  company: { select: { trade_name: true } },
}

/* ---------- GET: lista de PdE que el usuario puede ver ---------- */
export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    let pdes = []

    if (session.role === Roles.SUPER_ADMIN_EMPRESA) {
      // todos los PdE de empresas que él posee
      pdes = await prisma.deliveryPoints.findMany({
        where: { company: { owner_user_id: session.sub } },
        select: baseSelect,
      })
    } else if (session.role === Roles.ADMINISTRADOR_EMPRESA) {
      // PdE de las empresas a las que pertenece vía UserCompany
      const companyIds = await prisma.userCompany.findMany({
        where: { user_id: session.sub },
        select: { company_id: true },
      }).then(r => r.map(e => e.company_id))

      pdes = await prisma.deliveryPoints.findMany({
        where: { company_id: { in: companyIds } },
        select: baseSelect,
      })
    } else {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // añadir métricas ficticias
    const enriched = pdes.map(p => ({
      ...p,
      usage: Math.floor(Math.random() * 51),
      capacity: 50,
    }))

    return NextResponse.json(enriched)
  } catch (err) {
    console.error("GET /api/pdes:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

/* ---------- POST: crear un PdE ---------- */
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()

  /* ----------- validaciones mínimas ----------- */
  const required = [
    "company_id",
    "name",
    "whatsapp_contact",
    "business_email",
    "province",
    "canton",
    "district",
    "exact_address",
    "postal_code",
    "latitude",
    "longitude",
    "schedule_json",
    "services_json",
    "storage_area_m2",
  ]
  const missing = required.filter(k => body[k] === undefined || body[k] === "")
  if (missing.length) {
    return NextResponse.json(
      { error: `Faltan campos: ${missing.join(", ")}` },
      { status: 400 },
    )
  }

  /* ----------- autorización sobre la empresa ----------- */
  const { company_id } = body

  const company = await prisma.companies.findUnique({
    where: { id: company_id },
    select: { owner_user_id: true, id: true },
  })
  if (!company) {
    return NextResponse.json({ error: "Empresa no encontrada" }, { status: 404 })
  }

  // Super admin solo sobre sus propias empresas
  if (session.role === Roles.SUPER_ADMIN_EMPRESA && company.owner_user_id !== session.sub) {
    return NextResponse.json({ error: "No autorizado sobre esta empresa" }, { status: 403 })
  }

  // Admin empresa: debe existir relación en UserCompany
  if (session.role === Roles.ADMINISTRADOR_EMPRESA) {
    const rel = await prisma.userCompany.findFirst({
      where: { user_id: session.sub, company_id },
    })
    if (!rel) {
      return NextResponse.json({ error: "Empresa no asignada a este usuario" }, { status: 403 })
    }
  }

  /* ----------- creación ----------- */
  try {
    const pde = await prisma.deliveryPoints.create({
      data: { 
        id: randomUUID(),
        ...body,
        active: true,
      },
      select: baseSelect,
    })

    return NextResponse.json(pde, { status: 201 })
  } catch (err: any) {
    console.error("POST /api/pdes STACK:\n", err?.stack || err)
    return NextResponse.json({ error: "Error al crear PdE" }, { status: 500 })
  }
}
