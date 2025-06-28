import { Sidebar } from "@/Components/Sidebar/Sidebar"
import { EntregarPaqueteClient } from "@/Components/PDE/packages/deliver-package"
import { Suspense } from "react"

export default function EntregarPaquetePage() {
    return (
        <Suspense>
            <Sidebar>
                <EntregarPaqueteClient />
            </Sidebar>
        </Suspense>
    )
}
