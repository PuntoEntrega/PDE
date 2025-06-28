// src/app/api/pdes/[id]/change-status/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendEmailWithMandrill } from "@/lib/messaging/email";
import { getPDEStatusEmail } from "@/lib/templates/emailPDEStatus";
import { v4 as uuidv4 } from "uuid"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const deliveryPointId = id

  // 🔍 Validación explícita de ID
  if (!deliveryPointId) {
    return NextResponse.json({ error: "ID de PDE no recibido" }, { status: 400 });
  }

  console.log("📦 deliveryPointId recibido:", deliveryPointId);

  // ✅ Validar el cuerpo del request
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const { newStatus, reason, changed_by_id } = body;

  const ALLOWED = ["active", "inactive", "rejected", "under_review"] as const;
  if (!ALLOWED.includes(newStatus)) {
    return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
  }

  try {
    // 1. Buscar el PDE
    const prevPDE = await prisma.deliveryPoints.findUnique({
      where: { id: deliveryPointId },
    });

    if (!prevPDE) {
      return NextResponse.json({ error: "Punto de Entrega no encontrado" }, { status: 404 });
    }

    const { newStatus, reason, changed_by_id } = body as {
      newStatus: "active" | "inactive" | "under_review" | "rejected"
      reason?: string
      changed_by_id: string
    };

    // 2. Ejecutar transacción de actualización + historial
    await prisma.$transaction([
      prisma.deliveryPoints.update({
        where: { id: deliveryPointId },
        data: { status: newStatus },
      }),
      prisma.deliveryPointStatusHistory.create({
        data: {
          id: uuidv4(),
          delivery_point_id: deliveryPointId,
          changed_by_id,
          previous_status: prevPDE.status!,
          new_status: newStatus,
          reason,
        },
      }),
    ]);


    // 3. Enviar correo si hay email
    if (prevPDE.business_email) {
      const html = getPDEStatusEmail({
        tradeName: prevPDE.trade_name || prevPDE.name,
        estado: {
          active: "activo",
          under_review: "bajo revisión",
          inactive: "inactivo",
          rejected: "rechazado",
        }[newStatus],
        motivo: reason,
      });

      await sendEmailWithMandrill(
        prevPDE.business_email,
        "Actualización del estado de tu Punto de Entrega",
        html
      );
    }

    // 4. Éxito
    return NextResponse.json({ message: "Estado actualizado correctamente" });

  } catch (err: any) {
    // 👨‍💻 En desarrollo: mostrar detalles
    if (process.env.NODE_ENV !== "production") {
      if (err instanceof Error) {
        console.error("❌ Error en cambio de estado PDE:", err.message, err.stack);
      } else {
        console.error("❌ Error desconocido en cambio de estado PDE:", err);
      }
      return NextResponse.json(
        { error: "Error interno", details: String(err) },
        { status: 500 }
      );
    }

    // 🚫 En producción: mensaje genérico
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
