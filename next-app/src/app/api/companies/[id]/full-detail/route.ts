// src/app/api/companies/[id]/full-detail/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
    req: NextRequest,
    context: { params: { id: string } } // ⚠️ `params` es una Promise internamente
) {
    // Aquí hacemos await a context.params antes de extraer `id`
    const { id } = await context.params;

    try {
        // 1. Buscar la compañía por ID
        const company = await prisma.companies.findUnique({
            where: { id },
            select: {
                id: true,
                legal_name: true,
                trade_name: true,
                legal_id: true,
                fiscal_address: true,
                contact_email: true,
                contact_phone: true,
                company_type: true,
                active : true,
                parent_company_id: true,
                logo_url: true,
                created_at: true,
                updated_at: true,
                        Companies: {            // campo definido en tu modelo Prisma para parent_company
          select: { legal_name: true }
        },
            },
        });

        if (!company) {
            return NextResponse.json({ error: "Compañía no encontrada" }, { status: 404 });
        }

        // 2. Buscar el representante legal asociado
        const legalRep = await prisma.legalRepresentatives.findFirst({
            where: { company_id: id },
            select: {
                id: true,
                document_type_id: true,
                full_name: true,
                identification_number: true,
                email: true,
                primary_phone: true,
                secondary_phone: true,
                created_at: true,
                updated_at: true,
                DocumentTypes:{
                    select: { name: true }
                }
            },
        });

        return NextResponse.json({ company, legalRep });
    } catch (err) {
        console.error("❌ Error en full-detail:", err);
        return NextResponse.json({ error: "Error al obtener detalles" }, { status: 500 });
    }
}
