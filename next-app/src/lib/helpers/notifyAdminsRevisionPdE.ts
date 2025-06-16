import prisma from "@/lib/prisma"
import { sendEmailWithMandrill } from "@/lib/messaging/email"
import { Roles } from "@/lib/envRoles"
import { getReviewRequestPDEEmail } from "../templates/reviewRequestPDE"

interface PDEBasicInfo {
  name: string
  trade_name?: string
  whatsapp_contact?: string
  business_email?: string
  phone?: string
}

export async function notificarAdminsRevisionPDE(pde: PDEBasicInfo) {
  const rolesNotificar = [
    Roles.OWNER_APLICATIVO,
    Roles.SUPER_ADMIN_APLICATIVO,
    Roles.SOPORTE_APLICATIVO,
  ].filter(Boolean)

  const admins = await prisma.users.findMany({
    where: {
      role_id: { in: rolesNotificar },
      email: { not: "" },
    },
    select: { email: true },
  })

  if (!admins.length) return

  const html = getReviewRequestPDEEmail({
    name: pde.name,
    tradeName: pde.trade_name,
    email: pde.business_email,
    phone: pde.whatsapp_contact,
  })

  const subject = "Nuevo Punto de Entrega en revisión - Punto Entrega"

  await Promise.all(
    admins.map(async ({ email }) => {
      try {
        await sendEmailWithMandrill(email!, subject, html)
      } catch (err) {
        console.error("✉️  Error enviando notificación PDE a", email, err)
      }
    })
  )
}
