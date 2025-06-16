export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { notifyAdminsCompanyReview } from "@/lib/helpers/notifyAdminsCompany";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const companyId = params.id;
  const { reason, changed_by_id } = await req.json();

  // solo permite desde draft
  const company = await prisma.companies.findUnique({ where: { id: companyId } });
  if (!company || company.status !== "draft")
    return NextResponse.json({ error: "Empresa no encontrada o ya enviada" }, { status: 400 });

  await prisma.$transaction([
    prisma.companies.update({ where: { id: companyId }, data: { status: "under_review" } }),
    prisma.companyStatusHistory.create({
      data: {
        company_id: companyId,
        changed_by_id,
        previous_status: "draft",
        new_status: "under_review",
        reason,
      },
    }),
  ]);

  await notifyAdminsCompanyReview({
    legal_name: company.legal_name,
    trade_name: company.trade_name,
    contact_email: company.contact_email,
    contact_phone: company.contact_phone,
  });

  return NextResponse.json({ message: "Empresa enviada a revisión" });
}
