// v0 was here
import { getSession } from "@/lib/auth"
import { Sidebar } from "@/Components/Sidebar/Sidebar"
import ReviewPanelClient from "@/Components/admin/review/reviewPanelClient"
import { Card, CardHeader, CardTitle } from "@/Components/ui/card"
import { ClipboardCheck } from "lucide-react"

export default async function ReviewPanelPage() {
  const sessionUser = await getSession()
  const userName = sessionUser?.first_name || "Admin"
  const adminId = sessionUser?.sub || ""

  return (
    <Sidebar userName={userName}>
      <div className="max-w-7xl mx-auto space-y-8 px-4 py-6">
        {/* Header principal */}
        <Card className="shadow-xl border-0 rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-br from-blue-50 via-slate-50 to-white p-8 border-b">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-xl shadow-sm">
                <ClipboardCheck className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-3xl font-bold text-gray-800">Panel de Revisión</CardTitle>
                <p className="text-gray-600 mt-1">
                  Gestiona y revisa las solicitudes pendientes del sistema de manera centralizada.
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Panel de revisión con navegación */}
        <ReviewPanelClient adminId={adminId} />
      </div>
    </Sidebar>
  )
}
