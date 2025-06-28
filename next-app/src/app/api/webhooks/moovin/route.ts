// src/app/api/webhooks/moovin/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'
import prisma from '@/lib/prisma'

const moovinOrderSchema = z.object({
    pdeId: z.string().uuid(),
    idOrder: z.string(),
    email: z.string().email().optional(),
    prepared: z.boolean().optional(),
    pointDelivery: z.object({
        name: z.string(),
        phone: z.string(),
        notes: z.string().optional(),
    }),
    listProduct: z
        .array(
            z.object({
                quantity: z.number(),
                nameProduct: z.string(),
                description: z.string(),
                size: z.enum(['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']).optional(),
                weight: z.number().optional(),
                price: z.number().optional(),
                codeProduct: z.string().optional(),
            })
        )
        .optional(),
})

export async function POST(req: NextRequest) {
    // 0) Chequear que venga JSON válido
    let body: any
    try {
        body = await req.json()
        if (!body || typeof body !== 'object') {
            throw new Error('Payload no es objeto JSON')
        }
    } catch (e: any) {
        console.error('JSON parse error:', e.message ?? e)
        return NextResponse.json(
            { status: 'ERROR', errors: ['Payload inválido o malformado'] },
            { status: 400 }
        )
    }

    try {
        // 1) Validación Zod
        const {
            pdeId,
            idOrder,
            email,
            pointDelivery,
            listProduct,
        } = moovinOrderSchema.parse({
            pdeId: body.pdeId,
            idOrder: body.idOrder,
            email: body.email,
            pointDelivery: body.pointDelivery,
            listProduct: body.listProduct,
        })

        // 2) Inserción en Packages
        const pkg = await prisma.packages.create({
            data: {
                id: uuidv4(),
                PdE_id: pdeId,
                package_number: { moovinOrderId: idOrder },
                Merchant: 'moovin',
                status_id: '2215a8e4-53a3-11f0-b6be-02420a0b0004',
                recipient_name: pointDelivery.name,
                recipient_phone: pointDelivery.phone,
                recipien_email: email ?? null,
                size: listProduct?.[0]?.size ?? null,
                weight: listProduct?.[0]?.weight ?? null,
                charge_amount: listProduct?.[0]?.price ?? null,
                additional_info: pointDelivery.notes ?? null,
                received_at: new Date(),
            },
        })

        // 3) Respuesta exitosa
        return NextResponse.json(
            { idPackage: pkg.id, status: 'SUCCESS', message: 'Paquete creado correctamente' },
            {
                status: 201,
                headers: { 'Access-Control-Allow-Origin': '*' },
            }
        )
    } catch (e: any) {
        // 4) Catch defensivo: sólo loggea texto
        const msg = e instanceof Error ? e.message : JSON.stringify(e)
        console.error(`Error creando paquete Moovin: ${msg}`)

        const errors =
            e instanceof z.ZodError
                ? e.issues.map(i => `${i.path.join('.')}: ${i.message}`)
                : [msg]

        return NextResponse.json(
            { status: 'ERROR', errors },
            { status: 400 }
        )
    }
}
