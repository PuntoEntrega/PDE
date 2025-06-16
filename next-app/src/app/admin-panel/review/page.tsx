import { getSession } from "@/lib/auth"
import { Sidebar } from "@/Components/Sidebar/Sidebar"
import ReviewUsersClient from "@/Components/admin/review/reviewUsersPage"
import ReviewPDEPageClient from "@/Components/admin/review/reviewPDEPage"
import ReviewCompaniesClient from "@/Components/admin/review/reviewCompanyPage"

export default async function ReviewPanelPage() {
  const sessionUser = await getSession()
  const userName = sessionUser?.first_name || "Admin"
  const adminId = sessionUser?.sub || ""

  return (
    <Sidebar userName={userName}>
      <div className="p-6 space-y-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Panel de Revisión</h1>
          <p className="text-gray-600">Gestiona y revisa las solicitudes pendientes del sistema</p>
        </div>

        <ReviewUsersClient adminId={adminId} />
        <ReviewCompaniesClient adminId={adminId} />
        <ReviewPDEPageClient adminId={adminId} />
      </div>
    </Sidebar>
  )
}
