"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/Components/ui/dialog"
import { Button } from "@/Components/ui/button"
import { Input } from "@/Components/ui/input"
import { Label } from "@/Components/ui/label"
import { Eye, EyeOff, Loader2, LockKeyhole, AlertCircle, CheckCircle } from "lucide-react"
import { useToast } from "@/Components/ui/use-toast"
import { z } from "zod"

interface ChangePasswordModalProps {
  isOpen: boolean
  onClose: () => void
}

// Esquema de validación para contraseña
const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, "La contraseña actual debe tener al menos 6 caracteres"),
    newPassword: z
      .string()
      .min(8, "La nueva contraseña debe tener al menos 8 caracteres")
      .regex(/[A-Z]/, "Debe contener al menos una letra mayúscula")
      .regex(/[a-z]/, "Debe contener al menos una letra minúscula")
      .regex(/[0-9]/, "Debe contener al menos un número")
      .regex(/[^A-Za-z0-9]/, "Debe contener al menos un carácter especial"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  })

export function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const { toast } = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Calcular fuerza de la contraseña si es el campo newPassword
    if (name === "newPassword") {
      let strength = 0
      if (value.length >= 8) strength += 1
      if (/[A-Z]/.test(value)) strength += 1
      if (/[a-z]/.test(value)) strength += 1
      if (/[0-9]/.test(value)) strength += 1
      if (/[^A-Za-z0-9]/.test(value)) strength += 1
      setPasswordStrength(strength)
    }

    // Limpiar error cuando el usuario comienza a escribir
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    try {
      passwordSchema.parse(formData)
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message
          }
        })
        setErrors(newErrors)
      }
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    // Simulación de cambio de contraseña
    setTimeout(() => {
      setIsSubmitting(false)
      toast({
        title: "Contraseña actualizada",
        description: "Tu contraseña ha sido actualizada correctamente.",
        variant: "success",
      })
      onClose()
      // Resetear el formulario
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      setPasswordStrength(0)
    }, 1500)
  }

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <LockKeyhole className="mr-2 h-5 w-5 text-blue-600" />
            Cambiar Contraseña
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword" className="text-sm font-medium">
              Contraseña actual
            </Label>
            <div className="relative">
              <Input
                id="currentPassword"
                name="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                value={formData.currentPassword}
                onChange={handleChange}
                className={`pr-10 ${errors.currentPassword ? "border-red-500 focus:ring-red-500" : ""}`}

                placeholder="Ingresa tu contraseña actual"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="text-xs text-red-500 flex items-center mt-1">
                <AlertCircle className="h-3 w-3 mr-1" />
                {errors.currentPassword}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-sm font-medium">
              Nueva contraseña
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
                name="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={formData.newPassword}
                onChange={handleChange}
                className={`pr-10 ${errors.confirmPassword ? "border-red-500 focus:ring-red-500" : ""}`}

                placeholder="Ingresa tu nueva contraseña"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-xs text-red-500 flex items-center mt-1">
                <AlertCircle className="h-3 w-3 mr-1" />
                {errors.newPassword}
              </p>
            )}

            {/* Indicador de fuerza de contraseña */}
            {formData.newPassword && (
              <div className="mt-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-500">Fuerza de la contraseña:</span>
                  <span
                    className={`text-xs font-medium ${
                      passwordStrength <= 2
                        ? "text-red-500"
                        : passwordStrength <= 3
                          ? "text-yellow-500"
                          : "text-green-500"
                    }`}
                  >
                    {getStrengthText()}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getStrengthColor()} transition-all duration-300`}
                    style={`{ width: ${(passwordStrength / 5) * 100}% }`}
                  ></div>
                </div>

                <ul className="mt-2 space-y-1 text-xs text-gray-500">
                  <li className="flex items-center">
                    {/[A-Z]/.test(formData.newPassword) ? (
                      <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                    ) : (
                      <AlertCircle className="h-3 w-3 mr-1 text-gray-400" />
                    )}
                    Al menos una letra mayúscula
                  </li>
                  <li className="flex items-center">
                    {/[a-z]/.test(formData.newPassword) ? (
                      <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                    ) : (
                      <AlertCircle className="h-3 w-3 mr-1 text-gray-400" />
                    )}
                    Al menos una letra minúscula
                  </li>
                  <li className="flex items-center">
                    {/[0-9]/.test(formData.newPassword) ? (
                      <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                    ) : (
                      <AlertCircle className="h-3 w-3 mr-1 text-gray-400" />
                    )}
                    Al menos un número
                  </li>
                  <li className="flex items-center">
                    {/[^A-Za-z0-9]/.test(formData.newPassword) ? (
                      <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                    ) : (
                      <AlertCircle className="h-3 w-3 mr-1 text-gray-400" />
                    )}
                    Al menos un carácter especial
                  </li>
                  <li className="flex items-center">
                    {formData.newPassword.length >= 8 ? (
                      <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                    ) : (
                      <AlertCircle className="h-3 w-3 mr-1 text-gray-400" />
                    )}
                    Mínimo 8 caracteres
                  </li>
                </ul>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirmar contraseña
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`pr-10 ${errors.confirmPassword ? "border-red-500 focus:ring-red-500" : ""}`}
                placeholder="Confirma tu nueva contraseña"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-500 flex items-center mt-1">
                <AlertCircle className="h-3 w-3 mr-1" />
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-gray-300 text-gray-700"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Actualizando...
                </>
              ) : (
                "Actualizar contraseña"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}