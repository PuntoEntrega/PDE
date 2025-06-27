export const runtime = "nodejs"
export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { sendEmailWithMandrill } from "@/lib/messaging/email"
import { notificarAdminsUnderReview } from "@/lib/helpers/notifyAdmins"
import { getAccountStatusEmail } from "@/lib/templates/emailTemplate"

export async function PATCH(
    req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id:userId } = await params; 
  const { newStatus, reason, changed_by_id } = await req.json()

  const estadosPermitidos = ["active", "inactive", "rejected", "under_review"]
  if (!estadosPermitidos.includes(newStatus))
    return NextResponse.json({ error: "Estado inválido" }, { status: 400 })

  try {
    const prevUser = await prisma.users.findUnique({ where: { id: userId } })
    if (!prevUser)
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })

    // Actualizar y guardar historial
    await prisma.$transaction([
      prisma.users.update({ where: { id: userId }, data: { status: newStatus } }),
      prisma.userStatusHistory.create({
        data: {
          user_id: userId,
          changed_by_id,
          previous_status: prevUser.status!,
          new_status: newStatus,
          reason,
        },
      }),
    ])

    // Mapeamos de código a texto en español
    const estadoTraducido: Record<string, string> = {
      active: "activa",
      under_review: "bajo revisión",
      inactive: "inactiva",
      rejected: "rechazada",
    }

    // Correo al usuario
    if (prevUser.email) {
      const html = getAccountStatusEmail({
        userFullName: `${prevUser.first_name} ${prevUser.last_name}`,
        estadoCuenta: estadoTraducido[newStatus],
        motivo: reason,
      })
      await sendEmailWithMandrill(
        prevUser.email,
        "Actualización de tu cuenta en Punto Entrega",
        html
      )
    }

    // Correo a admins si entra en revisión
    if (newStatus === "under_review") {
      await notificarAdminsUnderReview({
        first_name: prevUser.first_name!,
        last_name: prevUser.last_name!,
        email: prevUser.email ?? undefined,
        phone: prevUser.phone ?? undefined,
      })
    }

    return NextResponse.json({ message: "Estado actualizado y correos enviados" })
  } catch (err) {
    console.error("❌ change-status error:", err)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
