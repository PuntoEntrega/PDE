// src/app/api/pdes-asignables/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const companyId = req.nextUrl.searchParams.get("company_id");
    if (!companyId) return NextResponse.json({ error: "Falta company_id" }, { status: 400 });

    const validCompany =
        session.level === 4
            ? await prisma.companies.findFirst({ where: { id: companyId, owner_user_id: session.sub } })
            : await prisma.userCompany.findFirst({ where: { user_id: session.sub, company_id: companyId } });

    if (!validCompany) return NextResponse.json({ error: "No autorizado para esta empresa" }, { status: 403 });

    const pdvs = await prisma.deliveryPoints.findMany({
        where: { company_id: companyId, active: true },
        select: { id: true, name: true }
    });

    return NextResponse.json({ pdvs });
}
