import { NextResponse } from "next/server"
import { getRedisClient } from "@/lib/redis"
const redis = getRedisClient()

export async function GET() {
  try {
    await redis.set("saludo", "Hola, Raúl. Todo bien con redis", "EX", 60) // clave con expiración de 60s
    const valor = await redis.get("saludo")

    return NextResponse.json({ ok: true, valor })
  } catch (error: any) {
    console.error("❌ Redis error:", error)
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }
}
