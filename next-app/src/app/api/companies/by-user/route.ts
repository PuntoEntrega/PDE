// src/app/api/companies/by-user/route.ts
import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(req: NextRequest) {
    try {
        const userId = req.nextUrl.searchParams.get("user_id")
        if (!userId) {
            return NextResponse.json({ error: "Falta user_id" }, { status: 400 })
        }

        const companies = await prisma.companies.findMany({
            where: { owner_user_id: userId },
            include: {
                LegalRepresentatives: true,  // ← rename aquí
            },
        })

        return NextResponse.json(companies)
    } catch (err) {
        console.log("Error en GET /api/companies/by-user:\n", (err as Error).stack)
        return NextResponse.json({ error: "Error interno" }, { status: 500 })
    }
}
