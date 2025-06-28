"use client"
import { Sidebar } from "@/Components/Sidebar/Sidebar"
import { EntregarPaqueteClient } from "@/Components/PDE/packages/deliver-package"

export default function EntregarPaquetePage() {
    return (
        <Sidebar>
            <EntregarPaqueteClient />
        </Sidebar>
    )
}
