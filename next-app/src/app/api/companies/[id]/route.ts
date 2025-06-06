// src/app/api/companies/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { uploadImageToS3 } from "@/lib/s3Uploader"
import redis from "@/lib/redis"

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const { id: companyId } = params

    try {
        const formData = await req.formData()

        // 1. Campos de Companies que podemos actualizar
        const legal_name = formData.get("legal_name") as string | null
        const trade_name = formData.get("trade_name") as string | null
        const legal_id = formData.get("legal_id") as string | null
        const company_type = formData.get("company_type") as string | null
        const fiscal_address = formData.get("fiscal_address") as string | null
        const contact_email = formData.get("contact_email") as string | null
        const contact_phone = formData.get("contact_phone") as string | null

        // 2. Logo (si se envió uno nuevo)
        const file = formData.get("avatar") as File | null
        let logo_url: string | undefined = undefined
        if (file && file.size) {
            const buffer = Buffer.from(await file.arrayBuffer())
            logo_url = await uploadImageToS3(buffer, file.type)
        }

        // 3. Construir objeto "data" para actualizar Companies
        const dataToUpdate: any = {}
        if (legal_name !== null) dataToUpdate.legal_name = legal_name
        if (trade_name !== null) dataToUpdate.trade_name = trade_name
        if (legal_id !== null) dataToUpdate.legal_id = legal_id
        if (company_type !== null) dataToUpdate.company_type = company_type
        if (fiscal_address !== null) dataToUpdate.fiscal_address = fiscal_address
        if (contact_email !== null) dataToUpdate.contact_email = contact_email
        if (contact_phone !== null) dataToUpdate.contact_phone = contact_phone
        if (logo_url) dataToUpdate.logo_url = logo_url

        // 4. Actualizar la fila de Companies
        const updatedCompany = await prisma.companies.update({
            where: { id: companyId },
            data: dataToUpdate,
        })

        // 5. Campos de LegalRepresentatives para actualizar
        //    (asumimos que solo hay UN representante para esta compañía;
        //     si hay varios, tendrías que enviar el ID del representante o buscarlo primero)
        const document_type_id = formData.get("document_type_id") as string | null
        const full_name = formData.get("full_name") as string | null
        const identification_number = formData.get("identification_number") as string | null
        const email = formData.get("email") as string | null
        const primary_phone = formData.get("primary_phone") as string | null
        const secondary_phone = formData.get("secondary_phone") as string | null

        // 5a. Primero hallamos el representante existente (findFirst, asumiendo que es uno solo)
        const existingLegalRep = await prisma.legalRepresentatives.findFirst({
            where: { company_id: companyId },
            select: { id: true },
        })

        if (existingLegalRep) {
            const dataRepToUpdate: any = {}
            if (document_type_id !== null) dataRepToUpdate.document_type_id = document_type_id
            if (full_name !== null) dataRepToUpdate.full_name = full_name
            if (identification_number !== null)
                dataRepToUpdate.identification_number = identification_number
            if (email !== null) dataRepToUpdate.email = email
            if (primary_phone !== null) dataRepToUpdate.primary_phone = primary_phone
            // Si user envía cadena vacía, seteamos null; de lo contrario, actualizamos
            if (secondary_phone !== null) {
                dataRepToUpdate.secondary_phone = secondary_phone || null
            }

            await prisma.legalRepresentatives.update({
                where: { id: existingLegalRep.id },
                data: dataRepToUpdate,
            })
        }

        // 6. (Opcional) Resetear TTL o actualizar alguna marca en Redis
        //    — Por ejemplo, si quieres que tras editar se siga considerando draft, puedes refrescar TTL:
        await redis.expire(`draft_company:${updatedCompany.owner_user_id}`, 24 * 60 * 60)

        return NextResponse.json({ success: true }, { status: 200 })
    } catch (err) {
        console.error("❌ Error en PATCH /api/companies/[id]:", err)
        return NextResponse.json(
            { error: "Hubo un error al actualizar la empresa." },
            { status: 500 }
        )
    }
}
