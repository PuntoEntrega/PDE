// src/app/api/users/[id]/submit-review/route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = params.id;

  try {
    const body = await req.json();
    const { reason, changed_by_id } = body;

    if (!reason || !changed_by_id) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    // Obtener el usuario
    const user = await prisma.users.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    if (user.status !== "draft") {
      return NextResponse.json({ error: "El usuario ya no está en estado draft" }, { status: 400 });
    }

    // Actualizar estado del usuario a 'under_review'
    await prisma.users.update({
      where: { id: userId },
      data: { status: "under_review" }
    });

    // Insertar en UserStatusHistory
    await prisma.userStatusHistory.create({
      data: {
        user_id: userId,
        changed_by_id,
        previous_status: "draft",
        new_status: "under_review",
        reason,
      }
    });

    return NextResponse.json({ message: "Usuario enviado a revisión" }, { status: 200 });

  } catch (error) {
    console.error("❌ Error al enviar a revisión:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
