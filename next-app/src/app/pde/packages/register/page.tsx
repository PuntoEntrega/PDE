import { Sidebar } from "@/Components/Sidebar/Sidebar"
import { RegistrarPaqueteClient } from "@/Components/PDE/packages/register-package"
import { Suspense } from "react"

export default function RegistrarPaquetePage() {
    return (
        <Suspense>
            <Sidebar>
                <RegistrarPaqueteClient />
            </Sidebar>
        </Suspense>
    )
}
