import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { Roles } from "@/lib/envRoles"

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const pdeId = params.id

  /* ────── autorización ────── */
  const pde = await prisma.deliveryPoints.findUnique({
    where: { id: pdeId },
    select: { company_id: true, company: { select: { owner_user_id: true } } },
  })
  if (!pde) return NextResponse.json({ error: "PdE not found" }, { status: 404 })

  const { level, sub: userId } = session
  const isOwner       = pde.company.owner_user_id === userId
  const isCompanyUser = await prisma.userCompany.findFirst({
    where: { user_id: userId, company_id: pde.company_id },
    select: { id: true },
  })
  const isPdeUser     = await prisma.userPde.findFirst({
    where: { user_id: userId, delivery_point_id: pdeId },
    select: { id: true },
  })

  if (
    !(isOwner ||
      (level === RoleLevels.ADMINISTRADOR_EMPRESA && isCompanyUser) ||
      isPdeUser)
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  /* ────── datos de usuarios del PdE ────── */
  const records = await prisma.userPde.findMany({
    where: { delivery_point_id: pdeId },
    include: {
      Users: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
          phone: true,
          avatar_url: true,
          status: true,
          last_login_at: true,
          Roles: { select: { name: true } },
        },
      },
    },
  })

  const result = records.map((r) => ({
    id: r.Users.id,
    name: `${r.Users.first_name} ${r.Users.last_name}`,
    email: r.Users.email,
    phone: r.Users.phone,
    avatar: r.Users.avatar_url,
    role: r.Users.Roles?.name ?? "Sin rol",
    status: r.Users.status,
    lastLogin: r.Users.last_login_at,
  }))

  return NextResponse.json(result)
}
