"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import logoApp from "../../../public/punto_entrega_logo.png"
import { Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/Components/ui/button"
import { Card, CardContent } from "@/Components/ui/card"
import { Input } from "@/Components/ui/input"
import { useAlert } from "@/Components/Alerts/use-alert"
import { useSearchParams } from "next/navigation"
import { useRouter } from "next/navigation"

export function ResetPasswordForm() {
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [passwordStrength, setPasswordStrength] = useState(0)
    const { showAlert } = useAlert()
    const searchParams = useSearchParams()
    const router = useRouter()

    const token = searchParams.get("token")

    useEffect(() => {
        let strength = 0
        if (password.length >= 8) strength += 1
        if (/[A-Z]/.test(password)) strength += 1
        if (/[a-z]/.test(password)) strength += 1
        if (/[0-9]/.test(password)) strength += 1
        if (/[^A-Za-z0-9]/.test(password)) strength += 1
        setPasswordStrength(strength)
    }, [password])

    const getStrengthColor = () => {
        if (passwordStrength <= 2) return "bg-red-500"
        if (passwordStrength <= 3) return "bg-yellow-500"
        return "bg-green-500"
    }

    const getStrengthText = () => {
        if (passwordStrength <= 2) return "Débil"
        if (passwordStrength <= 3) return "Media"
        return "Fuerte"
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            if (!token) throw new Error("Token inválido o expirado")
            if (password !== confirmPassword) {
                showAlert("error", "Error", "Las contraseñas no coinciden")
                return
            }

            const res = await fetch("/api/reset-password", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, newPassword: password }),
            })

            if (!res.ok) throw new Error((await res.json()).message || "Error desconocido")

            showAlert("success", "¡Éxito!", "Tu contraseña ha sido actualizada correctamente")

            // Redirigir tras 2.5s
            setTimeout(() => {
                router.push("/login")
            }, 2500)
        } catch (error: any) {
            showAlert("error", "Error", error.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="w-full max-w-md bg-white shadow-xl rounded-2xl border-0">
            <CardContent className="p-8">
                <div className="flex justify-center mb-6">
                    <Image src={logoApp} alt="Punto Entrega" width={160} height={50} className="h-auto" />
                </div>

                <h2 className="text-center text-xl font-semibold text-gray-800 mb-6">Cambio de contraseña</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Nueva contraseña</label>
                        <div className="relative">
                            <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Escoja una contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>

                        {password && (
                            <div className="mt-2">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs text-gray-500">Fuerza de la contraseña:</span>
                                    <span className={`text-xs font-medium ${passwordStrength <= 2 ? "text-red-500" : passwordStrength <= 3 ? "text-yellow-500" : "text-green-500"
                                        }`}>
                                        {getStrengthText()}
                                    </span>
                                </div>
                                <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                                    <div className={`h-full ${getStrengthColor()} transition-all duration-300`} style={{ width: `${(passwordStrength / 5) * 100}%` }}></div>
                                </div>
                            </div>
                        )}

                        <ul className="mt-2 space-y-1 text-xs text-gray-500">
                            <li className="flex items-center">
                                {/[A-Z]/.test(password) ? <CheckCircle className="h-3 w-3 mr-1 text-green-500" /> : <AlertCircle className="h-3 w-3 mr-1 text-gray-400" />}
                                Al menos una letra mayúscula
                            </li>
                            <li className="flex items-center">
                                {/[a-z]/.test(password) ? <CheckCircle className="h-3 w-3 mr-1 text-green-500" /> : <AlertCircle className="h-3 w-3 mr-1 text-gray-400" />}
                                Al menos una letra minúscula
                            </li>
                            <li className="flex items-center">
                                {/[0-9]/.test(password) ? <CheckCircle className="h-3 w-3 mr-1 text-green-500" /> : <AlertCircle className="h-3 w-3 mr-1 text-gray-400" />}
                                Al menos un número
                            </li>
                            <li className="flex items-center">
                                {/[^A-Za-z0-9]/.test(password) ? <CheckCircle className="h-3 w-3 mr-1 text-green-500" /> : <AlertCircle className="h-3 w-3 mr-1 text-gray-400" />}
                                Al menos un carácter especial
                            </li>
                            <li className="flex items-center">
                                {password.length >= 8 ? <CheckCircle className="h-3 w-3 mr-1 text-green-500" /> : <AlertCircle className="h-3 w-3 mr-1 text-gray-400" />}
                                Mínimo 8 caracteres
                            </li>
                        </ul>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Repetir nueva contraseña</label>
                        <div className="relative">
                            <Input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="********"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
                        disabled={isLoading}
                    >
                        {isLoading ? "Actualizando..." : "Actualizar contraseña"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
