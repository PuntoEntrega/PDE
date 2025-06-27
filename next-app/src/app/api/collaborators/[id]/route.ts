// src/app/api/collaborators/[id]/route.ts
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // 1. Extraer ID y verificar sesión
        const { id } = params;
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Fetch usuario con empresas y puntos de entrega
        const user = await prisma.users.findUnique({
            where: { id },
            include: {
                Roles: true,
                UserCompany: {
                    include: {
                        Companies: true,
                        Users: { select: { role_id: true } }
                    }
                },
                UserPde: {
                    include: {
                        DeliveryPoints: true
                    }
                }
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        // 3. Agrupar puntos de entrega por company_id
        const puntosPorEmpresa: Record<string, any[]> = {};
        user.UserPde.forEach(rel => {
            const pdv = rel.DeliveryPoints;
            if (!pdv?.company_id) return;
            if (!puntosPorEmpresa[pdv.company_id]) {
                puntosPorEmpresa[pdv.company_id] = [];
            }
            puntosPorEmpresa[pdv.company_id].push({
                id: pdv.id,
                name: pdv.trade_name ?? pdv.name ?? 'PdE',
                active: pdv.active,
                status: pdv.status,
                location: {
                    province: pdv.province,
                    canton: pdv.canton,
                    district: pdv.district
                }
            });
        });

        // 4. Construir array de empresas con sus PDV
        const companies = user.UserCompany.map(rel => {
            const empresaId = rel.company_id;
            return {
                id: empresaId,
                name: rel.Companies?.trade_name ?? 'Empresa',
                role_in_company: {
                    id: user.role_id!,
                    name: user.Roles?.name ?? 'Desconocido',
                    level: user.Roles?.level ?? 0
                },
                puntos_de_entrega: puntosPorEmpresa[empresaId] ?? []
            };
        });

        // 5. Formatear y devolver respuesta
        return NextResponse.json({
            id: user.id,
            avatar_url: user.avatar_url,
            first_name: user.first_name,
            last_name: user.last_name,
            username: user.username,
            phone: user.phone,
            email: user.email,
            active: user.active,
            role: {
                id: user.role_id!,
                name: user.Roles?.name ?? 'Desconocido',
                level: user.Roles?.level ?? 0
            },
            status: user.status,
            verified: user.verified,
            created_at: user.created_at?.toISOString(),
            companies
        });
    } catch (err: any) {
        // Logging seguro en Node.js runtime
        console.error('🔴 Error en GET /api/collaborators/[id]:', err);
        console.error(err.stack);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

// /src/app/api/collaborators/route.ts
import { v4 as uuidv4 } from "uuid"

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const collaboratorId = params.id;
    const { role_id, company_ids, delivery_point_ids } = await req.json();

    const userToUpdate = await prisma.users.findUnique({ where: { id: collaboratorId } });
    if (!userToUpdate) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

    const newRole = await prisma.roles.findUnique({ where: { id: role_id } });
    if (!newRole) return NextResponse.json({ error: "Rol no válido" }, { status: 400 });
    if (newRole.level >= session.level) {
        return NextResponse.json({ error: "No tienes permiso para asignar este rol" }, { status: 403 });
    }

    const roleName = newRole.name;
    if (["AdministradorEmpresa", "AdminPdE", "OperadorPdE", "SuperAdminEmpresa"].includes(roleName)) {
        if (!company_ids?.length) {
            return NextResponse.json({ error: "Debes asignar al menos una empresa para este rol" }, { status: 400 });
        }
    } else if (company_ids?.length) {
        return NextResponse.json({ error: "Este rol no admite asignación de empresas" }, { status: 400 });
    }

    if (["AdminPdE", "OperadorPdE"].includes(roleName)) {
        if (!delivery_point_ids?.length) {
            return NextResponse.json({ error: "Debes asignar al menos un PDV para este rol" }, { status: 400 });
        }
    } else if (delivery_point_ids?.length) {
        return NextResponse.json({ error: "Este rol no admite asignación de PDVs" }, { status: 400 });
    }

    if (delivery_point_ids?.length) {
        const dps = await prisma.deliveryPoints.findMany({ where: { id: { in: delivery_point_ids } } });
        const allBelong = dps.every(dp => company_ids!.includes(dp.company_id));
        if (!allBelong) {
            return NextResponse.json({ error: "Todos los PDVs deben pertenecer a una empresa asignada" }, { status: 400 });
        }
    }

    await prisma.users.update({
        where: { id: collaboratorId },
        data: { role_id }
    });

    if (company_ids) {
        await prisma.userCompany.deleteMany({ where: { user_id: collaboratorId } });
        for (const cid of company_ids) {
            await prisma.userCompany.create({
                data: { id: uuidv4(), user_id: collaboratorId, company_id: cid }
            });
        }
    }

    if (delivery_point_ids) {
        await prisma.userPde.deleteMany({ where: { user_id: collaboratorId } });
        for (const dpId of delivery_point_ids) {
            await prisma.userPde.create({
                data: { id: uuidv4(), user_id: collaboratorId, delivery_point_id: dpId }
            });
        }
    }

    return NextResponse.json({ success: true });
}