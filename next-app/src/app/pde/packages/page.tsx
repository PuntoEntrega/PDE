import { PdeActionsView } from "@/Components/PDE/packages/pde-actions-view"
import { Sidebar } from "@/Components/Sidebar/Sidebar"

export default function PdePaquetesPage() {
    return (
        <Sidebar>
            <div className="p-4 sm:p-6 bg-gray-50 min-h-full">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 sm:mb-8">Funciones PdE</h1>
                <PdeActionsView />
            </div>
        </Sidebar>
    )
}
