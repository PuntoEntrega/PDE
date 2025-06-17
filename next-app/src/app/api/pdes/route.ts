import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const pdes = await prisma.deliveryPoints.findMany({
      where: {
        company: {
          owner_user_id: user.sub,
        },
      },
      select: {
        id: true, // Para acciones internas
        name: true,
        created_at: true,
        updated_at: true,
        active: true,
        company: {
          select: {
            trade_name: true,
          },
        },
      },
    });

    // Agregar campo temporal de espacio ficticio
    const enriched = pdes.map((pde) => ({
      ...pde,
      usage: Math.floor(Math.random() * 51), // Ej: 0-50
      capacity: 50,
    }));

    return NextResponse.json(enriched);
  } catch (error) {
    console.error("Error al obtener PDEs:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
