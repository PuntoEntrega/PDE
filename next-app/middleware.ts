import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import path from 'path'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get('token')?.value

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

    const segments = pathname.split('/')
    const routeKey = segments[1] || ''
    const accessPath = path.join(process.cwd(), 'src', 'app', routeKey, 'access.config.ts')

    let allowedRoles: string[] = []

    try {
      const accessModule = await import(`./src/app/${routeKey}/access.config`)
      allowedRoles = accessModule.allowedRoles ?? []
    } catch (err) {
      // No config file, route is public
      return NextResponse.next()
    }

    const userRole = payload.role as string
    if (!allowedRoles.includes(userRole)) {
      return NextResponse.redirect(new URL('/', req.url))
    }

    return NextResponse.next()
  } catch (err) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
}
