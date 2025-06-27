import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth"

// PATCH /api/collaborators/[id]/toggle-active
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

    // Verificar que ambos tienen roles asignados
    if (!actingUser.Roles || !targetUser.Roles) {
        return NextResponse.json({ error: "Faltan datos de rol" }, { status: 400 })
    }

    // ⛔ No puede modificar a un usuario con igual o mayor nivel
    if (actingUser.Roles.level <= targetUser.Roles.level) {
        return NextResponse.json({ error: "No tienes permisos para modificar a este usuario" }, { status: 403 })
    }

    const roleName = actingUser.Roles.name

    // ✅ Validación por tipo de rol
    if (roleName === "AdminPdE") {
        // Debe compartir empresa y PDV con el usuario objetivo
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
        // Solo debe compartir al menos una empresa
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
        // Debe ser dueño (owner_user_id) de al menos una de las empresas del usuario
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
        // Si no es ninguno de los roles permitidos
        return NextResponse.json({
            error: "Tu rol no tiene permisos para modificar colaboradores",
        }, { status: 403 })
    }

    // ✅ Toggle del campo `active`
    const updated = await prisma.users.update({
        where: { id: targetUserId },
        data: {
            active: !targetUser.active,
        },
    })

    return NextResponse.json({ success: true, active: updated.active })
}
