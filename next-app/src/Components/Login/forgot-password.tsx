"use client"

import type React from "react"
import logoApp from '../../../public/punto_entrega_logo.png'
import { useState } from "react"
import { Button } from "@/Components/ui/button"
import { Card, CardContent } from "@/Components/ui/card"
import { Input } from "@/Components/ui/input"
import Image from "next/image"
import { useAlert } from "@/Components/Alerts/use-alert"
import { forgotPasswordSchema, type ForgotPasswordFormData } from "../../../lib/Validations/auth"

interface ForgotPasswordProps {
  onBack: () => void
}

export function ForgotPassword({ onBack }: ForgotPasswordProps) {
  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    username: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const { showAlert } = useAlert()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validación frontend con Zod
      const validatedData = forgotPasswordSchema.parse(formData)

      // Petición real al backend
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validatedData),
      })

      const data = await res.json()

      if (!res.ok) {
        showAlert("error", "Error", data.message || "No se pudo enviar el correo")
        return
      }

      showAlert(
        "success",
        "Correo enviado",
        "Te hemos enviado un correo con las instrucciones para recuperar tu contraseña"
      )

      setTimeout(() => {
        onBack()
      }, 3000)
    } catch (error) {
      showAlert("error", "Error inesperado", "Ocurrió un problema al intentar enviar el correo")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-[100%] h-[100%] mx-auto bg-white shadow-xl rounded-2xl border-0">
      <CardContent className="p-8">
        <div className="flex justify-center mb-6">
          <Image src={logoApp} alt="Punto Entrega" width={200} height={60} className="h-auto" />
        </div>

        <h1 className="text-lg font-medium text-gray-800 text-center mb-4">Recuperar contraseña</h1>

        <p className="text-sm text-gray-600 text-center mb-6">
          Escribe tu nombre de usuario o correo electrónico asociado y te enviaremos un correo de recuperación de
          contraseña.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Usuario</p>
            <Input
              type="text"
              placeholder="Escribe tu usuario o correo electrónico"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full h-12 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-blue-500"
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            disabled={isLoading}
          >
            {isLoading ? "Enviando..." : "Recuperar contraseña"}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full h-12 border border-blue-600 hover:bg-blue-50 text-blue-600 font-medium rounded-lg transition-colors"
            onClick={onBack}
            disabled={isLoading}
          >
            Atrás
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
