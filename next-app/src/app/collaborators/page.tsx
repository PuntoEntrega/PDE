import { CollaboratorsList } from "@/Components/Collaborators/collaborators-list"
import { Suspense } from "react"

export default function CollaboratorsPage() {
    return (
        <div className="">
            <Suspense fallback={<div className="text-center py-10">Cargando colaboradores...</div>}>
                <CollaboratorsList />
            </Suspense>
        </div>
    )
}
