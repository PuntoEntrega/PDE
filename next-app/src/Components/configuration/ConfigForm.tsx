"use client"

import type React from "react"
import { useState } from "react"
import Image from "next/image"
import { Button } from "@/Components/ui/button"
import { Input } from "@/Components/ui/input"
import { Camera, LockKeyhole, User, Mail, Phone, Shield, CreditCard, Save, ArrowRight, Loader2, X } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/Components/ui/tooltip"
import { useToast } from "@/Components/ui/use-toast"
import { z } from "zod"

interface ProfileConfigFormProps {
  onSave: () => Promise<void>
  onNext: () => void
  onChangePassword: () => void
  isSaving: boolean
}

// Esquema de validación
const profileSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  primerApellido: z.string().min(2, "El primer apellido debe tener al menos 2 caracteres"),
  segundoApellido: z.string().optional(),
  idEmpleado: z.string().min(3, "El ID de empleado debe tener al menos 3 caracteres"),
  correo: z.string().email("Correo electrónico inválido"),
  telefono: z.string().regex(/^\d{4}-\d{4}$/, "Formato inválido. Ej: 1234-5678"),
  identificacion: z.string().min(9, "La identificación debe tener al menos 9 caracteres"),
})

export function ProfileConfigForm({ onSave, onNext, onChangePassword, isSaving }: ProfileConfigFormProps) {
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [formData, setFormData] = useState({
    tipoId: "cedula-fisica",
    identificacion: "1.2345.6789",
    nombre: "Juan",
    primerApellido: "Pérez",
    segundoApellido: "Araya",
    idEmpleado: "DueNo123",
    cargo: "gerente",
    perfil: "super-admin",
    empresa: "ampm",
    correo: "jperez@ampm.cr",
    telefono: "1234-5678",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const { toast } = useToast()

  // Validar campo cuando cambia
  const validateField = (name: string, value: string) => {
    try {
      profileSchema.shape[name as keyof typeof profileSchema.shape]?.parse(value)
      setErrors((prev) => ({ ...prev, [name]: "" }))
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const message = error.errors[0]?.message || "Campo inválido"
        setErrors((prev) => ({ ...prev, [name]: message }))
        return false
      }
      return true
    }
  }

  // Manejar cambios en los inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (touched[name]) {
      validateField(name, value)
    }
  }

  // Marcar campo como tocado cuando pierde el foco
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
    validateField(name, value)
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setIsUploading(true)

      // Simulación de carga
      setTimeout(() => {
        const imageUrl = URL.createObjectURL(file)
        setProfileImage(imageUrl)
        setIsUploading(false)

        toast({
          title: "Imagen actualizada",
          description: "Tu foto de perfil ha sido actualizada correctamente.",
          variant: "success",
        })
      }, 1500)
    }
  }

  const handleRemoveImage = () => {
    setProfileImage(null)
    toast({
      title: "Imagen eliminada",
      description: "Tu foto de perfil ha sido eliminada.",
      variant: "default",
    })
  }

  // Validar formulario completo
  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    let isValid = true

    Object.entries(formData).forEach(([key, value]) => {
      if (key in profileSchema.shape) {
        try {
          profileSchema.shape[key as keyof typeof profileSchema.shape]?.parse(value)
        } catch (error) {
          if (error instanceof z.ZodError) {
            newErrors[key] = error.errors[0]?.message || "Campo inválido"
            isValid = false
          }
        }
      }
    })

    setErrors(newErrors)
    return isValid
  }

  const handleSave = async () => {
    if (validateForm()) {
      await onSave()
    } else {
      // Marcar todos los campos como tocados para mostrar errores
      const allTouched = Object.keys(formData).reduce(
        (acc, key) => {
          acc[key] = true
          return acc
        },
        {} as Record<string, boolean>,
      )

      setTouched(allTouched)

      toast({
        title: "Error de validación",
        description: "Por favor, revisa los campos marcados en rojo.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="p-6">
      <div className="space-y-8">
        {/* Foto de Perfil */}
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
          <h3 className="text-lg font-medium text-gray-700 mb-4 flex items-center">
            <User className="mr-2 h-5 w-5 text-blue-500" />
            Foto de Perfil
          </h3>
          <div className="flex items-center justify-start">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-100 flex items-center justify-center">
                {isUploading ? (
                  <div className="absolute inset-0 bg-gray-200/80 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                  </div>
                ) : profileImage ? (
                  <>
                    <Image
                      src={profileImage || "/placeholder.svg"}
                      alt="Foto de perfil"
                      fill
                      className="object-cover"
                    />
                    <button
                      onClick={handleRemoveImage}
                      className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                      aria-label="Eliminar foto"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <Image
                    src="/placeholder.svg?height=128&width=128&query=sonriente%20hombre%20latino%20profesional"
                    alt="Foto de perfil"
                    fill
                    className="object-cover"
                  />
                )}
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <label
                      htmlFor="profile-photo"
                      className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors shadow-lg"
                    >
                      <Camera className="h-5 w-5" />
                      <span className="sr-only">Cambiar foto</span>
                    </label>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Subir nueva foto</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <input id="profile-photo" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </div>
            <div className="ml-6">
              <h4 className="font-medium text-gray-800">Foto de perfil</h4>
              <p className="text-sm text-gray-500 mt-1">
                Sube una foto clara de tu rostro. Será visible para otros usuarios del sistema.
              </p>
              <p className="text-xs text-gray-400 mt-2">Formatos permitidos: JPG, PNG. Tamaño máximo: 5MB</p>
            </div>
          </div>
        </div>

        {/* Datos Personales */}
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
          <h3 className="text-lg font-medium text-gray-700 mb-4 flex items-center">
            <CreditCard className="mr-2 h-5 w-5 text-blue-500" />
            Datos Personales
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="tipoId" className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de identificación
              </label>
              <Select defaultValue={formData.tipoId} onValueChange={(value) => handleSelectChange("tipoId", value)}>
                <SelectTrigger className="w-full h-10 bg-white border-gray-200 focus:ring-blue-500 focus:border-blue-500">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cedula-fisica">Cédula Física Nacional</SelectItem>
                  <SelectItem value="cedula-juridica">Cédula Jurídica</SelectItem>
                  <SelectItem value="pasaporte">Pasaporte</SelectItem>
                  <SelectItem value="dimex">DIMEX</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label htmlFor="identificacion" className="block text-sm font-medium text-gray-700 mb-1">
                Número de identificación
              </label>
              <Input
                id="identificacion"
                name="identificacion"
                type="text"
                placeholder="1.2345.6789"
                className={`w-full h-10 bg-white border-gray-200 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.identificacion && touched.identificacion
                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                    : ""
                }`}
                value={formData.identificacion}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {errors.identificacion && touched.identificacion && (
                <p className="mt-1 text-xs text-red-500">{errors.identificacion}</p>
              )}
            </div>

            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <Input
                id="nombre"
                name="nombre"
                type="text"
                className={`w-full h-10 bg-white border-gray-200 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.nombre && touched.nombre ? "border-red-500 focus:ring-red-500 focus:border-red-500" : ""
                }`}
                value={formData.nombre}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {errors.nombre && touched.nombre && <p className="mt-1 text-xs text-red-500">{errors.nombre}</p>}
            </div>

            <div>
              <label htmlFor="primerApellido" className="block text-sm font-medium text-gray-700 mb-1">
                Primer Apellido
              </label>
              <Input
                id="primerApellido"
                name="primerApellido"
                type="text"
                className={`w-full h-10 bg-white border-gray-200 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.primerApellido && touched.primerApellido
                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                    : ""
                }`}
                value={formData.primerApellido}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {errors.primerApellido && touched.primerApellido && (
                <p className="mt-1 text-xs text-red-500">{errors.primerApellido}</p>
              )}
            </div>

            <div>
              <label htmlFor="segundoApellido" className="block text-sm font-medium text-gray-700 mb-1">
                Segundo Apellido
              </label>
              <Input
                id="segundoApellido"
                name="segundoApellido"
                type="text"
                className="w-full h-10 bg-white border-gray-200 focus:ring-blue-500 focus:border-blue-500"
                value={formData.segundoApellido}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="idEmpleado" className="block text-sm font-medium text-gray-700 mb-1">
                ID Empleado
              </label>
              <Input
                id="idEmpleado"
                name="idEmpleado"
                type="text"
                className={`w-full h-10 bg-white border-gray-200 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.idEmpleado && touched.idEmpleado
                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                    : ""
                }`}
                value={formData.idEmpleado}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {errors.idEmpleado && touched.idEmpleado && (
                <p className="mt-1 text-xs text-red-500">{errors.idEmpleado}</p>
              )}
            </div>

            <div>
              <label htmlFor="cargo" className="block text-sm font-medium text-gray-700 mb-1">
                Cargo
              </label>
              <Select defaultValue={formData.cargo} onValueChange={(value) => handleSelectChange("cargo", value)}>
                <SelectTrigger className="w-full h-10 bg-white border-gray-200 focus:ring-blue-500 focus:border-blue-500">
                  <SelectValue placeholder="Seleccionar cargo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gerente">Gerente</SelectItem>
                  <SelectItem value="supervisor">Supervisor</SelectItem>
                  <SelectItem value="administrador">Administrador</SelectItem>
                  <SelectItem value="operador">Operador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label htmlFor="perfil" className="block text-sm font-medium text-gray-700 mb-1">
                Perfil de Usuario
              </label>
              <Select defaultValue={formData.perfil} onValueChange={(value) => handleSelectChange("perfil", value)}>
                <SelectTrigger className="w-full h-10 bg-white border-gray-200 focus:ring-blue-500 focus:border-blue-500">
                  <SelectValue placeholder="Seleccionar perfil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="super-admin">Super Admin</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="usuario">Usuario</SelectItem>
                  <SelectItem value="invitado">Invitado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label htmlFor="empresa" className="block text-sm font-medium text-gray-700 mb-1">
                Empresa
              </label>
              <Select defaultValue={formData.empresa} onValueChange={(value) => handleSelectChange("empresa", value)}>
                <SelectTrigger className="w-full h-10 bg-white border-gray-200 focus:ring-blue-500 focus:border-blue-500">
                  <SelectValue placeholder="Seleccionar empresa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ampm">AMPM</SelectItem>
                  <SelectItem value="fresh-market">Fresh Market</SelectItem>
                  <SelectItem value="musmanni">Musmanni</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label htmlFor="correo" className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="correo"
                  name="correo"
                  type="email"
                  className={`w-full h-10 bg-white border-gray-200 pl-10 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.correo && touched.correo ? "border-red-500 focus:ring-red-500 focus:border-red-500" : ""
                  }`}
                  value={formData.correo}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </div>
              {errors.correo && touched.correo && <p className="mt-1 text-xs text-red-500">{errors.correo}</p>}
            </div>

            <div>
              <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="telefono"
                  name="telefono"
                  type="tel"
                  placeholder="1234-5678"
                  className={`w-full h-10 bg-white border-gray-200 pl-10 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.telefono && touched.telefono ? "border-red-500 focus:ring-red-500 focus:border-red-500" : ""
                  }`}
                  value={formData.telefono}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </div>
              {errors.telefono && touched.telefono && <p className="mt-1 text-xs text-red-500">{errors.telefono}</p>}
              <p className="mt-1 text-xs text-gray-500">Formato: 1234-5678</p>
            </div>
          </div>
        </div>

        {/* Seguridad */}
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
          <h3 className="text-lg font-medium text-gray-700 mb-4 flex items-center">
            <Shield className="mr-2 h-5 w-5 text-blue-500" />
            Seguridad
          </h3>
          <div className="flex items-center">
            <Button
              variant="outline"
              className="bg-blue-600 text-white hover:bg-blue-700 flex items-center"
              onClick={onChangePassword}
            >
              <LockKeyhole className="mr-2 h-4 w-4" />
              Cambiar Contraseña
            </Button>
            <div className="ml-4 text-sm text-gray-500">
              Se recomienda cambiar tu contraseña periódicamente por seguridad
            </div>
          </div>
        </div>

        {/* Botones de navegación */}
        <div className="flex justify-between pt-6 border-t">
          <Button variant="outline" className="px-6 border-gray-300 text-gray-700 hover:bg-gray-50">
            Atrás
          </Button>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              className="px-6 border-blue-600 text-blue-600 hover:bg-blue-50"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar
                </>
              )}
            </Button>

            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6" onClick={onNext} disabled={isSaving}>
              Siguiente
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}