import { NextResponse } from "next/server"
import { z } from "zod"
import prisma from "@/lib/prisma"
import jwt from "jsonwebtoken"
import { sendEmailWithMandrill } from "@/lib/messaging/email"
import { getResetPasswordEmailHTML } from "@/lib/templates/resetPasswordEmail"

const schema = z.object({
    username: z.string().min(1, "El usuario es requerido"),
})

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { username } = schema.parse(body)

        const user = await prisma.users.findFirst({
            where: {
                OR: [
                    { username: username },
                    { email: username },
                ],
            },
        })

        if (!user || !user.email) {
            return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 })
        }

        const token = jwt.sign(
            {
                sub: user.id,
                email: user.email,
            },
            process.env.JWT_SECRET!,
            { expiresIn: "30m" }
        )

        const resetUrl = `${process.env.APP_URL}/reset-password?token=${token}`

        const html = getResetPasswordEmailHTML({
            username: user.username,
            resetUrl,
        })

        await sendEmailWithMandrill(
            user.email,
            "Recuperación de contraseña - Punto Entrega",
            html
        )

        return NextResponse.json({ message: "Correo enviado con instrucciones de recuperación" })
    } catch (error: any) {
        console.error("❌ Error en forgot-password:", error)
        return NextResponse.json({ message: error.message }, { status: 400 })
    }
}
