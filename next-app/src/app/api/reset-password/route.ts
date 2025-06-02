import { NextResponse } from "next/server"
import { z } from "zod"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import prisma from "@/lib/prisma"

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS || 10)

const schema = z.object({
    token: z.string(),
    newPassword: z
        .string()
        .min(8, "Debe tener al menos 8 caracteres")
        .regex(/[A-Z]/, "Debe contener al menos una letra mayúscula")
        .regex(/[a-z]/, "Debe contener al menos una letra minúscula")
        .regex(/[0-9]/, "Debe contener al menos un número")
        .regex(/[^A-Za-z0-9]/, "Debe contener al menos un carácter especial"),
})

export async function PATCH(req: Request) {
    try {
        const body = await req.json()
        const { token, newPassword } = schema.parse(body)

        const JWT_SECRET = process.env.JWT_SECRET
        if (!JWT_SECRET) throw new Error("JWT_SECRET no definido")

        let payload
        try {
            payload = jwt.verify(token, JWT_SECRET) as { sub: string }
        } catch (err) {
            return NextResponse.json({ message: "Token inválido o expirado" }, { status: 401 })
        }

        const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS)

        await prisma.users.update({
            where: { id: payload.sub },
            data: { password_hash: hashedPassword },
        })

        return NextResponse.json({ message: "Contraseña actualizada correctamente" })
    } catch (error: any) {
        console.error("❌ Error en reset-password:", error)
        return NextResponse.json({ message: error.message }, { status: 400 })
    }
}
