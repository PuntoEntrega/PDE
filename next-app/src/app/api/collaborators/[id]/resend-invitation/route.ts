import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { getCollaboratorInviteTemplate } from "@/lib/templates/emailCollaboratorInvite"
import { sendEmailWithMandrill } from "@/lib/messaging/email"
import jwt from "jsonwebtoken"
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: targetUserId } = await params; 
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const actingUserId = session.sub

    // Obtener usuario que hace la acción
    const actingUser = await prisma.users.findUnique({
        where: { id: actingUserId },
        include: {
            Roles: true,
            UserCompany: true,
            UserPde: true,
        },
    })
    if (!actingUser) return NextResponse.json({ error: "Usuario autenticado no encontrado" }, { status: 404 })

    // Obtener colaborador objetivo
    const targetUser = await prisma.users.findUnique({
        where: { id: targetUserId },
        include: {
            Roles: true,
            UserCompany: { include: { Companies: true } },
            UserPde: true,
        },
    })
    if (!targetUser) return NextResponse.json({ error: "Colaborador no encontrado" }, { status: 404 })

    if (!actingUser.Roles || !targetUser.Roles)
        return NextResponse.json({ error: "Faltan datos de rol" }, { status: 400 })

    // ⛔ Si el usuario ya está verificado o no está en estado 'draft', no se puede reenviar
    if (targetUser.verified || targetUser.status !== "draft") {
        return NextResponse.json({ error: "Este usuario ya aceptó la invitación o no está en estado borrador" }, { status: 400 })
    }

    // 🚫 Verificar jerarquía de rol
    if (actingUser.Roles.level <= targetUser.Roles.level) {
        return NextResponse.json({ error: "No tienes permisos sobre este usuario" }, { status: 403 })
    }

    const roleName = actingUser.Roles.name

    // 🔒 Validaciones por rol
    if (roleName === "AdminPdE") {
        const sameCompany = actingUser.UserCompany.some(ac =>
            targetUser.UserCompany.some(tc => tc.company_id === ac.company_id)
        )
        const samePDE = actingUser.UserPde.some(ap =>
            targetUser.UserPde.some(tp => tp.delivery_point_id === ap.delivery_point_id)
        )
        if (!sameCompany || !samePDE) {
            return NextResponse.json({ error: "Debes compartir empresa y PDV con el colaborador" }, { status: 403 })
        }
    } else if (roleName === "AdministradorEmpresa") {
        const sameCompany = actingUser.UserCompany.some(ac =>
            targetUser.UserCompany.some(tc => tc.company_id === ac.company_id)
        )
        if (!sameCompany) {
            return NextResponse.json({ error: "No pertenecen a la misma empresa" }, { status: 403 })
        }
    } else if (roleName === "SuperAdminEmpresa") {
        const companyIds = targetUser.UserCompany.map(uc => uc.company_id)
        const ownedCompanies = await prisma.companies.findMany({
            where: {
                id: { in: companyIds },
                owner_user_id: actingUserId,
            },
        })
        if (ownedCompanies.length === 0) {
            return NextResponse.json({ error: "No eres propietario de ninguna empresa asociada" }, { status: 403 })
        }
    } else {
        return NextResponse.json({ error: "Tu rol no permite reenviar invitaciones" }, { status: 403 })
    }

    // ✅ Generar token y template
    const token = jwt.sign(
        { sub: targetUser.id },
        process.env.JWT_SECRET!,
        { expiresIn: "7d" }
    )

    const inviteUrl = `http://localhost:3000/complete-registration?token=${token}`

    // ⚠️ Generar nueva contraseña provisional
    const provisionalPassword = uuidv4().slice(0, 8)
    const newPasswordHash = await bcrypt.hash(provisionalPassword, 10)

    await prisma.users.update({
        where: { id: targetUser.id },
        data: { password_hash: newPasswordHash },
    })

    const html = getCollaboratorInviteTemplate({
        toName: `${targetUser.first_name} ${targetUser.last_name}`.trim(),
        fromName: `${session.first_name} ${session.last_name}`,
        companyName: targetUser.UserCompany[0]?.Companies?.trade_name || "una empresa",
        inviteUrl,
        username: targetUser.username,
        password: provisionalPassword,
    })

    try {
        await sendEmailWithMandrill(
            targetUser.email,
            "Recordatorio: Invitación a colaborar en Punto Entrega",
            html
        )

        return NextResponse.json({ success: true, message: "Invitación reenviada con éxito" })
    } catch (error) {
        console.error("Error enviando invitación:", error)
        return NextResponse.json({ error: "Error al enviar el correo de invitación" }, { status: 500 })
    }
}
