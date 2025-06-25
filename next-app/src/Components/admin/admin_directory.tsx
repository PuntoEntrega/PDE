// v0 was here
import Link from "next/link"
import { UserPlus, ClipboardCheck, Shield, Settings } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card"
import { Sidebar } from "../Sidebar/Sidebar"

export default function AdminDirectory() {
  return (
    <Sidebar>
      <div className="max-w-7xl mx-auto space-y-8 px-4 py-6">
        {/* Header principal */}
        <Card className="shadow-xl border-0 rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-br from-blue-50 via-slate-50 to-white p-8 border-b">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-xl shadow-sm">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-3xl font-bold text-gray-800">Panel de Administración</CardTitle>
                <p className="text-gray-600 mt-1">
                  Gestiona usuarios, revisa solicitudes y administra el sistema desde aquí.
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Opciones principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Crear Usuarios Card */}
          <Link href="/admin-panel/create-users" className="group">
            <Card className="h-full shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl overflow-hidden border border-gray-200 group-hover:border-green-300">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 border-b">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-green-100 rounded-lg shadow-sm group-hover:bg-green-200 transition-colors">
                    <UserPlus className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-semibold text-gray-800 group-hover:text-green-700 transition-colors">
                      Crear Usuarios
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600 mt-1">
                      Agregar nuevos usuarios al sistema
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-gray-600 leading-relaxed">
                  Registra los datos de nuevos usuarios y configura sus permisos de acceso al sistema. Gestiona roles y
                  asigna empresas correspondientes.
                </p>
                <div className="mt-4 flex items-center text-sm text-green-600 font-medium">
                  <span>Gestionar usuarios</span>
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Review Card */}
          <Link href="/admin-panel/review" className="group">
            <Card className="h-full shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl overflow-hidden border border-gray-200 group-hover:border-blue-300">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 rounded-lg shadow-sm group-hover:bg-blue-200 transition-colors">
                    <ClipboardCheck className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">
                      Panel de Revisión
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600 mt-1">
                      Revisar solicitudes pendientes
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-gray-600 leading-relaxed">
                  Revisa y aprueba solicitudes de usuarios, empresas y puntos de entrega. Gestiona el estado de las
                  aplicaciones pendientes.
                </p>
                <div className="mt-4 flex items-center text-sm text-blue-600 font-medium">
                  <span>Revisar solicitudes</span>
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Estadísticas rápidas */}
        <Card className="shadow-lg border border-gray-200 rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-100 p-5 border-b">
            <div className="flex items-center">
              <div className="p-2.5 bg-gray-100 rounded-lg mr-3 shadow-sm">
                <Settings className="h-5 w-5 text-gray-600" />
              </div>
              <CardTitle className="text-lg font-semibold text-gray-800">Acceso Rápido</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">0</div>
                <div className="text-sm text-gray-600">Usuarios pendientes</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">0</div>
                <div className="text-sm text-gray-600">Empresas pendientes</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">0</div>
                <div className="text-sm text-gray-600">PdE pendientes</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Sidebar>
  )
}
