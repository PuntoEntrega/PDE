// src/app/pde/[pdeId]/edit/page.tsx

import PDEEditClient from "./PDEEditClient";
import { Sidebar } from "@/Components/Sidebar/Sidebar";

interface PDEEditPageProps {
  params: { pdeId: string };
}

export default function PDEEditPage({ params }: PDEEditPageProps) {
  const { pdeId } = params;

  return (
    <Sidebar>
      <div className="p-8">
        <PDEEditClient pdeId={pdeId} />
      </div>
    </Sidebar>
  );
}
