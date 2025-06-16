import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const deliveryPoints = await prisma.deliveryPoints.findMany({
      where: {
        company: {
          owner_user_id: user.sub,
        },
      },
      include: {
        company: {
          select: {
            id: true,
            trade_name: true,
            logo_url: true,
            company_type: true,
            active: true,
          },
        },
      },
    });

    return NextResponse.json(deliveryPoints);
  } catch (error) {
    console.error("Error al obtener PDEs:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
