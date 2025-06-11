// src/app/api/companies/parent-options/route.ts
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
    try {
        const companies = await prisma.companies.findMany({
            select: {
                id: true,
                legal_name: true,
            },
        })

        return NextResponse.json(
            companies.map((c) => ({ id: c.id, name: c.legal_name }))
        )
    } catch (error) {
        console.error("Error al cargar empresas madre", error)
        return NextResponse.json({ error: "Error interno" }, { status: 500 })
    }
}
