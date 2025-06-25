// src/app/api/login/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { compare } from "bcrypt";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";
import { prisma } from "../../../../lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    // 1. Busca el usuario y su rol
    const user = await prisma.users.findFirst({
      where: {
        OR: [{ username }, { email: username }],
      },
      include: { Roles: true },
    });

    console.log("user", user);
    

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 401 });
    }


    // 2. Compara contraseña
    const valid = await compare(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    } 

    console.log(valid);
    

    // 3. Genera el JWT
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) throw new Error("❌ JWT_SECRET no está definido.");

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

    console.log(token);
    

    // 4. Determina el context ID
    const isSuperAdmin = user.Roles?.name === "SuperAdminEmpresa"; // ajusta si tu rol tiene otro nombre
    const relationedCompanyId = isSuperAdmin ? user.id : user.global_company_context_id;

    // 5. Serializa cookies
    const tokenCookie = serialize("token", token, {
      httpOnly: true,
      path: "/",
      maxAge: 8 * 60 * 60,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    const contextCookie = serialize("relationedCompany", relationedCompanyId || "", {
      httpOnly: true,
      path: "/",
      maxAge: 8 * 60 * 60,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    // 6. Respuesta
    return NextResponse.json(
      {
        token,
        relationedCompanyId,
      },
      {
        status: 200,
        headers: {
          "Set-Cookie": [tokenCookie, contextCookie].join(", "),
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
