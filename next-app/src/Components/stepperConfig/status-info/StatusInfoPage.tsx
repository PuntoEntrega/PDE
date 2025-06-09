"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, ShieldCheck, TimerReset } from "lucide-react"
import { Sidebar } from "@/Components/Sidebar/Sidebar"
import { Card, CardContent } from "@/Components/ui/card"
import { Button } from "@/Components/ui/button"
import { Badge } from "@/Components/ui/badge"
import { useUser } from "@/context/UserContext"

const validStatuses = ["draft", "under_review", "active", "inactive", "rejected"] as const
export type ValidStatus = typeof validStatuses[number]

interface StatusInfoProps {
    userStatus: ValidStatus
    reason?: string
    userName: string
}

export default function StatusInfoPage({
    userStatus = "under_review",
    reason,
    userName = "Usuario",
}: StatusInfoProps) {
    const router = useRouter()
    const { user, setUser } = useUser()
    userStatus = user?.status 

    const renderContent = () => {
        switch (userStatus) {
            case "under_review":
                return {
                    icon: <TimerReset className="h-10 w-10 text-blue-500" />,
                    title: "Estamos revisando tu solicitud",
                    description:
                        `Tu cuenta se encuentra actualmente bajo revisión. Te notificaremos al correo ${user?.email} una vez se verifique la solicitud.`,
                    badge: <Badge variant="outline">En revisión</Badge>,
                }   
            case "rejected":
                return {
                    icon: <AlertCircle className="h-10 w-10 text-red-500" />,
                    title: "Tu solicitud fue rechazada",
                    description:
                        reason ||
                        "Tu cuenta fue rechazada. Puedes contactar a soporte para más información o intentar nuevamente más adelante.",
                    badge: <Badge variant="destructive">Rechazada</Badge>,
                }
            case "active":
                return {
                    icon: <ShieldCheck className="h-10 w-10 text-yellow-500" />,
                    title: "Mal ícono, pero está activa",
                    description:
                        reason ||
                        "Todo bien, activa.",
                    badge: <Badge variant="outline">Activa</Badge>,
                }
            case "inactive":
                return {
                    icon: <ShieldCheck className="h-10 w-10 text-yellow-500" />,
                    title: "Tu cuenta fue desactivada",
                    description:
                        reason ||
                        "Tu cuenta fue desactivada por un administrador. Para más detalles, por favor contacta a soporte.",
                    badge: <Badge variant="outline">Inactiva</Badge>,
                }
            default:
                return {
                    icon: <AlertCircle className="h-10 w-10 text-gray-500" />,
                    title: "Estado desconocido",
                    description: "No pudimos determinar el estado actual de tu cuenta.",
                    badge: <Badge variant="outline">Desconocido</Badge>,
                }
        }
    }

    const { icon, title, description, badge } = renderContent()

    return (
        <Sidebar userName={userName}>
            <div className="mt-20 flex flex-col justify-center items-center px-4">
                <Card className="text-center shadow-xl border-2 border-blue-100">
                    <CardContent className="py-10">
                        <div className="flex flex-col items-center gap-4">
                            {icon}
                            <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
                            <p className="text-gray-600 text-sm max-w-md">{description}</p>
                            <div className="mt-4">{badge}</div>
                            <Button
                                onClick={() => router.push("/login")}
                                className="mt-6 bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                Cerrar sesión
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </Sidebar>
    )
}