import Link from "next/link"
import { UserPlus, ClipboardCheck } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card"

export default function AdminDirectory() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-8">
          <div className="mt-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">¡Bienvenido al Panel de Administración!</h1>
            <p className="text-gray-600 text-lg">Gestiona usuarios y revisa solicitudes del sistema desde aquí</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Selecciona una opción</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
          {/* Crear Usuarios Card */}
          <Link href="/admin-panel/create-users">
            <Card className="h-full border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-t-lg border-b">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <UserPlus className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-semibold text-gray-800">Crear Usuarios</CardTitle>
                    <CardDescription className="text-sm text-gray-600 mt-2">
                      Agregar nuevos usuarios al sistema
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-gray-600 leading-relaxed">
                  Registra los datos de nuevos usuarios y configura sus permisos de acceso al sistema
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* Review Card */}
          <Link href="/admin-panel/review">
            <Card className="h-full border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-t-lg border-b">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <ClipboardCheck className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-semibold text-gray-800">Review</CardTitle>
                    <CardDescription className="text-sm text-gray-600 mt-2">
                      Revisar solicitudes pendientes
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-gray-600 leading-relaxed">
                  Revisa y aprueba solicitudes de usuarios, compañías y puntos de entrega
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
