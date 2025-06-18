// src/app/companies/page.tsx
import { CompaniesList } from "@/Components/Companies/companies-list"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"

export default function CompaniesPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Suspense
                fallback={
                    <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
                        <div className="text-center">
                            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                            <p className="text-gray-600 font-medium">Cargando empresas...</p>
                        </div>
                    </div>
                }
            >
                <CompaniesList />
            </Suspense>
        </div>
    )
}
