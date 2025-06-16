// src/app/api/companies/[id]/change-status/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendEmailWithMandrill } from "@/lib/messaging/email";
import { getCompanyStatusEmail } from "@/lib/templates/emailCompanyStatus";
import { notifyAdminsCompanyReview } from "@/lib/helpers/notifyAdminsCompany";
import { v4 as uuidv4 } from "uuid"

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Paso 1: Body recibido
    let body;
    try {
      body = await req.json();
      console.log("[PATCH] Body recibido:", body);
    } catch (err) {
      console.error("❌ Error parseando body:", err);
      return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
    }

    const { newStatus, reason, changed_by_id } = body;
    if (!newStatus || !changed_by_id) {
      console.warn("⚠️ Faltan campos requeridos:", { newStatus, changed_by_id });
      return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 });
    }

    // Paso 2: Buscar la empresa
    const companyId = params.id;
    console.log("[PATCH] companyId:", companyId);
    const company = await prisma.companies.findUnique({
      where: { id: companyId },
    });
    console.log("[PATCH] Empresa encontrada:", company);

    if (!company) {
      return NextResponse.json({ error: "Empresa no encontrada" }, { status: 404 });
    }

    const previousStatus = company.status;

    // Paso 3: Actualizar estado
    try {
      const upd = await prisma.companies.update({
        where: { id: companyId },
        data: { status: newStatus },
      });
      console.log("[PATCH] Estado actualizado:", upd.status);
    } catch (err) {
      console.error("❌ Error actualizando estado de empresa:", err);
      throw err;
    }

    console.log("[PATCH] Objeto historial:", {
      company_id: companyId,
      changed_by_id,
      previous_status: previousStatus,
      new_status: newStatus,
      reason,
    });

    if (!companyId || !changed_by_id || !previousStatus || !newStatus) {
      console.error("[PATCH] Algún campo para el historial viene vacío o undefined.");
      return NextResponse.json({ error: "Campos requeridos faltantes para historial" }, { status: 400 });
    }

    // Paso 4: Guardar historial
    try {
      const hist = await prisma.companyStatusHistory.create({
        data: {
          id: uuidv4(),
          company_id: companyId,
          changed_by_id,
          previous_status: previousStatus,
          new_status: newStatus,
          reason,
        },
      });
      console.log("[PATCH] Historial guardado:", hist.id);
    } catch (err) {
      console.error("❌ Error guardando historial:", err);
      throw err;
    }

    // Paso 5: Notificar al usuario (si tiene correo)
    if (company.contact_email) {
      try {
        const html = getCompanyStatusEmail({
          legalName: company.legal_name,
          estado: newStatus,
          motivo: reason,
        });
        await sendEmailWithMandrill(
          company.contact_email,
          `Estado de tu empresa: ${newStatus}`,
          html
        );
        console.log("[PATCH] Email enviado a usuario:", company.contact_email);
      } catch (err) {
        console.error("❌ Error enviando correo al usuario:", err);
      }
    }

    // Paso 6: Notificar a los administradores si está en revisión
    if (newStatus === "under_review") {
      try {
        await notifyAdminsCompanyReview({
          legal_name: company.legal_name,
          trade_name: company.trade_name,
          contact_email: company.contact_email,
          contact_phone: company.contact_phone,
        });
        console.log("[PATCH] Notificación enviada a administradores.");
      } catch (err) {
        console.error("❌ Error notificando a admins:", err);
      }
    }

    console.log("[PATCH] Fin OK");
    return NextResponse.json({ success: true });
  } catch (err) {
    // Captura el error real y su stack
    const safeErr = err ?? "(null error thrown)";
    console.error("❌ Error cambiando estado de empresa:", safeErr, safeErr?.stack);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
