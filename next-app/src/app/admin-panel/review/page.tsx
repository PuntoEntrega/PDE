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

        {/* Panel de revisión con navegación */}
        <ReviewPanelClient adminId={adminId} />
      </div>
    </Sidebar>
  )
}
