import prisma from "@/lib/prisma"
import { sendEmailWithMandrill } from "@/lib/messaging/email"
import { Roles } from "@/lib/envRoles"

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
  ].filter(Boolean);

  const admins = await prisma.users.findMany({
    where: {
      role_id: { in: rolesNotificar },
      email:   { not: "" },
    },
    select: { email: true },
  });

  if (!admins.length) return;

  const subject = "Nueva solicitud de revisión en Punto Entrega";
  const msg = `
Hay un nuevo usuario en estado *UNDER_REVIEW*:

👤 ${user.first_name} ${user.last_name}
📧 ${user.email ?? "Sin email"}
📞 ${user.phone ?? "Sin teléfono"}

Revisa aquí: https://puntoentrega.app/admin-panel/review-users
`.trim();

  await Promise.all(
    admins.map(({ email }) =>
      sendEmailWithMandrill(email!, subject, msg).catch(e =>
        console.error("✉️  Error enviando a", email, e)
      )
    )
  );
}
