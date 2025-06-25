import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth"

// PATCH /api/collaborators/[id]/toggle-status
export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const session = await getSession()
    if (!session) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const actingUserId = session.sub
    const targetUserId = params.id

    // Obtener usuario que hace la acción
    const actingUser = await prisma.users.findUnique({
        where: { id: actingUserId },
        include: {
            Roles: true,
            UserCompany: true,
            UserPde: true,
        },
    })

    if (!actingUser) {
        return NextResponse.json({ error: "Usuario autenticado no encontrado" }, { status: 404 })
    }

    // Obtener usuario objetivo
    const targetUser = await prisma.users.findUnique({
        where: { id: targetUserId },
        include: {
            Roles: true,
            UserCompany: { include: { Companies: true } },
            UserPde: true,
        },
    })

    if (!targetUser) {
        return NextResponse.json({ error: "Usuario objetivo no encontrado" }, { status: 404 })
    }

    // Validar existencia de roles
    if (!actingUser.Roles || !targetUser.Roles) {
        return NextResponse.json({ error: "Faltan datos de rol" }, { status: 400 })
    }

    // 🚫 No se puede modificar si el rol del objetivo es mayor o igual
    if (actingUser.Roles.level <= targetUser.Roles.level) {
        return NextResponse.json({ error: "No tienes permisos para modificar a este usuario" }, { status: 403 })
    }

    // 🚫 Si el targetUser ya tiene status "blocked", no permitir modificación
    if (targetUser.status === "rejected") {
        return NextResponse.json({ error: "No se puede modificar el estado de un usuario bloqueado por rol superior" }, { status: 403 })
    }

    const roleName = actingUser.Roles.name

    // Validación por tipo de rol
    if (roleName === "AdminPdE") {
        const sameCompany = actingUser.UserCompany.some(ac =>
            targetUser.UserCompany.some(tc => tc.company_id === ac.company_id)
        )

        const samePDE = actingUser.UserPde.some(ap =>
            targetUser.UserPde.some(tp => tp.delivery_point_id === ap.delivery_point_id)
        )

        if (!sameCompany || !samePDE) {
            return NextResponse.json({
                error: "Debes compartir empresa y punto de entrega con el colaborador para realizar esta acción",
            }, { status: 403 })
        }
    }

    else if (roleName === "AdministradorEmpresa") {
        const sameCompany = actingUser.UserCompany.some(ac =>
            targetUser.UserCompany.some(tc => tc.company_id === ac.company_id)
        )

        if (!sameCompany) {
            return NextResponse.json({
                error: "Debes pertenecer a la misma empresa que el colaborador para realizar esta acción",
            }, { status: 403 })
        }
    }

    else if (roleName === "SuperAdminEmpresa") {
        const targetCompanyIds = targetUser.UserCompany.map(uc => uc.company_id)

        const ownedCompanies = await prisma.companies.findMany({
            where: {
                id: { in: targetCompanyIds },
                owner_user_id: actingUserId,
            },
        })

        if (ownedCompanies.length === 0) {
            return NextResponse.json({
                error: "No eres propietario de ninguna empresa asociada al colaborador",
            }, { status: 403 })
        }
    }

    else {
        return NextResponse.json({ error: "Tu rol no tiene permisos para esta acción" }, { status: 403 })
    }

    // Alternar status entre 'active' e 'inactive'
    const newStatus = targetUser.status === "active" ? "inactive" : "active"

    const updated = await prisma.users.update({
        where: { id: targetUserId },
        data: {
            status: newStatus,
        },
    })

    return NextResponse.json({ success: true, status: updated.status })
}
