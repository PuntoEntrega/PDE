import { UserCompanyList } from "@/Components/companies/user-company-list"
import { Suspense } from "react"
import { Skeleton } from "@/Components/ui/skeleton" // For loading state

function CompanyListSkeleton() {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="w-full max-w-6xl mx-auto space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-36" />
        </div>
        <Skeleton className="h-6 w-72" />
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ListCompaniesPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <Suspense fallback={<CompanyListSkeleton />}>
        <UserCompanyList />
      </Suspense>
    </div>
  )
}
