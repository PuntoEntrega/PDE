import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Roles } from "@/lib/envRoles";

export async function GET() {
  try {
    /* ── 1. Obtener usuarios ──────────────────────────────────────────── */
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

    /* ── 2. Formatear respuesta ───────────────────────────────────────── */
    const result = users.map((u) => {
      const latest = u.UserStatusHistory_UserStatusHistory_user_idToUsers?.[0];
      return {
        id: u.id,
        name: `${u.first_name} ${u.last_name}`,
        email: u.email,
        company: "Sin empresa",
        status: u.status,
        reason: latest?.reason ?? "Sin razón registrada",
      };
    });

    /* ── 3. Siempre devuelve JSON (lista vacía o con datos) ───────────── */
    return NextResponse.json(result);
  } catch (err) {
    /* ── 4. Mostrar detalle solo en desarrollo ────────────────────────── */
    if (process.env.NODE_ENV !== "production") {
      return NextResponse.json(
        { error: "Error interno", details: String(err) },
        { status: 500 }
      );
    }

    /* ── 5. En producción, respuesta genérica ─────────────────────────── */
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
