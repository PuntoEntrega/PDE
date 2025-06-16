// api/pdes/review-list/route.ts 
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
    try {
        const pdes = await prisma.deliveryPoints.findMany({
            where: {
                status: {
                    in: ["under_review", "rejected", "inactive", "active"],
                },
            },
            select: {
                id: true,
                name: true,
                trade_name: true,
                business_email: true,
                whatsapp_contact: true,
                status: true,

                // Si quieres mostrar a futuro datos adicionales como:
                // company_id: true,
                // global_company_context_id: true,
            },
            orderBy: {
                created_at: "desc",
            },
        })

        return NextResponse.json(pdes)
    } catch (error) {
        console.error("❌ Error obteniendo PDEs para revisión:", error)
        return NextResponse.json(
            { error: "Error interno al listar puntos de entrega" },
            { status: 500 }
        )
    }
}
