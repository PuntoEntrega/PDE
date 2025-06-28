import { Sidebar } from "@/Components/Sidebar/Sidebar"
import { VerPaquetesClient } from "@/Components/PDE/packages/see-package"
import { MOCK_PACKAGES } from "@/lib/mock-data/packages-mock"

export default function VerPaquetesPage() {
    return (
        <Sidebar>
            <VerPaquetesClient packages={MOCK_PACKAGES} />
        </Sidebar>
    )
}
