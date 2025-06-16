import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { PDEList } from "@/Components/PDE/pde-list";

export default function PDEPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense
        fallback={
          <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          </div>
        }
      >
        <PDEList />
      </Suspense>
    </div>
  );
}
