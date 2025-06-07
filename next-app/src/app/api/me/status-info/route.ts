// src/app/api/me/status-info/route.ts

import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth" // función que decodifica el JWT desde la cookie
import prisma from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const latestStatus = await prisma.userStatusHistory.findFirst({
      where: { user_id: user.sub },
      orderBy: { created_at: "desc" },
    })

    return NextResponse.json({
      status: user.status, // viene del token o puedes hacer findUnique si necesitas
      reason: latestStatus?.reason ?? null,
      userName: user.first_name + " " + user.last_name,
    })
  } catch (err) {
    console.error("Error en /status-info", err)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
