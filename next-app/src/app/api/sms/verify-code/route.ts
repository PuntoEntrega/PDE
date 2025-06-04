// src/app/api/sms/verify-code/route.ts
import { NextResponse } from "next/server"
import { redis } from "@/lib/redis"
import prisma from "@/lib/prisma"

interface VerifyCodeBody {
    userId: string
    code: string
}

export async function POST(req: Request) {
    try {
        const { userId, code } = (await req.json()) as VerifyCodeBody
        if (!userId || !code) {
            return NextResponse.json({ message: "Parámetros faltantes" }, { status: 400 })
        }

        // 1. Leer código almacenado en Redis
        const key = `sms:${userId}`
        const storedCode = await redis.get(key)

        if (!storedCode) {
            return NextResponse.json({ message: "Código expirado o inexistente" }, { status: 400 })
        }
        if (storedCode !== code) {
            return NextResponse.json({ message: "Código inválido" }, { status: 401 })
        }

        // 2. Borrar clave para que no se reutilice
        await redis.del(key)

        // 3. Actualizar campo `verified = true` en Users
        const updatedUser = await prisma.users.update({
            where: { id: userId },
            data: { verified: true },
        })

        return NextResponse.json({
            message: "Número verificado con éxito",
            user: updatedUser,
        })
    } catch (err: any) {
        console.error("❌ verify-code error:", err)
        return NextResponse.json({ message: err.message || "Error interno" }, { status: 500 })
    }
}
