// src/app/api/pdes/[id]/submit-review/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import prisma from "@/lib/prisma";
import { sendEmailWithMandrill } from "@/lib/messaging/email";
import { getPDEStatusEmail } from "@/lib/templates/emailPDEStatus";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; 
  const deliveryPointId = id
  const body = await req.json().catch(() => null);
  const { changed_by_id } = body || {};

  if (!deliveryPointId || !changed_by_id)
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });

  try {
    const prevPDE = await prisma.deliveryPoints.findUnique({
      where: { id: deliveryPointId },
    });

    if (!prevPDE)
      return NextResponse.json({ error: "PDE no encontrado" }, { status: 404 });

    if (prevPDE.status === "under_review")
      return NextResponse.json({ message: "Ya está en revisión" });

    await prisma.$transaction([
      prisma.deliveryPoints.update({
        where: { id: deliveryPointId },
        data: { status: "under_review" },
      }),
      prisma.deliveryPointStatusHistory.create({
        data: {
          id: uuidv4(),
          delivery_point_id: deliveryPointId,
          changed_by_id,
          previous_status: prevPDE.status ?? "draft",
          new_status: "under_review",
          reason: "Enviado a revisión",
        },
      }),
    ]);

    // Notificar a administradores del aplicativo
    const html = getPDEStatusEmail({
      tradeName: prevPDE.trade_name || prevPDE.name,
      estado: "bajo revisión",
      motivo: "Solicitud enviada por el usuario",
    });

    if (prevPDE.business_email) {
      await sendEmailWithMandrill(
        prevPDE.business_email,
        "Tu Punto de Entrega fue enviado a revisión",
        html
      );
    }

    return NextResponse.json({ message: "Enviado a revisión con éxito" });
  } catch (err) {
    console.error("Error al enviar a revisión:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
