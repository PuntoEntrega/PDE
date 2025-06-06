// src/app/api/logout/route.ts   (Next.js App Router)
// o si usas Pages Router: src/pages/api/logout.ts

import { NextResponse } from "next/server";
import { serialize } from "cookie";

export async function GET() {
  // Serializa una cookie “token” vacía con maxAge=0 para que el navegador la elimine
  const expiredCookie = serialize("token", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,         // Expirar inmediatamente
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  // Devuelves la respuesta JSON o un redirect, pero en el encabezado pones Set-Cookie
  const response = NextResponse.json(
    { ok: true },
    {
      status: 200,
      headers: {
        "Set-Cookie": expiredCookie,
      },
    }
  );

  return response;
}
