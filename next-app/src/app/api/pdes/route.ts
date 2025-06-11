// src/app/api/pdes/route.ts
import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { z } from "zod"

/* 1 ▪ Schema ────────────────────────────────────────────────────────────── */
const deliveryPointSchema = z.object({
  company_id       : z.string().uuid(),
  name             : z.string().min(1),

  /* ← repón los campos que quitaste */
  province         : z.string().optional(),
  canton           : z.string().optional(),
  district         : z.string().optional(),
  exact_address    : z.string().optional(),
  postal_code      : z.string().optional(),
  latitude         : z.number().optional(),
  longitude        : z.number().optional(),

  trade_name       : z.string().optional(),
  whatsapp_contact : z.string().optional(),
  business_email   : z.string().email().optional().or(z.literal("")),
  // …

  schedule_json : z.record(z.string(), z.any()),
  services_json : z.object({
    cards          : z.boolean(),
    cash           : z.boolean(),
    sinpe          : z.boolean(),
    guidesPrinting : z.boolean(),
    parking        : z.boolean(),
    accessibility  : z.boolean(),
  }),

  storage_area_m2 : z.preprocess(
    (v) => (typeof v === "string" ? Number(v) : v),
    z.number()
  ),

  accepts_xs   : z.boolean(),
  accepts_s    : z.boolean(),
  accepts_m    : z.boolean(),
  accepts_l    : z.boolean(),
  accepts_xl   : z.boolean(),
  accepts_xxl  : z.boolean(),
  accepts_xxxl : z.boolean(),
})

/* 2 ▪ Handler ───────────────────────────────────────────────────────────── */
export async function POST(req: NextRequest) {
  const body = await req.json()

  /* A. Log raw payload para depuración (solo en dev) */
  if (process.env.NODE_ENV !== "production") {
    console.log("📦 Payload recibido /api/pdes:", body)
  }

  /* B. Validación segura */
  const parsed = deliveryPointSchema.safeParse(body)

  if (!parsed.success) {
    /* Formatea errores de Zod */
    const formatted = parsed.error.errors.map((e) => ({
      path: e.path.join("."),
      message: e.message,
    }))

    console.error("❌ Validación PDE:", formatted)
    return NextResponse.json(
      { error: "VALIDATION_ERROR", details: formatted },
      { status: 400 }
    )
  }

  /* C. Si pasó validación */
  try {
    const saved = await prisma.deliveryPoints.create({
      data: {
        id: crypto.randomUUID(),
        ...parsed.data,
      },
    })

    return NextResponse.json(saved, { status: 201 })
  } catch (err) {
    console.error("⚠️ Error Prisma:", err)
    return NextResponse.json({ error: "DATABASE_ERROR" }, { status: 500 })
  }
}
  