import { CreateCompanyForm } from "@/Components/Companies/create-company-form"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"

export default function CreateCompanyPage() {
    return (
        <div className=" bg-gray-50">
            <Suspense
                fallback={
                    <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
                        <div className="text-center">
                            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                            <p className="text-gray-600 font-medium">Cargando formulario de registro...</p>
                        </div>
                    </div>
                }
            >
                <CreateCompanyForm />
            </Suspense>
        </div>
    )
}
