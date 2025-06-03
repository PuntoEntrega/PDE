"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/Components/ui/button"
import { Input } from "@/Components/ui/input"
import { Textarea } from "@/Components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/Components/ui/tooltip"
import {
  Building,
  UserIcon as UserTie,
  Mail,
  Phone,
  FileText,
  Briefcase,
  MapPin,
  Save,
  Loader2,
  Camera,
  X,
} from "lucide-react"
import { z } from "zod"
import { UserIcon } from "lucide-react"

// Schemas de validación
const companySchema = z.object({
  legal_name: z.string().min(3, "Denominación fiscal requerida (mín. 3 caracteres)"),
  trade_name: z.string().min(3, "Nombre de comercio requerido (mín. 3 caracteres)"),
  legal_id: z.string().min(5, "NIF requerido (mín. 5 caracteres)"),
  fiscal_address: z.string().min(10, "Domicilio fiscal requerido (mín. 10 caracteres)"),
  contact_email: z.string().email("Correo electrónico de contacto inválido"),
  contact_phone: z.string().regex(/^\d{4,15}$/, "Teléfono de contacto inválido (solo números, 4-15 dígitos)"),
  company_type: z.enum(["PdE", "Transportista"], { required_error: "Tipo de empresa es requerido" }),
  avatar_url: z.string().optional(),
})

const legalRepSchema = z.object({
  document_type_id: z.string().min(1, "Tipo de documento requerido"),
  full_name: z.string().min(5, "Nombre completo requerido (mín. 5 caracteres)"),
  identification_number: z.string().min(5, "Número de identificación requerido (mín. 5 caracteres)"),
  email: z.string().email("Correo electrónico inválido"),
  primary_phone: z.string().regex(/^\d{4,15}$/, "Teléfono principal inválido (solo números, 4-15 dígitos)"),
  secondary_phone: z
    .string()
    .regex(/^\d{4,15}$/, "Teléfono secundario inválido")
    .optional()
    .or(z.literal("")),
})

interface CompanyGeneralFormProps {
  initialCompanyData?: any
  initialLegalRepData?: any
  onSave: (data: {
    company: z.infer<typeof companySchema>
    legalRepresentative: z.infer<typeof legalRepSchema>
  }) => void
  isSaving: boolean
}

