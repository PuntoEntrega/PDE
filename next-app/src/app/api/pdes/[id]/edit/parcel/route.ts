import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pdeId = id
    const body = await req.json();

    const updated = await prisma.deliveryPoints.update({
      where: { id: pdeId },
      data: {
        storage_area_m2: body.storage_area_m2,
        accepts_xs: body.accepts_xs,
        accepts_s: body.accepts_s,
        accepts_m: body.accepts_m,
        accepts_l: body.accepts_l,
        accepts_xl: body.accepts_xl,
        accepts_xxl: body.accepts_xxl,
        accepts_xxxl: body.accepts_xxxl,
        updated_at: new Date(),
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[PATCH /pde/:id/parcel]", err);
    return NextResponse.json({ error: "Error al actualizar datos de paquetería." }, { status: 500 });
  }
}
