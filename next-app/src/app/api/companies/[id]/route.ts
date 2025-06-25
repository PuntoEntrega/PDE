// src/app/api/companies/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { uploadImageToS3 } from "@/lib/s3Uploader"
import redis from "@/lib/redis"

export async function PATCH(
    req: NextRequest,
    context: { params: { id: string } }   // ✔ evita el warning
) {
    const companyId = context.params.id
    console.log("🔑 companyId:", companyId)

    try {
        const contentType = req.headers.get("content-type") || ""
        console.log("📝 Content-Type:", contentType)

        /* ╭─ 1.  PATCH JSON → togglear campo `active` ───────────────────────── */
        if (contentType.includes("application/json")) {
            let body: any = null
            try {
                body = await req.json()
            } catch {
                body = null
            }

            if (!body || typeof body.active !== "boolean") {
                console.warn("⚠️ JSON inválido | body:", body)
                return NextResponse.json({ error: "Campo 'active' inválido" }, { status: 400 })
            }

            const updated = await prisma.companies.update({
                where: { id: companyId },
                data: { active: body.active },
            })

            return NextResponse.json(updated, { status: 200 })
        }

        /* ╭─ 2.  PATCH multipart → edición completa ────────────────────────── */
        const formData = await req.formData()

        /* 2.1  Campos principales ------------------------------------------- */
        const legal_name = formData.get("legal_name") as string | null
        const trade_name = formData.get("trade_name") as string | null
        const legal_id = formData.get("legal_id") as string | null
        const company_type = formData.get("company_type") as string | null
        const fiscal_address = formData.get("fiscal_address") as string | null
        const contact_email = formData.get("contact_email") as string | null
        const contact_phone = formData.get("contact_phone") as string | null

        /* 2.2  Logo ---------------------------------------------------------- */
        const file = formData.get("avatar") as File | null
        let logo_url: string | undefined
        if (file && file.size) {
            try {
                const buffer = Buffer.from(await file.arrayBuffer());
                logo_url = await uploadImageToS3(buffer, file.type);
            } catch (e) {
                console.warn("⚠️  Falló subida a S3:", e);
            }
        }

        /* 2.3  Armar `data` solo con campos presentes ----------------------- */
        const dataToUpdate: Record<string, any> = {}
        if (legal_name !== null) dataToUpdate.legal_name = legal_name
        if (trade_name !== null) dataToUpdate.trade_name = trade_name
        if (legal_id !== null) dataToUpdate.legal_id = legal_id
        if (company_type !== null) dataToUpdate.company_type = company_type
        if (fiscal_address !== null) dataToUpdate.fiscal_address = fiscal_address
        if (contact_email !== null) dataToUpdate.contact_email = contact_email
        if (contact_phone !== null) dataToUpdate.contact_phone = contact_phone
        if (logo_url) dataToUpdate.logo_url = logo_url

        const updatedCompany = await prisma.companies.update({
            where: { id: companyId },
            data: dataToUpdate,
        })
        console.log("🏢 Empresa actualizada:", updatedCompany.id)

        /* 2.4  Representante legal ------------------------------------------ */
        const document_type_id = formData.get("document_type_id") as string | null
        const full_name = formData.get("full_name") as string | null
        const identification_number = formData.get("identification_number") as string | null
        const emailRep = formData.get("email") as string | null
        const primary_phone = formData.get("primary_phone") as string | null
        const secondary_phoneRaw = formData.get("secondary_phone") as string | null
        const secondary_phone = secondary_phoneRaw?.trim() || null

        const legRep = await prisma.legalRepresentatives.findFirst({
            where: { company_id: companyId },
            select: { id: true },
        })

        if (legRep) {
            const repData: Record<string, any> = {}
            if (document_type_id !== null) repData.document_type_id = document_type_id
            if (full_name !== null) repData.full_name = full_name
            if (identification_number !== null) repData.identification_number = identification_number
            if (emailRep !== null) repData.email = emailRep
            if (primary_phone !== null) repData.primary_phone = primary_phone
            if (secondary_phoneRaw !== null) repData.secondary_phone = secondary_phone

            await prisma.legalRepresentatives.update({
                where: { id: legRep.id },
                data: repData,
            })
            console.log("👤 Representante legal actualizado:", legRep.id)
        }

        /* 2.5  TTL Redis ------------------------------------------ */
        if (updatedCompany.owner_user_id) {
            await redis.expire(
                `draft_company:${updatedCompany.owner_user_id}`,
                24 * 60 * 60,
            );
        }

        return NextResponse.json({ success: true }, { status: 200 })

    } catch (err) {
        const safeErr = (err instanceof Error)
            ? { message: err.message, stack: err.stack }
            : { error: err ?? "(null error thrown)" };

        console.error("❌ Error en PATCH /api/companies/[id]:", JSON.stringify(safeErr, null, 2));

        return NextResponse.json(
            { error: "Hubo un error al actualizar la empresa." },
            { status: 500 }
        );
    }
}
