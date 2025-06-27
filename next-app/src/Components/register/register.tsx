"use client"

import React, { useEffect, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { register } from "@/Services/register"
import { registerSchema, type RegisterFormData } from "../../../lib/validations/auth"
import { useAlert } from "../alerts/use-alert"
import { Card, CardContent } from "@/Components/ui/card"
import { Input } from "@/Components/ui/input"
import PhoneInput from "react-phone-input-2"
import "react-phone-input-2/lib/style.css"
import { Button } from "@/Components/ui/button"
import {
  CreditCard,
  Loader2,
  User,
  Mail,
  Phone,
  Info,
  Shield,
} from "lucide-react"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/Components/ui/select"

export function RegisterForm() {
  const [formData, setFormData] = useState<RegisterFormData>({
    document_type_id: "",
    identification_number: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  })
  const [docTypes, setDocTypes] = useState<{ id: string; name: string }[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [defaultCountry, setDefaultCountry] = useState<string>("")

  const { showAlert } = useAlert()
  const router = useRouter()

    // 2) Detectar país via IP
  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.country_code) {
          setDefaultCountry(data.country_code.toLowerCase())
        } else {
          setDefaultCountry("us")
        }
      })
      .catch(() => {
        setDefaultCountry("us")
      })
  }, [])

  // Carga dinámicamente los tipos de documento
  useEffect(() => {
    fetch("/api/document-types")
      .then((res) => res.json())
      .then(setDocTypes)
      .catch(() =>
        showAlert("error", "Error", "No se pudieron cargar los tipos de documento")
      )
  }, [showAlert])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((p) => ({ ...p, [name]: value }))
    if (errors[name] && touched[name]) setErrors((p) => ({ ...p, [name]: "" }))
    if ((name === "email" || name === "phone") && errors.contact)
      setErrors((p) => ({ ...p, contact: "" }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((p) => ({ ...p, [name]: value }))
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target
    setTouched((p) => ({ ...p, [name]: true }))
  }

  const validateForm = () => {
    try {
      registerSchema.parse(formData)
      setErrors({})
      return true
    } catch (err: any) {
      const newErrors: Record<string, string> = {}
      err.errors.forEach((er: any) => {
        if (er.path[0]) newErrors[er.path[0]] = er.message
      })
      setErrors(newErrors)
      const t: Record<string, boolean> = {}
      Object.keys(newErrors).forEach((k) => (t[k] = true))
      setTouched((p) => ({ ...p, ...t }))
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) {
      showAlert("error", "Error de validación", "Revisa los campos marcados")
      return
    }
    setIsLoading(true)
    try {
      const { ok } = await register(formData)
      if (ok) {
        showAlert(
          "success",
          "¡Registro exitoso!"
        )
        setTimeout(() => router.push("/login"), 3000)
      } else {
        showAlert("error", "Error de registro", "Algo salió mal.")
      }
    } catch (err: any) {
      showAlert(
        "error",
        "Error de registro",
        err?.response?.data?.error || err.message
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto my-10 shadow-xl rounded-2xl bg-white">
      <CardContent className="p-8">
        <div className="flex justify-center mb-6">
          <Image
            src="/punto_entrega_logo.png"
            alt="Punto Entrega"
            width={280}
            height={80}
          />
        </div>
        <h1 className="text-2xl font-bold text-center mb-2">Crear cuenta</h1>
        <p className="text-sm text-gray-600 text-center mb-6">
          Completa el formulario para registrarte
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Tipo de documento */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Tipo de documento
            </label>
            <Select
              value={formData.document_type_id}
              onValueChange={(v) => handleSelectChange("document_type_id", v)}
            >
              <SelectTrigger className="w-full h-11 border-gray-200">
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                {docTypes.map((dt) => (
                  <SelectItem key={dt.id} value={dt.id}>
                    {dt.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.document_type_id && touched.document_type_id && (
              <p className="mt-1 text-xs text-red-500">
                {errors.document_type_id}
              </p>
            )}
          </div>

          {/* Número de identificación */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Número de identificación <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                name="identification_number"
                type="text"
                placeholder="1-2345-6789"
                value={formData.identification_number}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isLoading}
                className={`w-full h-11 pl-10 border-gray-200 rounded-lg focus:ring-blue-500 ${errors.identification_number && touched.identification_number
                    ? "border-red-500"
                    : ""
                  }`}
              />
            </div>
            {errors.identification_number && touched.identification_number && (
              <p className="mt-1 text-xs text-red-500">
                {errors.identification_number}
              </p>
            )}
          </div>

          {/* Nombre y Apellido */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Nombre <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  name="first_name"
                  type="text"
                  placeholder="Nombre"
                  value={formData.first_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isLoading}
                  className={`w-full h-11 pl-10 border-gray-200 rounded-lg focus:ring-blue-500 ${errors.first_name && touched.first_name
                      ? "border-red-500"
                      : ""
                    }`}
                />
              </div>
              {errors.first_name && touched.first_name && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.first_name}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Apellido <span className="text-red-500">*</span>
              </label>
              <Input
                name="last_name"
                type="text"
                placeholder="Apellido"
                value={formData.last_name}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isLoading}
                className={`w-full h-11 border-gray-200 rounded-lg focus:ring-blue-500 ${errors.last_name && touched.last_name
                    ? "border-red-500"
                    : ""
                  }`}
              />
              {errors.last_name && touched.last_name && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.last_name}
                </p>
              )}
            </div>
          </div>

          {/* Email / Teléfono */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Correo electrónico{" "}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  name="email"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isLoading}
                  className={`w-full h-11 pl-10 border-gray-200 rounded-lg focus:ring-blue-500 ${errors.email && touched.email ? "border-red-500" : ""
                    }`}
                />
              </div>
              {errors.email && touched.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Teléfono{" "}
                <span className="text-gray-400 text-xs">
                  (Opcional)
                </span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <style jsx global>{`
       .custom-phone-input .react-tel-input { width: 100%; }
       .custom-phone-input .react-tel-input .form-control {
         width: 100%; height: 44px; padding: 0 0 0 52px; border: 2px solid #d1d5db;
         border-radius: 8px; font-size: 16px; background: white; transition: all 0.2s ease;
       }
       .custom-phone-input .react-tel-input .form-control:focus {
         border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); outline: none;
       }
       .custom-phone-input .react-tel-input .flag-dropdown {
         border: 2px solid #d1d5db; border-right: none; border-radius: 8px 0 0 8px;
         background: white; height: 44px;
       }
       .custom-phone-input .react-tel-input .flag-dropdown:hover { background: #f9fafb; }
       .custom-phone-input .react-tel-input .flag-dropdown.open { border-color: #3b82f6; }
       .custom-phone-input .react-tel-input .selected-flag { padding: 0 8px 0 12px; height: 40px; }
       .custom-phone-input .react-tel-input .selected-flag .arrow { border-top-color: #6b7280; }
       .custom-phone-input .country-list {
         border-radius: 8px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
         border: 1px solid #e5e7eb; max-height: 250px; z-index: 9999;
       }
       .custom-phone-input .country-list .search { padding: 8px 12px; border-bottom: 1px solid #e5e7eb; background: #f9fafb; }
       .custom-phone-input .country-list .search input {
         width: 100%; padding: 6px 8px; border: 1px solid #d1d5db;
         border-radius: 4px; font-size: 14px;
       }
       .custom-phone-input .country-list .country { padding: 10px 12px; display: flex; align-items: center; }
       .custom-phone-input .country-list .country:hover { background: #f3f4f6; }
       .custom-phone-input .country-list .country.highlight { background: #dbeafe; }
       .custom-phone-input .country-list .country .country-name { margin-left: 8px; font-size: 14px; }
       .custom-phone-input .country-list .country .dial-code { margin-left: auto; font-size: 13px; color: #6b7280; }
     `}</style>
                <div className="custom-phone-input">
                  <PhoneInput
                    country={defaultCountry}
                    value={formData.phone}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, phone: value.replace(/\D/g, "") }))
                    }
                    inputProps={{
                      name: "phone",
                      required: false,
                      id: "phone-input-field",
                      placeholder: "Ingresa tu número de teléfono",
                    }}
                    containerClass="w-full"
                    dropdownClass="z-50"
                    preferredCountries={["cr", "us", "mx", "gt", "ni", "pa", "hn", "sv", "bz"]}
                    enableSearch={true}
                    searchPlaceholder="Buscar país o código..."
                    searchNotFound="No se encontró el país"
                  />
                </div>
              </div>
              {errors.phone && touched.phone && (
                <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
              )}
            </div>
          </div>

          {errors.contact && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600 flex items-center">
                <Info className="h-4 w-4 mr-2" />
                {errors.contact}
              </p>
            </div>
          )}

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-100">
            <div className="flex items-start">
              <Shield className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <h3 className="text-sm font-semibold text-blue-900 mb-1">
                  ¡Tu seguridad es nuestra prioridad!
                </h3>
                <p className="text-sm text-blue-700 leading-relaxed">
                  Una vez completado el registro, te enviaremos un correo
                  electrónico o mensaje de texto con tu contraseña temporal
                  segura. Podrás cambiarla cuando inicies sesión por primera
                  vez.
                </p>
                <p className="text-xs text-blue-600 mt-2 font-medium">
                  💡 Tip: Revisa tu bandeja de spam si no ves el correo.
                </p>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creando tu
                cuenta...
              </>
            ) : (
              "Crear cuenta"
            )}
          </Button>

          <div className="text-center mt-4">
            <span className="text-sm text-gray-600">
              ¿Ya tienes una cuenta?{" "}
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="text-blue-600 hover:underline"
              >
                Iniciar sesión
              </button>
            </span>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
