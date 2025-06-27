// src/app/api/roles-validos/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const roles = await prisma.roles.findMany({
        where: { level: { lt: session.level } },
        orderBy: { level: "asc" }
    });

    return NextResponse.json({ roles });
}
