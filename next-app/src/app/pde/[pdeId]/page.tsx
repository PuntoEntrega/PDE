import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { PDEDetails } from "@/Components/PDE/pde-details";
import { Sidebar } from "@/Components/Sidebar/Sidebar";

interface PDEDetailsPageProps {
  params: { pdeId: string };
}

export default function PDEDetailsPage({ params }: PDEDetailsPageProps) {
  const { pdeId } = params;

  return (
    <Sidebar>
      <div>
        <Suspense
          fallback={
            <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            </div>
          }
        >
          <PDEDetails pdeId={pdeId} />
        </Suspense>
      </div>
    </Sidebar>
  );
}
