"use client"
import { Sidebar } from "@/Components/Sidebar/Sidebar"
import { EnviarPaqueteClient } from "@/Components/PDE/packages/send-client-package"

export default function EnviarPaquetePage() {
    return (
        <Sidebar >
            <EnviarPaqueteClient />
        </Sidebar>
    )
}
