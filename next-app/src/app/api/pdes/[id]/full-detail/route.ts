import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const pdeId = params.id;

  try {
    const pde = await prisma.deliveryPoints.findUnique({
      where: { id: pdeId },
      include: {
        company: true,
      },
    });

    if (!pde) {
      return NextResponse.json({ error: "Punto de entrega no encontrado" }, { status: 404 });
    }

    if (pde.company?.owner_user_id !== user.sub) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    return NextResponse.json(pde);
  } catch (error) {
    console.error("Error al obtener detalle del PDE:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
