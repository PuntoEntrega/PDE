// src/app/api/document-types/route.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(_: NextRequest) {
  const list = await prisma.documentTypes.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })
  return NextResponse.json(list)
}
