import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const companySchema = z.object({
  legal_name: z.string().min(1, "El nombre legal es requerido."),
  trade_name: z.string().optional(),
  company_type: z.enum(["PdE", "Transportista"]),
  legal_id: z.string().min(1, "El ID legal es requerido."),
  fiscal_address: z.string().optional(),
  contact_email: z.string().email("Email de contacto inválido.").optional().or(z.literal("")),
  contact_phone: z.string().optional(),
  logo_url: z.string().url().optional().or(z.literal("")),
  legalRepresentative: z.object({
    full_name: z.string().min(1, "El nombre del representante es requerido."),
    document_type_id: z.string().min(1, "El tipo de documento es requerido."),
    identification_number: z.string().min(1, "El número de identificación es requerido."),
    email: z.string().email("Email del representante inválido."),
    primary_phone: z.string().min(1, "El teléfono principal es requerido."),
  }),
})

export async function GET() {
  const session = await getSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const companies = await prisma.companies.findMany({
      where: {
        owner_user_id: session.user.id,
      },
      orderBy: {
        created_at: "desc",
      },
    })
    return NextResponse.json(companies)
  } catch (error) {
    console.error("Error fetching companies:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const body = await request.json()
  const validation = companySchema.safeParse(body)

  if (!validation.success) {
    return NextResponse.json({ error: "Datos inválidos", details: validation.error.flatten() }, { status: 400 })
  }

  const { legalRepresentative, ...companyData } = validation.data

  try {
    const newCompany = await prisma.$transaction(async (tx) => {
      const company = await tx.companies.create({
        data: {
          ...companyData,
          owner_user_id: session.user.id,
          active: true,
        },
      })

      await tx.legalRepresentatives.create({
        data: {
          company_id: company.id,
          ...legalRepresentative,
        },
      })

      return company
    })

    return NextResponse.json(newCompany, { status: 201 })
  } catch (error) {
    console.error("Error creating company:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
