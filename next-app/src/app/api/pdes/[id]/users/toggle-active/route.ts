import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const pdeId = params.id
  if (!pdeId) {
    return NextResponse.json({ error: "PDE ID requerido" }, { status: 400 })
  }

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 })
  }

  const { user_id, active } = body        // 🔑  usamos los mismos nombres que el front

  if (!user_id || typeof active !== "boolean") {
    return NextResponse.json({ error: "Datos faltantes" }, { status: 400 })
  }

  try {
    //  ✱  si la relación está en la tabla puente UserPde:
    const updated = await prisma.userPde.update({
      where: {
        // unique compuesta (user_id + delivery_point_id)
        user_id_delivery_point_id: { user_id, delivery_point_id: pdeId },
      },
      data: { active },
      select: { id: true, active: true },
    })

    return NextResponse.json({ success: true, updated })
  } catch (error) {
    console.error("Error actualizando estado del usuario:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    )
  }
}
