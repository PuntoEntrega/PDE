// src/app/api/sms/send-code/route.ts
import { NextRequest, NextResponse } from "next/server"
import { sendSms } from "@/lib/messaging/sms"
import { getRedisClient } from "@/lib/redis"
const redis = getRedisClient()

function generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req: NextRequest) {
    try {
        const { phone, userId } = await req.json()

        if (!phone || !userId) {
            return NextResponse.json({ error: "Faltan datos" }, { status: 400 })
        }

        const redisKey = `sms-code:${userId}`
        const ttlSeconds = 5 * 60

        // 1) ¿Ya existe un código en Redis?
        let code = await redis.get(redisKey)
        if (!code) {
            // no existe → generamos y guardamos con TTL
            code = generateCode()
            await redis.setex(redisKey, ttlSeconds, code)
        }
        // si ya existe, lo reutilizamos (no extendemos TTL)

        // 2) Enviar SMS con ese código
        const message = `Tu código de verificación es: ${code}`
        await sendSms(`+${phone}`, message)

        return NextResponse.json({ message: "Código enviado por SMS" })
    } catch (error: any) {
        console.error("❌ send-code error:", error)
        return NextResponse.json({ error: "Error enviando código" }, { status: 500 })
    }
}
