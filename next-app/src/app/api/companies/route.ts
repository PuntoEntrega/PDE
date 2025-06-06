// src/app/api/companies/route.ts
import { NextRequest, NextResponse } from "next/server";
import  prisma  from "@/lib/prisma";
import { uploadImageToS3 } from "@/lib/s3Uploader";
import { v4 as uuidv4 } from "uuid";
import  redis  from "@/lib/redis";  // <-- Importa el cliente Redis

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();

        // 1. Extraer datos de la empresa
        const legal_name = formData.get("legal_name") as string;
        const trade_name = formData.get("trade_name") as string;
        const legal_id = formData.get("legal_id") as string;
        const company_type = formData.get("company_type") as string;
        const fiscal_address = formData.get("fiscal_address") as string;
        const contact_email = formData.get("contact_email") as string;
        const contact_phone = formData.get("contact_phone") as string;
        const owner_user_id = formData.get("owner_user_id") as string; // ID del usuario

        // 2. Subir logo (si viene)
        const file = formData.get("avatar") as File | null;
        let logo_url: string | null = null;
        if (file && file.size) {
            const buffer = Buffer.from(await file.arrayBuffer());
            logo_url = await uploadImageToS3(buffer, file.type);
        }

        // 3. Crear registro Companies
        const companyId = uuidv4();
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
                logo_url,
                owner_user_id,
            },
        });

        // 4. Crear registro LegalRepresentatives
        const document_type_id = formData.get("document_type_id") as string;
        const identification_number = formData.get("identification_number") as string;
        const full_name = formData.get("full_name") as string;
        const email = formData.get("email") as string;
        const primary_phone = formData.get("primary_phone") as string;
        const secondary_phone = formData.get("secondary_phone") as string;

        await prisma.legalRepresentatives.create({
            data: {
                id: uuidv4(),
                company_id: companyId,
                document_type_id,
                full_name,
                identification_number,
                email,
                primary_phone,
                secondary_phone: secondary_phone || null,
            },
        });

        // 5. Guardar en Redis: clave "draft_company:{userId}" con TTL (e.g. 1 hora)
        await redis.set(
            `draft_company:${owner_user_id}`,  // clave única por usuario
            companyId,
            "EX",
            7 * 24 * 60 * 60  // Expira en 1 semana
        );

        return NextResponse.json({ success: true, companyId }, { status: 201 });
    } catch (err) {
        console.error("❌ Error creando empresa:", err);
        return NextResponse.json({ error: "Error al crear la empresa" }, { status: 500 });
    }
}
