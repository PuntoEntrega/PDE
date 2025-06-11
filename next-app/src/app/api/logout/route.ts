// src/app/api/logout/route.ts
import { NextResponse } from "next/server"
import { serialize } from "cookie"

export async function GET() {
  const expiredTokenCookie = serialize("token", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })

  const expiredRelationedCompanyCookie = serialize("relationedCompany", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })

  const response = NextResponse.json(
    { ok: true },
    {
      status: 200,
      headers: {
        // Se pueden enviar múltiples cookies concatenadas con coma
        "Set-Cookie": [expiredTokenCookie, expiredRelationedCompanyCookie].join(", "),
      },
    }
  )

  return response
}
