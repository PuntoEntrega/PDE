"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/Components/ui/button"
import { Input } from "@/Components/ui/input"
import { Textarea } from "@/Components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/Components/ui/tooltip"
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
import { useUser } from "@/context/UserContext"
import { useAlert } from "@/Components/alerts/use-alert"
import { useRouter } from "next/navigation"

// ─────────────────────────────────────────────────────────────────────────────
// (Los schemas de validación se mantienen igual que antes)
// ─────────────────────────────────────────────────────────────────────────────
const companySchema = z.object({ /* … mismo que antes … */ })
const legalRepSchema = z.object({ /* … mismo que antes … */ })

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
  const router = useRouter()
  const { user } = useUser()
  const { showAlert } = useAlert()

  // ───────────────────────────────────────────────────────────────────────────
  // Estados locales
  // ───────────────────────────────────────────────────────────────────────────
  const [companyFormData, setCompanyFormData] = useState({
    legal_name: "",
    trade_name: "",
    legal_id: "",
    fiscal_address: "",
    contact_email: "",
    contact_phone: "",
    company_type: "PdE",
    avatar_url: "",
    ...(initialCompanyData || {}),
  })
  const [legalRepFormData, setLegalRepFormData] = useState({
    document_type_id: "",
    full_name: "",
    identification_number: "",
    email: "",
    primary_phone: "",
    secondary_phone: "",
    ...(initialLegalRepData || {}),
  })

  const [companyErrors, setCompanyErrors] = useState<Record<string, string>>({})
  const [legalRepErrors, setLegalRepErrors] = useState<Record<string, string>>({})
  const [companyImage, setCompanyImage] = useState<string | null>(
    initialCompanyData?.avatar_url || null
  )
  const [isUploading, setIsUploading] = useState(false)
  const [documentTypes, setDocumentTypes] = useState<{ value: string; label: string }[]>([])

  const [isSavingLocal, setIsSavingLocal] = useState(false)

  // ← ¡NUEVO! Flag para saber si el usuario está en modo “edición” (PATCH)
  const [isEditing, setIsEditing] = useState(false)

  // ← El mismo estado que antes, para guardar el draftCompanyId retornado desde Redis
  const [draftCompanyId, setDraftCompanyId] = useState<string | null>(null)

  // Un flag para simplificar readOnly/disabled
  const isDraft = !!draftCompanyId

  // ───────────────────────────────────────────────────────────────────────────
  // useEffect: cargar datos iniciales desde props
  // ───────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (initialCompanyData) {
      setCompanyFormData(initialCompanyData)
      setCompanyImage(initialCompanyData.avatar_url || null)
    }
    if (initialLegalRepData) {
      setLegalRepFormData(initialLegalRepData)
    }
  }, [initialCompanyData, initialLegalRepData])

  // ───────────────────────────────────────────────────────────────────────────
  // useEffect: cargar tipos de documento
  // ───────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/document-types")
      .then((res) => res.json())
      .then((data) => {
        const options = data.map((item: any) => ({
          value: item.id,
          label: item.name,
        }))
        setDocumentTypes(options)
      })
      .catch(() => {
        console.error("No se pudieron cargar los tipos de documento")
      })
  }, [])

  // ───────────────────────────────────────────────────────────────────────────
  // useEffect: si el usuario está autenticado, leer el draft de Redis
  // ───────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.sub) return

    fetch(`/api/companies/draft?user_id=${user.sub}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.companyId) {
          setDraftCompanyId(data.companyId)
        }
      })
      .catch(() => {
        showAlert("error", "Error", "No se pudo verificar el borrador de empresa.")
      })
  }, [user?.sub, showAlert])

  // ───────────────────────────────────────────────────────────────────────────
  // useEffect: si hay draftCompanyId, cargar datos completos de backend
  // ───────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!draftCompanyId) return

    fetch(`/api/companies/${draftCompanyId}/full-detail`)
      .then((res) => res.json())
      .then((data) => {
        if (data.company && data.legalRep) {
          setCompanyFormData({
            legal_name: data.company.legal_name || "",
            trade_name: data.company.trade_name || "",
            legal_id: data.company.legal_id || "",
            fiscal_address: data.company.fiscal_address || "",
            contact_email: data.company.contact_email || "",
            contact_phone: data.company.contact_phone || "",
            company_type: data.company.company_type || "PdE",
            avatar_url: data.company.logo_url || "",
          })
          setCompanyImage(data.company.logo_url || null)

          setLegalRepFormData({
            document_type_id: data.legalRep.document_type_id || "",
            full_name: data.legalRep.full_name || "",
            identification_number: data.legalRep.identification_number || "",
            email: data.legalRep.email || "",
            primary_phone: data.legalRep.primary_phone || "",
            secondary_phone: data.legalRep.secondary_phone || "",
          })
        }
      })
      .catch(() => {
        showAlert("error", "Error", "No se pudo cargar la información de la empresa.")
      })
  }, [draftCompanyId, showAlert])

  // ───────────────────────────────────────────────────────────────────────────
  // Handlers para inputs
  // ───────────────────────────────────────────────────────────────────────────
  const handleCompanyChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setCompanyFormData((prev: any) => ({ ...prev, [name]: value }))
    if (companyErrors[name]) {
      setCompanyErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleCompanySelectChange = (name: string, value: string) => {
    setCompanyFormData((prev: any) => ({ ...prev, [name]: value }))
    if (companyErrors[name]) {
      setCompanyErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleLegalRepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setLegalRepFormData((prev: any) => ({ ...prev, [name]: value }))
    if (legalRepErrors[name]) {
      setLegalRepErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleLegalRepSelectChange = (name: string, value: string) => {
    setLegalRepFormData((prev: any) => ({ ...prev, [name]: value }))
    if (legalRepErrors[name]) {
      setLegalRepErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Handler para subir logo (imagen)
  // ───────────────────────────────────────────────────────────────────────────
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const imageUrl = URL.createObjectURL(file)

    setTimeout(() => {
      setCompanyImage(imageUrl)
      setCompanyFormData((prev: any) => ({ ...prev, avatar_url: imageUrl }))
      setIsUploading(false)
    }, 1200)
  }

  const handleRemoveImage = () => {
    setCompanyImage(null)
    setCompanyFormData((prev: any) => ({ ...prev, avatar_url: "" }))
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Validación con Zod
  // ───────────────────────────────────────────────────────────────────────────
  const validateForms = () => {
    const companyValidation = companySchema.safeParse(companyFormData)
    const legalRepValidation = legalRepSchema.safeParse(legalRepFormData)

    let isValid = true
    if (!companyValidation.success) {
      const errors: Record<string, string> = {}
      companyValidation.error.errors.forEach(
        (err) => (errors[err.path[0] as string] = err.message)
      )
      setCompanyErrors(errors)
      isValid = false
    } else {
      setCompanyErrors({})
    }

    if (!legalRepValidation.success) {
      const errors: Record<string, string> = {}
      legalRepValidation.error.errors.forEach(
        (err) => (errors[err.path[0] as string] = err.message)
      )
      setLegalRepErrors(errors)
      isValid = false
    } else {
      setLegalRepErrors({})
    }
    return isValid
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Envío del formulario (crear empresa o actualizar si ya existe draft)
  // ───────────────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user?.sub) {
      showAlert("error", "Sesión inválida", "Debes iniciar sesión para continuar.")
      return
    }
    if (!validateForms()) return

    setIsSavingLocal(true)

    try {
      const method = draftCompanyId ? "PATCH" : "POST"
      const url = draftCompanyId
        ? `/api/companies/${draftCompanyId}`
        : "/api/companies"

      const formData = new FormData()
      // Campos de la compañía
      formData.append("legal_name", companyFormData.legal_name)
      formData.append("trade_name", companyFormData.trade_name)
      formData.append("legal_id", companyFormData.legal_id)
      formData.append("company_type", companyFormData.company_type)
      formData.append("fiscal_address", companyFormData.fiscal_address)
      formData.append("contact_email", companyFormData.contact_email)
      formData.append("contact_phone", companyFormData.contact_phone)
      if (!draftCompanyId) {
        // Solo en POST (creación), agregamos owner_user_id
        formData.append("owner_user_id", user.sub)
      }

      // Logo (avatar)
      const inputFile = document.getElementById(
        "company-logo"
      ) as HTMLInputElement
      if (inputFile?.files?.length) {
        formData.append("avatar", inputFile.files[0])
      }

      // Campos del representante legal
      formData.append("document_type_id", legalRepFormData.document_type_id)
      formData.append("full_name", legalRepFormData.full_name)
      formData.append(
        "identification_number",
        legalRepFormData.identification_number
      )
      formData.append("email", legalRepFormData.email)
      formData.append("primary_phone", legalRepFormData.primary_phone)
      formData.append(
        "secondary_phone",
        legalRepFormData.secondary_phone || ""
      )

      const response = await fetch(url, {
        method,
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Error en el servidor")
      }

      const result = await response.json()
      if (result.success) {
        showAlert(
          "success",
          draftCompanyId ? "¡Empresa actualizada!" : "¡Empresa creada!",
          draftCompanyId
            ? "Los cambios se guardaron correctamente."
            : "La empresa se creó con éxito."
        )

        if (!draftCompanyId) {
          // Si venimos de creación (POST), entonces debemos leer el companyId nuevo
          // y guardarlo en draftCompanyId (estado), para pasar a “modo draft + editado”
          const draftRes = await fetch(
            `/api/companies/draft?user_id=${user.sub}`
          )
          const draftData = await draftRes.json()
          if (draftData.companyId) {
            setDraftCompanyId(draftData.companyId)
          }
        } else {
          // Si era un PATCH, salimos de modo edición
          setIsEditing(false)
        }
      } else {
        showAlert("error", "Error", "No se pudo guardar. Intenta de nuevo.")
      }
    } catch (err) {
      console.error(err)
      showAlert("error", "Error", "Ocurrió un error inesperado.")
    }

    setIsSavingLocal(false)
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Cambiar entre “ver” y “editar” cuando ya hay un draft existente
  // ───────────────────────────────────────────────────────────────────────────
  const handleToggleEdit = () => {
    setIsEditing((prev) => !prev)
  }

  // ───────────────────────────────────────────────────────────────────────────
  // JSX: Formulario con campos readOnly/disabled o habilitados si isEditing = true
  // ───────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ─────────────────────────────────────────────────────────────────────
             Datos de la Empresa
           ────────────────────────────────────────────────────────────────── */}
        <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-t-lg border-b">
            <CardTitle className="text-xl font-semibold text-gray-800 flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <Building className="h-6 w-6 text-blue-600" />
              </div>
              Datos de la Empresa
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              Información general de tu empresa
            </p>
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
                          disabled={!isEditing}
                          className={`absolute top-0 right-0 p-1 rounded-full transition-colors shadow-sm ${!isEditing
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-red-500 text-white hover:bg-red-600"
                            }`}
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
                          className={`absolute bottom-0 right-0 p-2 rounded-full transition-colors shadow-lg ${!isEditing
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                            }`}
                          aria-disabled={!isEditing}
                        >
                          <Camera className="h-5 w-5" />
                          <span className="sr-only">
                            {!isEditing ? "No editable" : "Subir nuevo logo"}
                          </span>
                        </label>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {!isEditing
                            ? "No puedes cambiar el logo"
                            : "Subir nuevo logo"}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <input
                    id="company-logo"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={isDraft && !isEditing}
                  />
                </div>
                <div className="ml-6">
                  <h4 className="font-medium text-gray-800">
                    Logo de la empresa
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">
                    {!isEditing
                      ? "No puedes modificar el logo."
                      : "Sube el logo de tu empresa. Será visible en documentos y facturas."}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Formatos: JPG, PNG. Tamaño máximo: 5MB
                  </p>
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
                readOnly={isDraft && !isEditing}
              />
              <InputField
                label="Nombre de Comercio"
                name="trade_name"
                value={companyFormData.trade_name}
                onChange={handleCompanyChange}
                error={companyErrors.trade_name}
                icon={Briefcase}
                required
                readOnly={isDraft && !isEditing}
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
                readOnly={isDraft && !isEditing}
              />
              <SelectField
                label="Tipo de Empresa"
                name="company_type"
                value={companyFormData.company_type}
                onValueChange={(value) =>
                  handleCompanySelectChange("company_type", value)
                }
                options={[
                  { value: "PdE", label: "Punto de Entrega (PdE)" },
                  { value: "Transportista", label: "Transportista" },
                ]}
                error={companyErrors.company_type}
                required
                disabled={isDraft && !isEditing}
              />
            </div>
            <div>
              <label
                htmlFor="fiscal_address"
                className="block text-sm font-semibold text-gray-800 mb-2"
              >
                Domicilio Fiscal <span className="text-red-500">*</span>
              </label>
              <Textarea
                id="fiscal_address"
                name="fiscal_address"
                value={companyFormData.fiscal_address}
                onChange={handleCompanyChange}
                placeholder="Ej: Calle Principal 123, San José, Costa Rica"
                className={`min-h-[80px] ${companyErrors.fiscal_address
                    ? "border-red-500"
                    : "border-gray-300"
                  }`}
                readOnly={isDraft && !isEditing}
              />
              {companyErrors.fiscal_address && (
                <p className="text-xs text-red-500 mt-1">
                  {companyErrors.fiscal_address}
                </p>
              )}
            </div>
            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">
                Datos de Contacto
              </h4>
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
                  readOnly={isDraft && !isEditing}
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
                  readOnly={isDraft && !isEditing}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ─────────────────────────────────────────────────────────────────────
             Datos del Representante Legal
           ────────────────────────────────────────────────────────────────── */}
        <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-t-lg border-b">
            <CardTitle className="text-xl font-semibold text-gray-800 flex items-center">
              <div className="p-2 bg-green-100 rounded-lg mr-3">
                <UserTie className="h-6 w-6 text-green-600" />
              </div>
              Datos del Representante Legal
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              Información del representante legal de la empresa
            </p>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <SelectField
                label="Tipo de Identificación"
                name="document_type_id"
                value={legalRepFormData.document_type_id}
                onValueChange={(value) =>
                  handleLegalRepSelectChange("document_type_id", value)
                }
                options={documentTypes}
                error={legalRepErrors.document_type_id}
                required
                disabled={isDraft && !isEditing}
              />
              <InputField
                label="Número de Identificación"
                name="identification_number"
                value={legalRepFormData.identification_number}
                onChange={handleLegalRepChange}
                error={legalRepErrors.identification_number}
                icon={FileText}
                required
                readOnly={isDraft && !isEditing}
              />
              <InputField
                label="Nombre Completo"
                name="full_name"
                value={legalRepFormData.full_name}
                onChange={handleLegalRepChange}
                error={legalRepErrors.full_name}
                icon={UserIcon}
                required
                readOnly={isDraft && !isEditing}
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
                readOnly={isDraft && !isEditing}
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
                readOnly={isDraft && !isEditing}
              />
              <InputField
                label="Teléfono Secundario (Opcional)"
                name="secondary_phone"
                type="tel"
                value={legalRepFormData.secondary_phone}
                onChange={handleLegalRepChange}
                error={legalRepErrors.secondary_phone}
                icon={Phone}
                readOnly={isDraft && !isEditing}
              />
            </div>
          </CardContent>
        </Card>

        {/* ─────────────────────────────────────────────────────────────────────
             Botón Guardar / Guardar Cambios
           ────────────────────────────────────────────────────────────────── */}
        {(!draftCompanyId || isEditing) && (
          <div className="flex justify-end pt-6">
            <Button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={isSavingLocal}
            >
              {isSavingLocal ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-5 w-5" />
                  {draftCompanyId ? "Guardar Cambios" : "Guardar Datos Generales"}
                </>
              )}
            </Button>
                    {/* ─────────────────────────────────────────────────────────────────────
             Botón Cancelar Edición
           ────────────────────────────────────────────────────────────────── */}
        {draftCompanyId && isEditing && (
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleToggleEdit}
              className="px-6 py-2 text-sm"
            >
              Cancelar
            </Button>
          </div>
        )}
          </div>
        )}

              {/* ─────────── Si existe draftCompanyId y no estamos en modo edición, mostramos botón “Editar” ─────────── */}
      {draftCompanyId && !isEditing && (
        <div className="flex justify-end">
          <Button
            onClick={handleToggleEdit}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-200"
          >
          <Save className="mr-2 h-5 w-5" />
            Editar empresa
          </Button>
        </div>
      )}

      </form>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Componentes reutilizables: InputField y SelectField
// (idénticos a los anteriores, solo respetan la prop readOnly/disabled)
// ─────────────────────────────────────────────────────────────────────────────
const InputField = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  error,
  icon: Icon,
  placeholder,
  required,
  readOnly = false,
}: any) => (
  <div>
    <label
      htmlFor={name}
      className="block text-sm font-semibold text-gray-800 mb-2"
    >
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
      )}
      <Input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={readOnly ? undefined : onChange}
        placeholder={placeholder || `Ingrese ${label.toLowerCase()}`}
        readOnly={readOnly}
        className={`${Icon ? "pl-11" : ""
          } ${error
            ? "border-red-500 focus:border-red-500"
            : "border-gray-300 focus:border-blue-500"
          } h-12 text-sm transition-colors ${readOnly ? "bg-gray-100 cursor-not-allowed" : ""
          }`}
      />
    </div>
    {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
  </div>
)

const SelectField = ({
  label,
  name,
  value,
  onValueChange,
  options,
  error,
  required,
  disabled = false,
}: any) => (
  <div>
    <label
      htmlFor={name}
      className="block text-sm font-semibold text-gray-800 mb-2"
    >
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <Select
      name={name}
      value={value}
      onValueChange={disabled ? undefined : onValueChange}
      disabled={disabled}
    >
      <SelectTrigger
        className={`${error
          ? "border-red-500 focus:border-red-500"
          : "border-gray-300 focus:border-blue-500"
          } h-12 text-sm transition-colors ${disabled ? "bg-gray-100 cursor-not-allowed" : ""
          }`}
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
