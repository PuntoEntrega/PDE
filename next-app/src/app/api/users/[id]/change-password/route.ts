// /src/app/api/users/[id]/change-password/route.ts

import { NextResponse } from 'next/server'
import { compare, hash } from 'bcrypt'
import prisma from '@/lib/prisma'

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        console.log('🛠️ change-password called')
        const { id } = await params
        console.log('🆔 params.id =', id)

        const body = await req.json()
        console.log('📦 request body =', body)

        const { currentPassword, newPassword } = body
        console.log('🔑 currentPassword =', currentPassword)
        console.log('🔑 newPassword =', newPassword)

        // 1️⃣ Buscar usuario
        const userRecord = await prisma.users.findUnique({ where: { id } })
        console.log('👤 userRecord =', userRecord)

        if (!userRecord) {
            console.log('❌ Usuario no encontrado')
            return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 })
        }

        // 2️⃣ Obtener el hash de la BD
        const storedHash = userRecord.password_hash ?? userRecord.password_hash
        console.log('🗄️ storedHash =', storedHash)

        // 3️⃣ Comparar contraseña
        console.log('🔍 Comparando currentPassword con hash...')
        const isMatch = await compare(currentPassword, storedHash!)
        console.log('✅ isMatch =', isMatch)

        if (!isMatch) {
            console.log('❌ Contraseña actual incorrecta')
            return NextResponse.json(
                { message: 'La contraseña actual es incorrecta' },
                { status: 401 }
            )
        }

        // 4️⃣ Hashear y actualizar
        console.log('🔄 Hasheando nueva contraseña...')
        const newHash = await hash(newPassword, Number(process.env.SALT_ROUNDS) || 10)
        console.log('🆕 newHash =', newHash)

        await prisma.users.update({
            where: { id },
            data: {
                password_hash: newHash, // o password_hash según tu modelo
            },
        })
        console.log('✅ Contraseña actualizada en BD')

        return NextResponse.json(
            { message: 'Contraseña actualizada correctamente' },
            { status: 200 }
        )
    } catch (err) {
        console.error('🔥 change-password error:', err)
        return NextResponse.json(
            { message: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}
