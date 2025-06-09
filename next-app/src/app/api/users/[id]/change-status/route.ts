export const runtime = "nodejs"
export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { sendEmailWithMandrill } from "@/lib/messaging/email"
import { notificarAdminsUnderReview } from "@/lib/helpers/notifyAdmins"

export async function PATCH(
  req: NextRequest,
  { params: { id } }: { params: { id: string } }
) {
  const userId = id;     
  const { newStatus, reason, changed_by_id } = await req.json()

  const estadosPermitidos = ["active", "inactive", "rejected", "under_review"]
  if (!estadosPermitidos.includes(newStatus)) {
    return NextResponse.json({ error: "Estado inválido" }, { status: 400 })
  }

  try {
    // 1. Leer usuario previo
    const prevUser = await prisma.users.findUnique({
      where: { id: userId },
    })
    if (!prevUser) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // 2. Actualizar status
    await prisma.users.update({
      where: { id: userId },
      data: { status: newStatus },
    })

    // 3. Registrar en historial
    await prisma.userStatusHistory.create({
      data: {
        user_id: userId,
        changed_by_id,
        previous_status: prevUser.status!,
        new_status: newStatus,
        reason,
      },
    })

    // 4. Notificar al usuario afectado
    if (prevUser.email) {
      const subject = "Actualización sobre tu cuenta en Punto Entrega"
      const msg = `
Hola ${prevUser.first_name} ${prevUser.last_name},

Tu cuenta ha sido actualizada al estado: *${newStatus.toUpperCase()}*.

${reason ? `Motivo: ${reason}` : ""}

Gracias por utilizar Punto Entrega.
      `.trim()

      try {
        console.log("📧 Enviando correo al usuario:", prevUser.email)
        await sendEmailWithMandrill(prevUser.email, subject, msg)
      } catch (e) {
        console.error("✉️ Error enviando correo al usuario:", prevUser.email, e)
      }
    }

    // 5. Notificar a admins si entra en revisión
    if (newStatus === "under_review") {
      await notificarAdminsUnderReview({
        first_name: prevUser.first_name!,
        last_name: prevUser.last_name!,
        email: prevUser.email ?? undefined,
        phone: prevUser.phone ?? undefined,
      })
    }

    return NextResponse.json({ message: "Estado actualizado y correos enviados" })
  } catch (err: any) {
    console.error("❌ Error al cambiar estado del usuario:", err?.message ?? err)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
