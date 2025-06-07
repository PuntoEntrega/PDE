// src/app/admin-panel/review-users/page.tsx
import { getSession } from "@/lib/auth"
import { Sidebar } from "@/Components/Sidebar/Sidebar"
import ReviewUsersClient from "@/Components/admin/reviewUsersPage"

export default async function ReviewUsersPage() {
  const sessionUser = await getSession()   // 👈🏻 ahora es async
  const userName = sessionUser?.first_name || "Admin"
  const adminId = sessionUser?.sub || ""
  return (
    <Sidebar userName={userName}>
      <ReviewUsersClient adminId={adminId} />
    </Sidebar>
  )
}
