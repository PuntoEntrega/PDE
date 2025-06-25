import prisma from "@/lib/prisma";
import { sendEmailWithMandrill } from "@/lib/messaging/email";
import { Roles } from "@/lib/envRoles";
import { getCompanyUnderReviewEmail } from "../templates/newCompanyUnderReview";

export async function notifyAdminsCompanyReview(company: {
  legal_name: string;
  trade_name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
}) {
  const admins = await prisma.users.findMany({
    where: {
      role_id: { in: [Roles.OWNER_APLICATIVO, Roles.SUPER_ADMIN_APLICATIVO, Roles.SOPORTE_APLICATIVO] },
      email: { not: "" },
    },
    
    select: { email: true },
  });
  

  if (!admins.length) return;
  

  const html = getCompanyUnderReviewEmail(company);
  await Promise.all(
    admins.map(({ email }) =>
      sendEmailWithMandrill(email!, "Nueva empresa bajo revisión", html)
    )
  );
}
