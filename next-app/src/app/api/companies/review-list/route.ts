import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const companies = await prisma.companies.findMany({
    where: { status: { in: ["under_review","rejected","inactive","active"] } },
    orderBy: { created_at: "desc" },
    select: { id: true, legal_name: true, trade_name: true, status: true },
  });
  return NextResponse.json(companies);
}
