import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pdeId = id;
    const body = await req.json();

    const updated = await prisma.deliveryPoints.update({
      where: { id: pdeId },
      data: {
        name: body.name,
        trade_name: body.trade_name,
        business_email: body.business_email,
        whatsapp_contact: body.whatsapp_contact,
        // manager_name: body.manager_name,
        // manager_email: body.manager_email,
        // manager_phone: body.manager_phone,
        province: body.province,
        canton: body.canton,
        district: body.district,
        exact_address: body.exact_address,
        postal_code: body.postal_code,
        updated_at: new Date(),
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[PATCH /pde/:id/general]", err);
    return NextResponse.json({ error: "Error al actualizar datos generales del PDE." }, { status: 500 });
  }
}
