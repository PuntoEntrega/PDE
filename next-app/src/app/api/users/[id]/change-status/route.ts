// src/app/api/users/[id]/change-status/route.ts

import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { sendEmailWithMandrill } from "@/lib/messaging/email"

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = params.id
  const body = await req.json()
  const { newStatus, reason, changed_by_id } = body

  const estadosPermitidos = ["active", "inactive", "rejected", "under_review"]
  if (!estadosPermitidos.includes(newStatus)) {
    return NextResponse.json({ error: "Estado inválido" }, { status: 400 })
  }

  try {
    const prevUser = await prisma.users.findUnique({ where: { id: userId } })
    if (!prevUser) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    await prisma.users.update({
      where: { id: userId },
      data: { status: newStatus },
    })

    await prisma.userStatusHistory.create({
      data: {
        user_id: userId,
        changed_by_id,
        previous_status: prevUser.status,
        new_status: newStatus,
        reason,
      }
    })

    // 📬 Envío de correo si tiene email
    if (prevUser.email) {
      const subject = "Actualización sobre tu cuenta en Punto Entrega"
      const msg = `
Hola ${prevUser.first_name} ${prevUser.last_name},

Tu cuenta ha sido actualizada al estado: *${newStatus.toUpperCase()}*.

Motivo: ${reason || "No se indicó una razón"}

Gracias por utilizar Punto Entrega.
      `
      await sendEmailWithMandrill(prevUser.email, subject, msg.trim())
    }

    return NextResponse.json({ message: "Estado actualizado y correo enviado" })
  } catch (err) {
    console.error("❌ Error al cambiar estado del usuario:", err)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
