import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { uploadImageToS3 } from "@/lib/s3Uploader";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }   // 👈 params es un Promise
) {
    // 👇 Esperamos a que params se resuelva
    const { id } = await params;

    try {
        const formData = await req.formData();

        const username = formData.get("username") as string;
        const email = formData.get("email") as string;
        const phone = formData.get("phone") as string;
        const file = formData.get("avatar") as File | null;

        let avatar_url: string | undefined = undefined;

        if (file && file.size > 0) {
            const buffer = Buffer.from(await file.arrayBuffer());
            avatar_url = await uploadImageToS3(buffer, file.type);
        }

        const dataToUpdate: any = { username, email, phone };
        if (avatar_url) {
            dataToUpdate.avatar_url = avatar_url;
        }

        const updatedUser = await prisma.users.update({
            where: { id },
            data: dataToUpdate,
        });

        return NextResponse.json(updatedUser);
    } catch (error: any) {
        console.error("Error actualizando usuario:", error);
        return NextResponse.json({ error: "Error actualizando usuario" }, { status: 500 });
    }
}
