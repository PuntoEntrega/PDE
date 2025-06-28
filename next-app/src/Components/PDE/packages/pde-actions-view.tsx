"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card"
import { QrCode, PackageSearch, PackageCheck, Send } from "lucide-react"

const actions = [
    {
        title: "Entregar Paquete a Cliente",
        description: "Escanea el código y completa las tareas de entrega requeridas.",
        icon: PackageCheck,
        href: "/pde/paquetes/entregar",
        bgColor: "bg-blue-600",
        hoverBgColor: "hover:bg-blue-700",
    },
    {
        title: "Ver Paquetes del Punto",
        description: "Consulta todos los paquetes pendientes y entregados en tu PdE.",
        icon: PackageSearch,
        href: "/pde/paquetes/ver",
        bgColor: "bg-blue-600",
        hoverBgColor: "hover:bg-blue-700",
    },
    {
        title: "Enviar Paquete desde PdE",
        description: "Escanea el QR del usuario y procesa el pago del servicio.",
        icon: Send,
        href: "/pde/paquetes/enviar",
        bgColor: "bg-blue-600",
        hoverBgColor: "hover:bg-blue-700",
    },
    {
        title: "Registrar Paquete en el Punto",
        description: "Verifica y recibe paquetes que llegan al punto de entrega.",
        icon: QrCode,
        href: "/pde/paquetes/registrar",
        bgColor: "bg-blue-600",
        hoverBgColor: "hover:bg-blue-700",
    },
]

export function PdeActionsView() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {actions.map((action) => (
                <Link href={action.href} key={action.title} className="group">
                    <Card className="h-full hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-blue-300">
                        <CardHeader className="text-center pb-4">
                            <div className="mx-auto bg-blue-100 p-4 rounded-lg w-fit mb-4 group-hover:bg-blue-200 transition-colors">
                                <action.icon className="h-8 w-8 text-blue-600" />
                            </div>
                            <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {action.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <p className="text-sm text-gray-600 text-center leading-relaxed">{action.description}</p>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
    )
}
