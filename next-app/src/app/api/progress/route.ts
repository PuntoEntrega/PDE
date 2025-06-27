// src/app/api/progress/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getRedisClient } from "@/lib/redis"
const redis = getRedisClient()
import { getSession } from "@/lib/auth"

export async function GET(req: NextRequest) {
    const session = await getSession()
    if (!session) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const key = `step_progress:${session.sub}`
    const value = await redis.get(key)
    const step = value ? Number(value) : 1

    return NextResponse.json({ currentStep: step })
}

export async function PATCH(req: NextRequest) {
    const session = await getSession()
    if (!session) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await req.json()
    const { step } = body

    if (typeof step !== "number" || step < 1) {
        return NextResponse.json({ error: "Paso inválido" }, { status: 400 })
    }

    const key = `step_progress:${session.sub}`
    const current = Number(await redis.get(key)) || 1

    const maxStep = Math.max(current, step)
    await redis.set(key, maxStep)

    return NextResponse.json({ success: true, step: maxStep })
}
