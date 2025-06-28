"use client"
import { Sidebar } from "@/Components/Sidebar/Sidebar"
import { EnviarPaqueteClient } from "@/Components/PDE/packages/send-client-package"
import { Suspense } from "react"

export default function EnviarPaquetePage() {
    return (
        <Suspense>
            <Sidebar >
                <EnviarPaqueteClient />
            </Sidebar>
        </Suspense>
    )
}
