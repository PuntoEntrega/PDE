// src/app/configuration/company/page.tsx
import { Sidebar } from "@/Components/Sidebar/Sidebar"
import { CompanyConfigClient } from "./CompanyConfigClient"

export default function CompanyConfigPage() {
  return (
    <Sidebar userName="Juan Pérez Araya">
      <CompanyConfigClient />
    </Sidebar>
  )
}
