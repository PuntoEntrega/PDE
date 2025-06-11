// src/app/api/companies/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { uploadImageToS3 } from "@/lib/s3Uploader";
import { v4 as uuidv4 } from "uuid";
import redis from "@/lib/redis";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();

        // ——— 1. Validación temprana de campos obligatorios —————————————————
        const requiredFields = [
            "legal_name",
            "trade_name",
            "legal_id",
            "company_type",
            "fiscal_address",
            "contact_email",
            "contact_phone",
            "owner_user_id",
            "document_type_id",
            "full_name",
            "identification_number",
            "email",
            "primary_phone",
        ];
        for (const field of requiredFields) {
            const val = formData.get(field);
            if (!val || typeof val !== "string" || val.trim() === "") {
                return NextResponse.json(
                    { error: `El campo '${field}' es obligatorio.` },
                    { status: 400 }
                );
            }
        }

        // ——— 2. Extraer datos de la empresa —————————————————————————————
        const legal_name = formData.get("legal_name") as string;
        const trade_name = formData.get("trade_name") as string;
        const legal_id = formData.get("legal_id") as string;
        const company_type = formData.get("company_type") as string;
        const fiscal_address = formData.get("fiscal_address") as string;
        const contact_email = formData.get("contact_email") as string;
        const contact_phone = formData.get("contact_phone") as string;
        const owner_user_id = formData.get("owner_user_id") as string;

        // ← Nuevo: parent_company_id opcional
        const parentRaw = formData.get("parent_company_id");
        const parent_company_id =
            typeof parentRaw === "string" && parentRaw.trim() !== ""
                ? parentRaw
                : null;

        // ——— 3. Subir logo (si viene) ————————————————————————————————
        const file = formData.get("avatar");
        let logo_url: string | null = null;
        if (file instanceof File && file.size > 0) {
            const buffer = Buffer.from(await file.arrayBuffer());
            logo_url = await uploadImageToS3(buffer, file.type);
        }

        // ——— 4. Crear registro en Companies ——————————————————————————
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
                parent_company_id, 
                logo_url,
                owner_user_id,
            },
        });

        // ——— 5. Crear registro en LegalRepresentatives ———————————————————
        const document_type_id = formData.get("document_type_id") as string;
        const full_name = formData.get("full_name") as string;
        const identification_number = formData.get("identification_number") as string;
        const email = formData.get("email") as string;
        const primary_phone = formData.get("primary_phone") as string;
        const secondary_phoneRaw = formData.get("secondary_phone");
        const secondary_phone =
            typeof secondary_phoneRaw === "string" && secondary_phoneRaw.trim() !== ""
                ? secondary_phoneRaw
                : null;

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

        // ——— 6. Guardar en Redis (draft) ————————————————————————————
        await redis.set(
            `draft_company:${owner_user_id}`,
            companyId,
            "EX",
            7 * 24 * 60 * 60 // 1 semana
        );

        return NextResponse.json({ success: true, companyId }, { status: 201 });
    } catch (err) {
        console.error(
            "❌ Error creando empresa:",
            err instanceof Error
                ? { message: err.message, stack: err.stack }
                : err
        );
        return NextResponse.json(
            { error: "Error al crear la empresa" },
            { status: 500 }
        );
    }
}
