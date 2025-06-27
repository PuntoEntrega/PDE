import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { uploadImageToS3 } from "@/lib/s3Uploader"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: userId } = await params; 

    try {
        const formData = await req.formData()
        const first_name = formData.get("first_name") as string
        const last_name = formData.get("last_name") as string
        const username = formData.get("username") as string
        const phone = formData.get("phone") as string
        const status = formData.get("status") || "active"
        const verified = formData.get("verified") === "true"
        const file = formData.get("avatar") as File | null

        if (!first_name || !last_name || !phone || !verified) {
            return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 })
        }

        let avatar_url
        if (file && file.size > 0) {
            const buffer = Buffer.from(await file.arrayBuffer())
            avatar_url = await uploadImageToS3(buffer, file.type)
        }

        const dataToUpdate: any = {
            first_name,
            last_name,
            phone,
            verified,
            status,
        }

        if (username) dataToUpdate.username = username
        if (avatar_url) dataToUpdate.avatar_url = avatar_url

        await prisma.users.update({
            where: { id: userId },
            data: dataToUpdate,
        })

        return NextResponse.json({ message: "Usuario actualizado correctamente" })
    } catch (err) {
        console.error("Error en complete-registration:", err)
        return NextResponse.json({ error: "Error procesando el registro" }, { status: 500 })
    }
}
