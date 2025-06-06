import { NextRequest, NextResponse } from "next/server"
import redis from "@/lib/redis"
import prisma from "@/lib/prisma"
import jwt from "jsonwebtoken"

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { userId, code } = body

        if (!userId || !code) {
            return NextResponse.json({ message: "Faltan campos requeridos" }, { status: 400 })
        }

        const redisKey = `sms-code:${userId}`
        const storedCode = await redis.get(redisKey)

        if (!storedCode) {
            return NextResponse.json({ message: "Código expirado o no encontrado" }, { status: 410 })
        }

        if (storedCode !== code) {
            return NextResponse.json({ message: "Código incorrecto" }, { status: 401 })
        }

        // Eliminar el código de Redis
        await redis.del(redisKey)

        // Actualizar el campo `verified` en la base de datos
        const updatedUser = await prisma.users.update({
            where: { id: userId },
            data: { verified: true },
        })

        // Generar nuevo token JWT con la info actualizada
        const JWT_SECRET = process.env.JWT_SECRET
        if (!JWT_SECRET) throw new Error("JWT_SECRET no definido")

        const token = jwt.sign(
            {
                sub: updatedUser.id,
                role: updatedUser.role_id,
                document_type_id: updatedUser.document_type_id,
                identification_number: updatedUser.identification_number,
                first_name: updatedUser.first_name,
                last_name: updatedUser.last_name,
                username: updatedUser.username,
                email: updatedUser.email,
                phone: updatedUser.phone,
                avatar_url: updatedUser.avatar_url,
                status: updatedUser.status,
                active: updatedUser.active,
                created_at: updatedUser.created_at,
                updated_at: updatedUser.updated_at,
                verified: true,                // ← Asegúrate de incluir esto
            },
            JWT_SECRET,
            { expiresIn: "3d" }
        )

        // ← Devuelve aquí TANTO `updatedUser` COMO `token`
        return NextResponse.json({
            message: "Código verificado exitosamente",
            user: updatedUser,
            token,
        }, { status: 200 })

    } catch (error) {
        console.error("❌ Error en /api/sms/verify-code:", error)
        return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 })
    }
}
