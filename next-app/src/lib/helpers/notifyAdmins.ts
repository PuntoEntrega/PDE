import prisma from "@/lib/prisma"
import { sendEmailWithMandrill } from "@/lib/messaging/email"
import { Roles } from "@/lib/envRoles"
import { getReviewRequestEmail } from "../templates/reviewRequestAdmin"

interface UserBasicInfo {
  first_name: string
  last_name: string
  email?: string
  phone?: string
}

export async function notificarAdminsUnderReview(user: UserBasicInfo) {
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

  const html = getReviewRequestEmail({
    fullName: `${user.first_name} ${user.last_name}`,
    email: user.email,
    phone: user.phone,
  })

  const subject = "Nueva solicitud de revisión en Punto Entrega"

  await Promise.all(
    admins.map(async ({ email }) => {
      try {
        await sendEmailWithMandrill(email!, subject, html)
      } catch (err) {
        console.error("✉️  Error enviando a", email, err)
      }
    })
  )
}
