// src/app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { uploadImageToS3 } from "@/lib/s3Uploader";
import jwt from "jsonwebtoken";

export async function PATCH(
  req: NextRequest,
   { params }: { params: Promise<{ id: string }> }    //  ✅  ya no es Promise
) {
  const { id } = await params;

  try {
    const formData = await req.formData();
    const username = formData.get("username") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const file = formData.get("avatar") as File | null;

    let avatar_url: string | undefined;
    if (file && file.size) {
      const buffer = Buffer.from(await file.arrayBuffer());
      avatar_url = await uploadImageToS3(buffer, file.type);
    }

    const dataToUpdate: any = { username, email, phone };
    if (avatar_url) dataToUpdate.avatar_url = avatar_url;

    const updatedUser = await prisma.users.update({
      where: { id },
      data: dataToUpdate,
      include: {
        Roles: {
          select: {
            name: true,
            level: true,
          },
        },
      },            // 👈  para traer nombre del rol
    });

    /* ----  Nuevo JWT  ---- */
    const JWT_SECRET = process.env.JWT_SECRET!;
    const token = jwt.sign(
      {
        sub: updatedUser.id,
        role: updatedUser.Roles?.name,
        level: updatedUser.Roles?.level,
        document_type_id: updatedUser.document_type_id,
        first_name: updatedUser.first_name,
        last_name: updatedUser.last_name,
        username: updatedUser.username,
        email: updatedUser.email,
        phone: updatedUser.phone,
        avatar_url: updatedUser.avatar_url,
        active: updatedUser.active,
        created_at: updatedUser.created_at,
        verified:   updatedUser.verified,
        updated_at: updatedUser.updated_at,
        identification_number: updatedUser.identification_number,
      },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    return NextResponse.json({ token }, { status: 200 });
  } catch (err) {
    console.error("PATCH user error:", err);
    return NextResponse.json({ error: "Error actualizando usuario" }, { status: 500 });
  }
}
