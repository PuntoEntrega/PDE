// /src/app/api/collaborators/route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(_: NextRequest) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = session.sub;
    const roleLevel = session.level;

    // 1️⃣ Obtengo los companyIds permitidos
    let companyIds: string[] = [];
    if (roleLevel === 4) {
        // SuperAdminEmpresa
        const companies = await prisma.companies.findMany({
            where: { owner_user_id: userId },
            select: { id: true }
        });
        companyIds = companies.map(c => c.id);
    } else {
        // AdminEmpresa u otros
        const rels = await prisma.userCompany.findMany({
            where: { user_id: userId },
            select: { company_id: true }
        });
        companyIds = rels.map(r => r.company_id);
    }

    // 2️⃣ Traigo todas las relaciones usuario-empresa visibles
    const relations = await prisma.userCompany.findMany({
        where: {
            company_id: { in: companyIds },
            NOT: { user_id: userId }
        },
        include: {
            Users: {
                select: {
                    id: true,
                    avatar_url: true,
                    first_name: true,
                    last_name: true,
                    username: true,
                    phone: true,
                    email: true,
                    status: true,
                    verified: true,
                    created_at: true,
                    active: true,
                    role_id: true,
                    Roles: { select: { name: true, level: true } }
                }
            },
            Companies: {
                select: { id: true, trade_name: true }
            }
        }
    });

    // 3️⃣ Agrupar relaciones por usuario y consolidar empresas
    const userMap = new Map<string, any>();

    for (const rel of relations) {
        const u = rel.Users;
        const c = rel.Companies;

        if (!userMap.has(u.id)) {
            userMap.set(u.id, {
                id: u.id,
                avatar_url: u.avatar_url,
                first_name: u.first_name,
                last_name: u.last_name,
                username: u.username,
                phone: u.phone,
                email: u.email,
                active: u.active,
                role: {
                    id: u.role_id!,
                    name: u.Roles!.name,
                    level: u.Roles!.level
                },
                companies: [],
                primary_company_name: c.trade_name, // tomamos la primera como "primaria"
                status: u.status,
                verified: u.verified,
                created_at: u.created_at?.toISOString()
            });
        }

        const userData = userMap.get(u.id);
        userData.companies.push({
            id: c.id,
            name: c.trade_name,
            role_in_company: {
                id: u.role_id!,
                name: u.Roles!.name,
                level: u.Roles!.level
            }
        });
    }

    // 4️⃣ Convertimos el Map a array
    const collaborators = Array.from(userMap.values());

    return NextResponse.json({ collaborators });
}


// /src/app/api/collaborators/route.ts

import bcrypt from "bcryptjs";
import { sendEmailWithMandrill } from "@/lib/messaging/email";
import { getCollaboratorInviteTemplate } from "@/lib/templates/emailCollaboratorInvite";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const {
        email,
        role_id,
        company_id,
        company_ids,
        delivery_point_ids,
        first_name,
        last_name,
    } = await req.json();

    const roleToAssign = await prisma.roles.findUnique({ where: { id: role_id } });
    if (!roleToAssign) {
        return NextResponse.json({ error: "Rol no válido" }, { status: 400 });
    }

    if (roleToAssign.level >= session.level) {
        return NextResponse.json({ error: "No tienes permiso para asignar este rol" }, { status: 403 });
    }

    // Validación: todos los PDVs deben pertenecer a la empresa seleccionada (si aplica)
    if (delivery_point_ids?.length > 0 && company_id) {
        const dps = await prisma.deliveryPoints.findMany({
            where: { id: { in: delivery_point_ids } },
            select: { company_id: true },
        });

        const uniqueCompanyIds = [...new Set(dps.map((dp) => dp.company_id))];
        if (uniqueCompanyIds.length > 1 || uniqueCompanyIds[0] !== company_id) {
            return NextResponse.json(
                { error: "Todos los puntos de entrega deben pertenecer a la empresa seleccionada" },
                { status: 400 }
            );
        }
    }

    // Crear usuario
    const username = email.split("@")[0] + Math.floor(Math.random() * 1000);
    const provisionalPassword = uuidv4().slice(0, 8);
    const password_hash = await bcrypt.hash(provisionalPassword, 10);

    const newUser = await prisma.users.create({
        data: {
            email,
            username,
            password_hash,
            first_name: first_name || "",
            last_name: last_name || "",
            role_id,
            verified: false,
            status: "draft",
            identification_number: uuidv4(), // temporal
        },
    });

    // Asociar empresas (una o varias)
    if (company_ids?.length > 0) {
        for (const cid of company_ids) {
            await prisma.userCompany.create({
                data: {
                    id: uuidv4(),
                    user_id: newUser.id,
                    company_id: cid,
                },
            });
        }
    } else if (company_id) {
        await prisma.userCompany.create({
            data: {
                id: uuidv4(),
                user_id: newUser.id,
                company_id,
            },
        });
    }

    // Asociar PDVs si aplica
    if (delivery_point_ids?.length > 0) {
        for (const dpId of delivery_point_ids) {
            await prisma.userPde.create({
                data: {
                    id: uuidv4(),
                    user_id: newUser.id,
                    delivery_point_id: dpId,
                },
            });
        }
    }

    // Generar token y enviar correo de invitación
    const token = jwt.sign({ sub: newUser.id }, process.env.JWT_SECRET!, {
        expiresIn: "7d",
    });

    const inviteUrl = `http://localhost:3000/complete-registration?token=${token}`;

    const html = getCollaboratorInviteTemplate({
        toName: `${first_name || ""} ${last_name || ""}`.trim(),
        fromName: `${session.first_name} ${session.last_name}`,
        companyName: company_id || company_ids?.[0] || "", // opcional
        inviteUrl,
        username,
        password: provisionalPassword,
    });

    await sendEmailWithMandrill(email, "Has sido invitado a Punto Entrega", html);

    return NextResponse.json({ success: true });
}