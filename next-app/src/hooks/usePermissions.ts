import { useSession } from './useSession'

export function usePermissions() {
  const { session, loading } = useSession()

  const role = session?.role

  let rolesPermitidos: string[] = []

  if (role === 'Super-Admin') {
    rolesPermitidos = ['Super-Admin', 'Admin', 'Asistente']
  } else if (role === 'Admin') {
    rolesPermitidos = ['Admin', 'Asistente']
  } else if (role === 'Asistente') {
    rolesPermitidos = ['Asistente']
  }

  return {
    loading,
    role,
    rolesPermitidos,
    hasAccessTo: (targetRole: string) => rolesPermitidos.includes(targetRole),
    is: (targetRole: string) => role === targetRole,
  }
}
