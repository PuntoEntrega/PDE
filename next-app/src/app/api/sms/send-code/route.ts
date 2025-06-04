import { NextRequest, NextResponse } from "next/server"
import { sendSms } from "@/lib/messaging/sms"

const smsCodeMemoryStore = new Map<string, { code: string; expires: number }>()

function generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req: NextRequest) {
    try {
        const { phone, userId } = await req.json()

        if (!phone || !userId) {
            return NextResponse.json({ error: "Faltan datos" }, { status: 400 })
        }

        const code = generateCode()
        const expiresInMs = 5 * 60 * 1000 // 5 minutos

        // Guardar en memoria
        smsCodeMemoryStore.set(userId, { code, expires: Date.now() + expiresInMs })

        const message = `Tu código de verificación es: ${code}`
        await sendSms(`+${phone}`, message)

        return NextResponse.json({ message: "Código enviado" })
    } catch (error) {
        console.error("❌ send-code error:", error)
        return NextResponse.json({ error: "Error enviando código" }, { status: 500 })
    }
}
