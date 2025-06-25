import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// src/app/api/pdes/route.ts
export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  
  const data = await req.json();

  // 👉  opcional: si NO vas a guardar location_json, desestructura aquí:
  // const { address: { state, county, suburb } } = data.location_json;
  // data.province = state;
  // ...

  try {
    const pde = await prisma.deliveryPoints.create({
      data: {
        id: crypto.randomUUID(),
        company_id: data.company_id,
        name: data.name,
        whatsapp_contact: data.whatsapp_contact,
        business_email: data.business_email,
        exact_address: data.exact_address,
        postal_code: data.postal_code,
        latitude: data.latitude,
        longitude: data.longitude,
        location_json: data.location_json,      // si añades la columna
        schedule_json: data.schedule_json,
        services_json: data.services_json,
        storage_area_m2: data.storage_area_m2,
        accepts_xs: data.accepts_xs,
        accepts_s: data.accepts_s,
        accepts_m: data.accepts_m,
        accepts_l: data.accepts_l,
        accepts_xl: data.accepts_xl,
        accepts_xxl: data.accepts_xxl,
        accepts_xxxl: data.accepts_xxxl,
        active: true,
      },
      select: { id: true },
    });

    return NextResponse.json(pde);
  } catch (err) {
    console.error("Error al crear PDE:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}


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
