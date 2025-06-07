// src/app/api/users/review-list/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    console.log("→ review-list: inicio");

    const users = await prisma.users.findMany({
      where: { role_id: "033f8ffs-3baf-11f0-b6be-02420a0b0004" },
      include: {
        /* 1️⃣  nombre EXACTO de la relación en tu modelo Users */
        Companies: {               // ← plural, tal cual figura arriba
          select: { legal_name: true }
        },
        /* 2️⃣  nombre EXACTO del array de historial */
        UserStatusHistory_UserStatusHistory_user_idToUsers: {
          orderBy: { created_at: "desc" },
          take: 1
        }
      },
      orderBy: { first_name: "asc" }
    });

    console.log("→ filas encontradas:", users.length);

    const result = users.map(u => {
      const latest =
        u.UserStatusHistory_UserStatusHistory_user_idToUsers?.[0];
      return {
        id: u.id,
        name: `${u.first_name} ${u.last_name}`,
        email: u.email,
        company: u.Companies?.legal_name ?? "Sin empresa",
        status: u.status,
        reason: latest?.reason ?? "Sin razón registrada"
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
