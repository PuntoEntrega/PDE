// src/app/api/pdes/[id]/edit/route.ts
import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const pdeId = params.id

  try {
    const body = await req.json()

    const {
      active,
      business_email,
      whatsapp_contact,
      services_json,
      schedule_json,
    } = body

    const dataToUpdate: Record<string, any> = {}

    if (typeof active === "boolean") dataToUpdate.active = active
    if (business_email !== undefined) dataToUpdate.business_email = business_email
    if (whatsapp_contact !== undefined) dataToUpdate.whatsapp_contact = whatsapp_contact
    if (services_json !== undefined) dataToUpdate.services_json = services_json
    if (schedule_json !== undefined) dataToUpdate.schedule_json = schedule_json

    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json(
        { error: "No se proporcionaron campos válidos para actualizar" },
        { status: 400 }
      )
    }

    const updatedPDE = await prisma.deliveryPoints.update({
      where: { id: pdeId },
      data: dataToUpdate,
    })

    return NextResponse.json(updatedPDE, { status: 200 })
  } catch (error) {
    console.error("❌ Error al actualizar PDE:", error)
    return NextResponse.json(
      { error: "Error al actualizar el punto de entrega" },
      { status: 500 }
    )
  }
}
