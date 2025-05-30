"use client"

import logoApp from '../../../public/punto_entrega_logo.png'
import { login } from '@/Services/Login'
import type React from "react"
import { useState } from "react"
import { Button } from "@/Components/ui/button"
import { Card, CardContent } from "@/Components/ui/card"
import { Input } from "@/Components/ui/input"
import { Eye, EyeOff } from "lucide-react"
import Image from "next/image"
import { useAlert } from "@/Components/alerts/use-alert"
import { loginSchema, type LoginFormData } from "../../../lib/validations/auth"
import { useRouter } from "next/navigation"


interface LoginFormProps {
  onForgotPassword: () => void
}

export function LoginForm({ onForgotPassword }: LoginFormProps) {
  const [formData, setFormData] = useState<LoginFormData>({
    username: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { showAlert } = useAlert()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
  
    try {
      const validatedData = loginSchema.parse(formData)
      await login(validatedData)
  
      showAlert("success", "¡Bienvenido!", "Has iniciado sesión correctamente")
      router.push('/dashboard')
    } catch (error: any) {
      showAlert("error", "Error de login", error?.response?.data?.error || "Revisa tus datos")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-[100%] h-[100%] bg-white shadow-xl rounded-2xl border-0">
      <CardContent className="p-8">
        {/* Logo oficial de Punto Entrega */}
        <div className="flex justify-center mb-6">
          <Image src={logoApp} alt="Punto Entrega" width={200} height={60} className="h-auto" />
        </div>

        <h1 className="text-lg font-medium text-gray-800 text-center mb-6">Accede a tu Punto de Entrega</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Usuario</p>
            <Input
              type="text"
              placeholder="Escribe tu usuario o correo electrónico"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full h-12 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-blue"
              disabled={isLoading}
            />
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Contraseña</p>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full h-12 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-blue-500 pr-10"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-sm text-gray-600 hover:text-gray-700 hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-blue-700 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
            disabled={isLoading}
          >
            {isLoading ? "Ingresando..." : "Ingresar"}
          </Button>
        <div className="text-center pt-4">
            <div className="text-sm text-gray-600">
              ¿No tienes una cuenta?{" "}
              <div onClick={() => router.push('/register')} className="text-blue-600 hover:text-blue-700 font-medium hover:underline cursor-pointer">
                Regístrate aquí
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}