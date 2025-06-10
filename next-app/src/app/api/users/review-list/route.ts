import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Roles } from "@/lib/envRoles";


export async function GET() {
  try {
    console.log("→ review-list: solo SuperAdminEmpresa");

    const users = await prisma.users.findMany({
      where: { role_id: Roles.SUPER_ADMIN_EMPRESA },
      include: {
        Companies: { select: { legal_name: true } },
        UserStatusHistory_UserStatusHistory_user_idToUsers: {
          orderBy: { created_at: "desc" },
          take: 1,
        },
      },
      orderBy: { first_name: "asc" },
    });

    const result = users.map((u) => {
      const latest = u.UserStatusHistory_UserStatusHistory_user_idToUsers?.[0];
      return {
        id: u.id,
        name: `${u.first_name} ${u.last_name}`,
        email: u.email,
        company: u.Companies?.legal_name ?? "Sin empresa",
        status: u.status,
        reason: latest?.reason ?? "Sin razón registrada",
      };
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("❌ review-list error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error interno" },
      { status: 500 }
    );
  }
}