export function CompanyGeneralForm({
  initialCompanyData,
  initialLegalRepData,
  onSave,
  isSaving,
}: CompanyGeneralFormProps) {
  const [companyFormData, setCompanyFormData] = useState(
    initialCompanyData || {
      legal_name: "",
      trade_name: "",
      legal_id: "",
      fiscal_address: "",
      contact_email: "",
      contact_phone: "",
      company_type: "PdE",
      avatar_url: "",
    },
  )
  const [legalRepFormData, setLegalRepFormData] = useState(
    initialLegalRepData || {
      document_type_id: "",
      full_name: "",
      identification_number: "",
      email: "",
      primary_phone: "",
      secondary_phone: "",
    },
  )

  const [companyErrors, setCompanyErrors] = useState<Record<string, string>>({})
  const [legalRepErrors, setLegalRepErrors] = useState<Record<string, string>>({})

  const [companyImage, setCompanyImage] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    if (initialCompanyData) {
      setCompanyFormData(initialCompanyData)
      setCompanyImage(initialCompanyData.avatar_url || null)
    }
    if (initialLegalRepData) setLegalRepFormData(initialLegalRepData)
  }, [initialCompanyData, initialLegalRepData])

  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setCompanyFormData((prev: any) => ({ ...prev, [name]: value }))
    if (companyErrors[name]) setCompanyErrors((prev) => ({ ...prev, [name]: "" }))
  }

  const handleCompanySelectChange = (name: string, value: string) => {
    setCompanyFormData((prev: any) => ({ ...prev, [name]: value }))
    if (companyErrors[name]) setCompanyErrors((prev) => ({ ...prev, [name]: "" }))
  }

  const handleLegalRepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setLegalRepFormData((prev: any) => ({ ...prev, [name]: value }))
    if (legalRepErrors[name]) setLegalRepErrors((prev) => ({ ...prev, [name]: "" }))
  }

  const handleLegalRepSelectChange = (name: string, value: string) => {
    setLegalRepFormData((prev: any) => ({ ...prev, [name]: value }))
    if (legalRepErrors[name]) setLegalRepErrors((prev) => ({ ...prev, [name]: "" }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setIsUploading(true)
      const imageUrl = URL.createObjectURL(file)

      // Solo para mostrar un efecto visual de carga breve
      setTimeout(() => {
        setCompanyImage(imageUrl)
        setCompanyFormData((prev: any) => ({ ...prev, avatar_url: imageUrl }))
        setIsUploading(false)
      }, 1200)
    }
  }

  const handleRemoveImage = () => {
    setCompanyImage(null)
    setCompanyFormData((prev: any) => ({ ...prev, avatar_url: "" }))
  }

  const validateForms = () => {
    const companyValidation = companySchema.safeParse(companyFormData)
    const legalRepValidation = legalRepSchema.safeParse(legalRepFormData)

    let isValid = true
    if (!companyValidation.success) {
      const errors: Record<string, string> = {}
      companyValidation.error.errors.forEach((err) => (errors[err.path[0] as string] = err.message))
      setCompanyErrors(errors)
      isValid = false
    } else {
      setCompanyErrors({})
    }

    if (!legalRepValidation.success) {
      const errors: Record<string, string> = {}
      legalRepValidation.error.errors.forEach((err) => (errors[err.path[0] as string] = err.message))
      setLegalRepErrors(errors)
      isValid = false
    } else {
      setLegalRepErrors({})
    }
    return isValid
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForms()) {
      onSave({ company: companyFormData, legalRepresentative: legalRepFormData })
    }
  }

  const documentTypes = [
    { value: "cedula-fisica", label: "Cédula Física Nacional" },
    { value: "cedula-juridica", label: "Cédula Jurídica" },
    { value: "pasaporte", label: "Pasaporte" },
    { value: "dimex", label: "DIMEX (Residencia)" },
  ]

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Datos de la Empresa */}
        <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-t-lg border-b">
            <CardTitle className="text-xl font-semibold text-gray-800 flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <Building className="h-6 w-6 text-blue-600" />
              </div>
              Datos de la Empresa
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2">Información general de tu empresa</p>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Logo de la Empresa */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
              <h3 className="text-lg font-medium text-gray-700 mb-4 flex items-center">
                <Building className="mr-2 h-5 w-5 text-blue-500" />
                Logo de la Empresa
              </h3>
              <div className="flex items-center justify-start">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-100 flex items-center justify-center">
                    {isUploading ? (
                      <div className="absolute inset-0 bg-gray-200/80 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                      </div>
                    ) : companyImage ? (
                      <>
                        <Image
                          src={companyImage || "/placeholder.svg"}
                          alt="Logo de la empresa"
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors shadow-sm"
                          aria-label="Eliminar logo"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <Building className="h-12 w-12 text-gray-400" />
                    )}
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <label
                          htmlFor="company-logo"
                          className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors shadow-lg"
                        >
                          <Camera className="h-5 w-5" />
                          <span className="sr-only">Cambiar logo</span>
                        </label>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Subir nuevo logo</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <input
                    id="company-logo"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>
                <div className="ml-6">
                  <h4 className="font-medium text-gray-800">Logo de la empresa</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Sube el logo de tu empresa. Será visible en documentos y facturas.
                  </p>
                  <p className="text-xs text-gray-400 mt-2">Formatos permitidos: JPG, PNG. Tamaño máximo: 5MB</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Denominación Fiscal"
                name="legal_name"
                value={companyFormData.legal_name}
                onChange={handleCompanyChange}
                error={companyErrors.legal_name}
                icon={FileText}
                required
              />
              <InputField
                label="Nombre de Comercio"
                name="trade_name"
                value={companyFormData.trade_name}
                onChange={handleCompanyChange}
                error={companyErrors.trade_name}
                icon={Briefcase}
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Número de Identificación Fiscal (NIF)"
                name="legal_id"
                value={companyFormData.legal_id}
                onChange={handleCompanyChange}
                error={companyErrors.legal_id}
                icon={FileText}
                required
              />
              <SelectField
                label="Tipo de Empresa"
                name="company_type"
                value={companyFormData.company_type}
                onValueChange={(value) => handleCompanySelectChange("company_type", value)}
                options={[
                  { value: "PdE", label: "Punto de Entrega (PdE)" },
                  { value: "Transportista", label: "Transportista" },
                ]}
                error={companyErrors.company_type}
                required
              />
            </div>
            <div>
              <label htmlFor="fiscal_address" className="block text-sm font-semibold text-gray-800 mb-2">
                Domicilio Fiscal <span className="text-red-500">*</span>
              </label>
              <Textarea
                id="fiscal_address"
                name="fiscal_address"
                value={companyFormData.fiscal_address}
                onChange={handleCompanyChange}
                placeholder="Ej: Calle Principal 123, San José, Costa Rica"
                className={`min-h-[80px] ${companyErrors.fiscal_address ? "border-red-500" : "border-gray-300"}`}
              />
              {companyErrors.fiscal_address && (
                <p className="text-xs text-red-500 mt-1">{companyErrors.fiscal_address}</p>
              )}
            </div>
            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Datos de Contacto</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Correo Electrónico de Contacto"
                  name="contact_email"
                  type="email"
                  value={companyFormData.contact_email}
                  onChange={handleCompanyChange}
                  error={companyErrors.contact_email}
                  icon={Mail}
                  required
                />
                <InputField
                  label="Teléfono de Contacto"
                  name="contact_phone"
                  type="tel"
                  value={companyFormData.contact_phone}
                  onChange={handleCompanyChange}
                  error={companyErrors.contact_phone}
                  icon={Phone}
                  placeholder="Ej: 22334455"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Datos del Representante Legal */}
        <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-t-lg border-b">
            <CardTitle className="text-xl font-semibold text-gray-800 flex items-center">
              <div className="p-2 bg-green-100 rounded-lg mr-3">
                <UserTie className="h-6 w-6 text-green-600" />
              </div>
              Datos del Representante Legal
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2">Información del representante legal de la empresa</p>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <SelectField
                label="Tipo de Identificación"
                name="document_type_id"
                value={legalRepFormData.document_type_id}
                onValueChange={(value) => handleLegalRepSelectChange("document_type_id", value)}
                options={documentTypes}
                error={legalRepErrors.document_type_id}
                required
              />
              <InputField
                label="Número de Identificación"
                name="identification_number"
                value={legalRepFormData.identification_number}
                onChange={handleLegalRepChange}
                error={legalRepErrors.identification_number}
                icon={FileText}
                required
              />
              <InputField
                label="Nombre Completo"
                name="full_name"
                value={legalRepFormData.full_name}
                onChange={handleLegalRepChange}
                error={legalRepErrors.full_name}
                icon={UserIcon}
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <InputField
                label="Correo Electrónico"
                name="email"
                type="email"
                value={legalRepFormData.email}
                onChange={handleLegalRepChange}
                error={legalRepErrors.email}
                icon={Mail}
                required
              />
              <InputField
                label="Teléfono Principal"
                name="primary_phone"
                type="tel"
                value={legalRepFormData.primary_phone}
                onChange={handleLegalRepChange}
                error={legalRepErrors.primary_phone}
                icon={Phone}
                placeholder="Ej: 88776655"
                required
              />
              <InputField
                label="Teléfono Secundario (Opcional)"
                name="secondary_phone"
                type="tel"
                value={legalRepFormData.secondary_phone}
                onChange={handleLegalRepChange}
                error={legalRepErrors.secondary_phone}
                icon={Phone}
              />
            </div>
          </CardContent>
        </Card>

        {/* Puntos de Entrega */}
        <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 p-6 rounded-t-lg border-b">
            <CardTitle className="text-xl font-semibold text-gray-800 flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg mr-3">
                <MapPin className="h-6 w-6 text-purple-600" />
              </div>
              Puntos de Entrega
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2">Configura la cantidad inicial de puntos de entrega</p>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-4">¿Cuántos Puntos de Entrega (PdE) desea habilitar inicialmente?</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button type="button" variant="outline" className="h-12 border-2 hover:border-blue-500 hover:bg-blue-50">
                1 Punto de Entrega
              </Button>
              <Button type="button" variant="outline" className="h-12 border-2 hover:border-blue-500 hover:bg-blue-50">
                Más de 1 Punto de Entrega
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Podrá agregar más PdEs más adelante desde el panel de administración.
            </p>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-6">
          <Button
            type="submit"
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-200"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-5 w-5" />
                Guardar Datos Generales
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

// Componente reutilizable para InputField
const InputField = ({ label, name, type = "text", value, onChange, error, icon: Icon, placeholder, required }: any) => (
  <div>
    <label htmlFor={name} className="block text-sm font-semibold text-gray-800 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />}
      <Input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder || `Ingrese ${label.toLowerCase()}`}
        className={`${Icon ? "pl-11" : ""} ${error ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-blue-500"} h-12 text-sm transition-colors`}
      />
    </div>
    {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
  </div>
)

// Componente reutilizable para SelectField
const SelectField = ({ label, name, value, onValueChange, options, error, required }: any) => (
  <div>
    <label htmlFor={name} className="block text-sm font-semibold text-gray-800 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <Select name={name} value={value} onValueChange={onValueChange}>
      <SelectTrigger
        className={`${error ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-blue-500"} h-12 text-sm transition-colors`}
      >
        <SelectValue placeholder={`Seleccione ${label.toLowerCase()}`} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option: any) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
  </div>
)
