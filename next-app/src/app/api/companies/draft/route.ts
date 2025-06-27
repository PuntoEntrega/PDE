// src/app/api/companies/draft/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getRedisClient } from "@/lib/redis"
const redis = getRedisClient()

export async function GET(req: NextRequest) {
    // Se espera la query param ?user_id={user.sub}
    const userId = req.nextUrl.searchParams.get("user_id");
    if (!userId) {
        return NextResponse.json({ error: "Falta user_id en la query" }, { status: 400 });
    }

    const companyId = await redis.get(`draft_company:${userId}`);
    return NextResponse.json({ companyId });
}
