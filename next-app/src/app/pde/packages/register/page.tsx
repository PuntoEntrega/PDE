"use client"
import { Sidebar } from "@/Components/Sidebar/Sidebar"
import { RegistrarPaqueteClient } from "@/Components/PDE/packages/register-package"

export default function RegistrarPaquetePage() {
    return (
        <Sidebar>
            <RegistrarPaqueteClient />
        </Sidebar>
    )
}
