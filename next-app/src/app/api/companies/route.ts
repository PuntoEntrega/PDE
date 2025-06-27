import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { uploadImageToS3 } from "@/lib/s3Uploader"
import { v4 as uuidv4 } from "uuid"
import { getRedisClient } from "@/lib/redis"
const redis = getRedisClient()
import { getCompanyStatusEmail } from "@/lib/templates/emailCompanyStatus"
import { notifyAdminsCompanyReview } from "@/lib/helpers/notifyAdminsCompany"
import { sendEmailWithMandrill } from "@/lib/messaging/email"
import { randomUUID } from "crypto"
import { _uuidv4 } from "zod/v4/core"

export async function POST(req: NextRequest) {
  try {
    console.log("📥 Iniciando creación de empresa...");

    const formData = await req.formData();
    console.log("✅ formData recibido.");

    // 1. Validar campos obligatorios
    const requiredFields = [
      "legal_name", "trade_name", "legal_id", "company_type",
      "fiscal_address", "contact_email", "contact_phone", "owner_user_id",
      "document_type_id", "full_name", "identification_number", "email", "primary_phone"
    ];

    for (const field of requiredFields) {
      const val = formData.get(field);
      if (!val || typeof val !== "string" || val.trim() === "") {
        console.warn(`⚠️ Campo faltante o inválido: '${field}'`);
        return NextResponse.json({ error: `El campo '${field}' es obligatorio.` }, { status: 400 });
      }
    }

    console.log("✅ Campos requeridos validados.");

    // 2. Extraer datos principales
    const legal_name = formData.get("legal_name") as string;
    const trade_name = formData.get("trade_name") as string;
    const legal_id = formData.get("legal_id") as string;
    const company_type = formData.get("company_type") as any;
    const fiscal_address = formData.get("fiscal_address") as string;
    const contact_email = formData.get("contact_email") as string;
    const contact_phone = formData.get("contact_phone") as string;
    const owner_user_id = formData.get("owner_user_id") as string;
    const parentRaw = formData.get("parent_company_id");
    const parent_company_id = (typeof parentRaw === "string" && parentRaw.trim() !== "") ? parentRaw : null;

    console.log("📄 Datos principales extraídos.");

    // 3. Subir logo
    const file = formData.get("avatar");
    let logo_url: string | null = null;
    if (file instanceof File && file.size > 0) {
      console.log("📤 Subiendo logo a S3...");
      const buffer = Buffer.from(await file.arrayBuffer());
      logo_url = await uploadImageToS3(buffer, file.type);
      console.log("✅ Logo subido:", logo_url);
    }

    // 4. Crear empresa
    const companyId = uuidv4();
    console.log("🏢 Creando empresa con ID:", companyId);

    await prisma.companies.create({
      data: {
        id: companyId,
        legal_name,
        trade_name,
        legal_id,
        company_type,
        fiscal_address,
        contact_email,
        contact_phone,
        parent_company_id,
        logo_url,
        owner_user_id,
        status: "under_review",
      },
    });

    console.log("✅ Empresa creada.");

    // 5. Crear representante legal
    const document_type_id = formData.get("document_type_id") as string;
    const full_name = formData.get("full_name") as string;
    const identification_number = formData.get("identification_number") as string;
    const email = formData.get("email") as string;
    const primary_phone = formData.get("primary_phone") as string;
    const secondary_phoneRaw = formData.get("secondary_phone");
    const secondary_phone = (typeof secondary_phoneRaw === "string" && secondary_phoneRaw.trim() !== "")
      ? secondary_phoneRaw : null;

    await prisma.legalRepresentatives.create({
      data: {
        id: uuidv4(),
        company_id: companyId,
        document_type_id,
        full_name,
        identification_number,
        email,
        primary_phone,
        secondary_phone,
      },
    });

    console.log("👤 Representante legal creado.");

    // 6. Guardar en Redis
    await redis.set(`draft_company:${owner_user_id}`, companyId, "EX", 7 * 24 * 60 * 60);
    console.log("🧠 Redis actualizado con draft_company:", companyId);

    // 7. Notificar al dueño
    const html = getCompanyStatusEmail({ legalName: legal_name, estado: "under_review" });
    await sendEmailWithMandrill(contact_email, "Tu empresa está en revisión", html);
    console.log("📧 Correo enviado al dueño:", contact_email);

    // 8. Notificar a los administradores
    await notifyAdminsCompanyReview({
      legal_name,
      trade_name,
      contact_email,
      contact_phone,
    });
    console.log("📣 Notificación enviada a administradores.");

    // 9. Guardar historial de estado
    await prisma.companyStatusHistory.create({
      data: {
        id: uuidv4(),
        company_id: companyId,
        changed_by_id: owner_user_id,
        previous_status: "draft",
        new_status: "under_review",
        reason: "Registro inicial de la empresa",
      },
    });

    console.log("📝 Historial de estado guardado.");

    return NextResponse.json({ success: true, companyId }, { status: 201 });

  } catch (err) {
    console.error("❌ Error creando empresa:", err);
    return NextResponse.json({ error: "Error al crear la empresa" }, { status: 500 });
  }
}
