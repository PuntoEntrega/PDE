import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import path from 'path'
import { useAuth } from '@/Components/AuthProvider'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get('token')?.value
  const { user } = useAuth()

  // Ejemplo user.?role ////
  

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  try {
    const JWT_SECRET = process.env.JWT_SECRET
    if (!JWT_SECRET) throw new Error('JWT_SECRET missing')

    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET)
    )

    const userRole = payload.role as string

    console.log('Middleware: role desde token:', userRole)

    // Extrae la carpeta principal (ej: 'usuarios', 'dashboard')
    const segments = pathname.split('/')
    const routeKey = segments[1] || ''

    let allowedRoles: string[] = []

    try {
      const accessModule = await import(`./src/app/${routeKey}/access.config`)
      allowedRoles = accessModule.allowedRoles ?? []
      console.log(allowedRoles);
      
    } catch (err) {
      // Si no hay config, se asume que es pública
      return NextResponse.next()
    }

    // ❌ Bloquear si el rol no está permitido
    if (!allowedRoles.includes(userRole)) {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }

    return NextResponse.next()
  } catch (err) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
}
