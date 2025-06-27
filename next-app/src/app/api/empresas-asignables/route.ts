// /src/app/api/empresas-asignables/route.ts
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth"

export async function GET() {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const userId = session.sub
    const level = session.level

    console.log("sub", userId);
    console.log("level", level);

    let companies = []

    if (level === 4) {
        // SuperAdminEmpresa ve todas las que posee
        companies = await prisma.companies.findMany({
            where: { owner_user_id: userId },
            select: {
                id: true,
                trade_name: true,
                DeliveryPoints: {
                    select: { id: true , name:true} // o name y address si los necesitas
                }
            }
        })
    } else {
        // Otros usuarios ven las que les han sido asignadas
        companies = await prisma.userCompany.findMany({
            where: { user_id: userId },
            include: {
                Companies: {
                    select: {
                        id: true,
                        trade_name: true,
                        DeliveryPoints: {
                            select: { id: true, name: true}
                        }
                    }
                }
            }
        })
        console.log("1", companies);

        companies = companies.map(r => r.Companies)
        console.log("3", companies);
    }

    console.log("2", companies);


    return NextResponse.json({ companies })
}
