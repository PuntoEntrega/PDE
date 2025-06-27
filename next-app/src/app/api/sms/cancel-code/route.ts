// src/app/api/sms/cancel-code/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getRedisClient } from "@/lib/redis"
const redis = getRedisClient()

export async function POST(req: NextRequest) {
    try {
        const { userId } = await req.json()
        if (!userId) {
            return NextResponse.json({ message: "Falta userId" }, { status: 400 })
        }

        const redisKey = `sms-code:${userId}`
        await redis.del(redisKey)

        return NextResponse.json({ message: "Código cancelado" })
    } catch (error: any) {
        console.error("❌ cancel-code error:", error)
        return NextResponse.json({ message: "Error interno" }, { status: 500 })
    }
}
