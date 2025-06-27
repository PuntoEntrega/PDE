import { NextResponse, NextRequest } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(
    req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: pdeId } = await params

  try {
    const pde = await prisma.deliveryPoints.findUnique({
      where: { id: pdeId },
      include: {
        company: {
          select: {
            trade_name: true,
            logo_url: true,
            company_type: true,
            active: true
          }
        }
      },  
    })

    if (!pde) {
      return NextResponse.json({ error: "PDE no encontrado" }, { status: 404 })
    }

    return NextResponse.json(pde, { status: 200 })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Error al obtener el PDE" },
      { status: 500 }
    )
  }
}
