// src/app/api/complete-registration/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export async function PATCH(req: NextRequest) {
    const body = await req.json();
    const {
        token,
        document_type_id,
        identification_number,
        first_name,
        last_name,
        phone,
        new_password,
    } = body;

    if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

    let decoded: any = null;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET!);
    } catch (err) {
        return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    const userId = decoded.sub;

    const user = await prisma.users.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const password_hash = await bcrypt.hash(new_password, 10);

    await prisma.users.update({
        where: { id: userId },
        data: {
            document_type_id,
            identification_number,
            first_name,
            last_name,
            phone,
            password_hash,
            verified: true,
            status: "active",
            updated_at: new Date(),
        },
    });

    return NextResponse.json({ success: true });
}
