import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export async function POST(request: Request) {
  const body = await request.json()
  const { username, password } = body

  if (!username || !password) {
    return NextResponse.json({ error: "Faltan credenciales" }, { status: 400 })
  }

  const user = await prisma.users.findFirst({
    where: {
      OR: [{ username }, { email: username }],
    },
    include: { Roles: true },
  })

  if (!user || !user.password_hash) {
    return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
  }

  const isValid = await bcrypt.compare(password, user.password_hash)

  if (!isValid) {
    return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
  }

  const token = jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.Roles?.name,
    },
    process.env.JWT_SECRET!,
    { expiresIn: "7d" }
  )

  const response = NextResponse.json({ message: "Login exitoso" })
  response.cookies.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 días
    path: "/",
  })

  return response
}
