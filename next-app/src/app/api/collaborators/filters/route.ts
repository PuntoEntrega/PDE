import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth"

export async function GET(_: NextRequest) {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const userId = session.sub
    const userLevel = session.level

    // 1️⃣ Roles permitidos
    const roles = await prisma.roles.findMany({
        where: { level: { lte: userLevel } },
        select: { id: true, name: true, level: true },
        orderBy: { level: "asc" }
    })

    // 2️⃣ Estados únicos (basados en usuarios relacionados)
    let companyIds: string[] = []

    if (userLevel === 4) {
        const companies = await prisma.companies.findMany({
            where: { owner_user_id: userId },
            select: { id: true }
        })
        companyIds = companies.map(c => c.id)
    } else {
        const rels = await prisma.userCompany.findMany({
            where: { user_id: userId },
            select: { company_id: true }
        })
        companyIds = rels.map(r => r.company_id)
    }

    const users = await prisma.userCompany.findMany({
        where: { company_id: { in: companyIds } },
        select: { Users: { select: { status: true } } }
    })

    const statuses = Array.from(new Set(users.map(u => u.Users.status))).filter(Boolean)

    // 3️⃣ Empresas visibles
    const companies = await prisma.companies.findMany({
        where: { id: { in: companyIds } },
        select: { id: true, trade_name: true }
    })

    return NextResponse.json({
        roles,
        statuses,
        companies: companies.map(c => ({ id: c.id, name: c.trade_name }))
    })
}
