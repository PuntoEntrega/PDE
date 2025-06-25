import prisma from '@/lib/prisma';
import { NextResponse, NextRequest } from "next/server"

// src/app/api/pdes/[id]/users/route.ts
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const pdeId = params.id

  try {
    const rows = await prisma.userPde.findMany({
      where: { delivery_point_id: pdeId },
      select: {
        active: true,                 // ← estado en la tabla intermedia
        Users: {
          select: {
            id: true,
            first_name: true,
            email: true,
            phone: true,
            avatar_url: true,
            role_id: true,
            status: true,
          },
        },
      },
    })

    // aplanar resultado
    const users = rows.map(r => ({
      ...r.Users,
      active: r.active,
    }))

    return NextResponse.json(users)
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    )
  }
}
