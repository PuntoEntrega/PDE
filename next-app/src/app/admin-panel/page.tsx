import AdminDirectory from "@/Components/admin/admin_directory"
import { Sidebar } from "@/Components/Sidebar/Sidebar"


export default function AdminPage() {
  return (
    <>
        <Sidebar>
            <AdminDirectory />
        </Sidebar>
    </>
  )
}