// src/app/api/login/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { compare } from "bcrypt";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";
import { prisma } from "../../../../lib/prisma";

export async function POST(req: NextRequest) {
  console.log("🔌 DATABASE_URL:", !!process.env.DATABASE_URL);
  try {
    const { username, password } = await req.json();

    // 1. Busca el usuario y su rol
    const user = await prisma.users.findFirst({
      where: {
        OR: [{ username }, { email: username }],
      },
      include: { Roles: true },
    });
    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 401 }
      );
    }

    // 2. Compara contraseña
    const valid = await compare(password, user.password_hash);
    console.log(
      "typeof password:",
      typeof password,
      "typeof hash:",
      typeof user.password_hash
    );

    if (!valid) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    // 3. Genera el JWT con info mínima
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      throw new Error("❌ JWT_SECRET no está definido en el entorno.");
    }

    const token = jwt.sign(
      {
        sub: user.id,
        role: user.Roles?.name,
        level: user.Roles?.level,
        document_type_id: user.document_type_id,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        avatar_url: user.avatar_url,
        status: user.status,
        active: user.active,
        verified: user.verified,
        created_at: user.created_at,
        updated_at: user.updated_at,
        identification_number: user.identification_number,
      },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    // 4. Serializa cookie HTTP-only
    const cookie = serialize("token", token, {
      httpOnly: true,
      path: "/",
      maxAge: 8 * 60 * 60, // 8 horas en segundos
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    // 5. Devuelve el token en el body y añade la cabecera Set-Cookie
    return NextResponse.json(
      { token },
      {
        status: 200,
        headers: {
          "Set-Cookie": cookie,
        },
      }
    );
  } catch (err: any) {
    console.error("LOGIN ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Error desconocido" },
      { status: 500 }
    );
  }
}
