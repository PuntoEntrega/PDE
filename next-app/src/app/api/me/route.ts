import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = getSession()

  if (!session) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  return NextResponse.json({
    id: session.sub,
    role: session.role,
    first_name: session.first_name,
    last_name: session.last_name,
    email: session.email
  })
}
