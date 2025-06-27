import React from 'react'

const page = () => {
  return (
    <div>page</div>
  )
}

export default page

// // src/app/pde/[pdeId]/edit/page.tsx

// import PDEEditClient from "./PDEEditClient";
// import { Sidebar } from "@/Components/Sidebar/Sidebar";

// interface PDEEditPageProps { 
//   params: Promise<{ pdeId: string }>;
// }

// export default async function PDEEditPage({ params }: PDEEditPageProps) {
//   const { pdeId } = await params

//   return (
//     <Sidebar>
//       <div className="p-8">
//         <PDEEditClient pdeId={pdeId} />
//       </div>
//     </Sidebar>
//   );
// }
