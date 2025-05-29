// src/app/unauthorized/page.tsx
export default function UnauthorizedPage() {
  return (
    <div className="p-8 text-center">
      <h1 className="text-3xl font-bold text-red-600">Acceso Denegado</h1>
      <p className="mt-4">No tienes permisos para acceder a esta ruta.</p>
    </div>
  )
}
