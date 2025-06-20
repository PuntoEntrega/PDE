// v0 was here
import { PDEList } from "@/Components/PDE/pde-list"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"

export default function PDEPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense
        fallback={
          <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Cargando puntos de entrega...</p>
            </div>
          </div>
        }
      >
        <PDEList />
      </Suspense>
    </div>
  )
}
