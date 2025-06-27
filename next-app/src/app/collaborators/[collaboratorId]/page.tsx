import { Sidebar } from "@/Components/Sidebar/Sidebar"
import { CollaboratorDetails } from "@/Components/Collaborators/collaborator-details"

interface CollaboratorPageProps {
    params: Promise<{ collaboratorId: string }>
}

export default async function CollaboratorPage({ params }: CollaboratorPageProps) {
    const { collaboratorId } = await params

    return (
        <Sidebar>
            <div className="w-full p-6">
                <CollaboratorDetails collaboratorId={collaboratorId} />
            </div>
        </Sidebar>
    )
}
