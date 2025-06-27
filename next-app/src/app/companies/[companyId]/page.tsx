// src/app/companies/[companyId]/page.tsx
import type React from "react"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import { CompanyDetails } from "@/Components/Companies/company-details"

interface CompanyDetailsPageProps {
  params: Promise<{ companyId: string }>
}

export default async function CompanyDetailsPage({ params }: CompanyDetailsPageProps) {
  const { companyId } = await params


    return (
        <div>
            <Suspense
                fallback={
                    <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
                        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                    </div>
                }
            >
                <CompanyDetails companyId={companyId} />
            </Suspense>
        </div>
    )
}
