// src/app/Components/Companies/create-company-form.tsx
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useForm, type SubmitHandler, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { fullCompanySchema, type FullCompanyFormData } from "@/lib/schemas/company-schema"
import { Button } from "@/Components/ui/button"
import { Input } from "@/Components/ui/input"
import { Label } from "@/Components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select"
import { useToast } from "@/Components/ui/use-toast"
import { Textarea } from "@/Components/ui/textarea"
import {
    Building2,
    Upload,
    ArrowLeft,
    Loader2,
    AlertCircle,
    Save,
    User,
    Mail,
    Phone,
    MapPin,
    FileText,
    Briefcase,
    ImageIcon,
    CheckCircle,
    Network,
    ChevronRight,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar"
import { useRouter } from "next/navigation"
import { Sidebar } from "../Sidebar/Sidebar"
import { useUser } from "@/context/UserContext"
import { getCompaniesByUserId } from "@/Services/companies"
import { Badge } from "@/Components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/Components/ui/tooltip"

interface InputFieldProps {
    label: string
    name: string
    type?: string
    register: any
    error?: any
    required?: boolean
    placeholder?: string
    description?: string
    icon?: React.ElementType
}

interface SelectFieldProps {
    label: string
    value?: string
    onValueChange: (value: string) => void
    options: { value: string; label: string; hierarchy?: string }[]
    error?: any
    required?: boolean
    placeholder?: string
    description?: string
    icon?: React.ElementType
}

interface TextareaFieldProps {
    label: string
    name: string
    register: any
    error?: any
    required?: boolean
    placeholder?: string
    description?: string
    rows?: number
    icon?: React.ElementType
}

const InputField: React.FC<InputFieldProps> = ({
    label,
    name,
    type = "text",
    register,
    error,
    required,
    placeholder,
    description,
    icon: Icon,
}) => (
    <div className="space-y-2">
        <Label htmlFor={name} className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            {Icon && <Icon className="h-4 w-4 text-blue-600" />}
            {label}
            {required && <span className="text-red-500">*</span>}
        </Label>
        <Input
            id={name}
            type={type}
            {...register(name)}
            placeholder={placeholder || `Ingrese ${label.toLowerCase()}`}
            className={`h-11 transition-all duration-200 ${error
                ? "border-red-500 focus-visible:ring-red-500 bg-red-50"
                : "border-gray-300 focus-visible:ring-blue-500 focus-visible:border-blue-500 bg-white"
                }`}
        />
        {description && !error && <p className="text-xs text-gray-500">{description}</p>}
        {error && (
            <div className="flex items-center space-x-1">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <p className="text-red-600 text-xs">{error.message}</p>
            </div>
        )}
    </div>
)

interface CreateCompanyFormProps {
    initialData?: FullCompanyFormData & { id?: string }
}

const SelectField: React.FC<SelectFieldProps> = ({
    label,
    value,
    onValueChange,
    options,
    error,
    required,
    placeholder,
    description,
    icon: Icon,
}) => (
    <div className="space-y-2">
        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            {Icon && <Icon className="h-4 w-4 text-blue-600" />}
            {label}
            {required && <span className="text-red-500">*</span>}
        </Label>
        <Select value={value} onValueChange={onValueChange}>
            <SelectTrigger
                className={`h-11 transition-all duration-200 ${error
                    ? "border-red-500 focus-visible:ring-red-500 bg-red-50"
                    : "border-gray-300 focus-visible:ring-blue-500 bg-white"
                    }`}
            >
                <SelectValue placeholder={placeholder || `Seleccione ${label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
                {options.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="py-3">
                        <div className="flex items-center justify-between w-full">
                            <span>{option.label}</span>
                            {option.hierarchy && (
                                <Badge variant="outline" className="ml-2 text-xs bg-blue-50 text-blue-700 border-blue-200">
                                    {option.hierarchy}
                                </Badge>
                            )}
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
        {description && !error && <p className="text-xs text-gray-500">{description}</p>}
        {error && (
            <div className="flex items-center space-x-1">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <p className="text-red-600 text-xs">{error.message}</p>
            </div>
        )}
    </div>
)

const TextareaField: React.FC<TextareaFieldProps> = ({
    label,
    name,
    register,
    error,
    required,
    placeholder,
    description,
    rows = 3,
    icon: Icon,
}) => (
    <div className="space-y-2">
        <Label htmlFor={name} className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            {Icon && <Icon className="h-4 w-4 text-blue-600" />}
            {label}
            {required && <span className="text-red-500">*</span>}
        </Label>
        <Textarea
            id={name}
            rows={rows}
            {...register(name)}
            placeholder={placeholder || `Ingrese ${label.toLowerCase()}`}
            className={`transition-all duration-200 resize-none ${error
                ? "border-red-500 focus-visible:ring-red-500 bg-red-50"
                : "border-gray-300 focus-visible:ring-blue-500 focus-visible:border-blue-500 bg-white"
                }`}
        />
        {description && !error && <p className="text-xs text-gray-500">{description}</p>}
        {error && (
            <div className="flex items-center space-x-1">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <p className="text-red-600 text-xs">{error.message}</p>
            </div>
        )}
    </div>
)

const SectionCard = ({
    icon: Icon,
    title,
    description,
    children,
}: {
    icon: React.ElementType
    title: string
    description: string
    children: React.ReactNode
}) => (
    <Card className="shadow-lg border border-gray-200 rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-slate-100 p-5 border-b">
            <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-100 rounded-lg shadow-sm">
                    <Icon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                    <CardTitle className="text-lg font-semibold text-gray-800">{title}</CardTitle>
                    <p className="text-sm text-gray-600 mt-0.5">{description}</p>
                </div>
            </div>
        </CardHeader>
        <CardContent className="p-6">{children}</CardContent>
    </Card>
)

export function CreateCompanyForm({ initialData }: CreateCompanyFormProps) {
    const [logoPreview, setLogoPreview] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [documentTypes, setDocumentTypes] = useState<{ value: string; label: string }[]>([])
    const [companies, setCompanies] = useState<any[]>([])
    const { toast } = useToast()
    const router = useRouter()
    const { user } = useUser()
    const isEditMode = !!initialData

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        control,
        formState: { errors, isValid },
    } = useForm<FullCompanyFormData>({
        resolver: zodResolver(fullCompanySchema),
        mode: "onChange",
        defaultValues: initialData ?? {
            legal_name: "",
            trade_name: "",
            legal_id: "",
            company_type: undefined,
            parent_company_id: "",
            contact_email: "",
            contact_phone: "",
            fiscal_address: "",
            logo_url: "",
            legal_representative: {
                full_name: "",
                identification_number: "",
                email: "",
                primary_phone: "",
                secondary_phone: "",
                document_type_id: "",
            },
        },
    })


    const watchedValues = watch()

    useEffect(() => {
        async function fetchCompanies() {
            if (!user?.sub) return
            try {
                const data = await getCompaniesByUserId(user.sub)
                setCompanies(data)
            } catch (err) {
                console.error("Error al traer compañías", err)
            }
        }

        fetchCompanies()
    }, [user?.sub])

    useEffect(() => {
        if (initialData?.logo_url) {
            setLogoPreview(initialData.logo_url)
        }
    }, [initialData])

    useEffect(() => {
        const fetchDocumentTypes = async () => {
            try {
                const res = await fetch("/api/document-types")
                const data = await res.json()
                const options = data.map((doc: any) => ({
                    value: doc.id,
                    label: doc.name,
                }))
                setDocumentTypes(options)
            } catch (error) {
                console.error("Error al cargar tipos de documento", error)
            }
        }

        fetchDocumentTypes()
    }, [])

    // Función para construir la jerarquía de empresas
    const buildCompanyHierarchy = () => {
        const companyOptions = companies.map((company) => {
            let hierarchy = ""
            let currentCompany = company

            // Construir la cadena de jerarquía
            const hierarchyChain = []
            while (currentCompany?.parent_company_id) {
                const parentCompany = companies.find((c) => c.id === currentCompany.parent_company_id)
                if (parentCompany) {
                    hierarchyChain.unshift(parentCompany.legal_name || parentCompany.trade_name)
                    currentCompany = parentCompany
                } else {
                    break
                }
            }

            if (hierarchyChain.length > 0) {
                hierarchy = hierarchyChain.join(" → ")
            }

            return {
                value: company.id,
                label: company.legal_name || company.trade_name,
                hierarchy: hierarchy || "Empresa raíz",
            }
        })

        return [
            { value: "none", label: "Sin empresa matriz", hierarchy: "" },
            ...companyOptions.sort((a, b) => {
                // Ordenar por jerarquía: empresas raíz primero, luego por nombre
                if (a.hierarchy === "Empresa raíz" && b.hierarchy !== "Empresa raíz") return -1
                if (b.hierarchy === "Empresa raíz" && a.hierarchy !== "Empresa raíz") return 1
                return a.label.localeCompare(b.label)
            }),
        ]
    }

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast({
                    title: "Archivo muy grande",
                    description: "El logo debe ser menor a 5MB.",
                    variant: "destructive",
                })
                return
            }

            if (!file.type.startsWith("image/")) {
                toast({
                    title: "Tipo de archivo inválido",
                    description: "Solo se permiten archivos de imagen.",
                    variant: "destructive",
                })
                return
            }

            const reader = new FileReader()
            reader.onloadend = () => {
                setLogoPreview(reader.result as string)
                setValue("logo_url", reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const onSubmit: SubmitHandler<FullCompanyFormData> = async (data) => {
        setIsSubmitting(true)

        try {
            const formData = new FormData()

            // Campos principales
            formData.append("legal_name", data.legal_name)
            formData.append("trade_name", data.trade_name)
            formData.append("legal_id", data.legal_id)
            formData.append("company_type", data.company_type || "")
            formData.append("fiscal_address", data.fiscal_address)
            formData.append("contact_email", data.contact_email)
            formData.append("contact_phone", data.contact_phone)

            if (data.parent_company_id && data.parent_company_id !== "none") {
                formData.append("parent_company_id", data.parent_company_id)
            } else {
                formData.append("parent_company_id", "")
            }

            if (!user?.sub) throw new Error("No se pudo obtener el usuario.")
            formData.append("owner_user_id", user.sub)

            // Representante legal
            formData.append("document_type_id", data.legal_representative.document_type_id)
            formData.append("full_name", data.legal_representative.full_name)
            formData.append("identification_number", data.legal_representative.identification_number)
            formData.append("email", data.legal_representative.email)
            formData.append("primary_phone", data.legal_representative.primary_phone)

            if (data.legal_representative.secondary_phone) {
                formData.append("secondary_phone", data.legal_representative.secondary_phone)
            }

            // Logo
            const logoInput = document.getElementById("logo-upload") as HTMLInputElement
            if (logoInput?.files?.length) {
                formData.append("avatar", logoInput.files[0])
            }

            const res = await fetch(initialData?.id ? `/api/companies/${initialData.id}` : "/api/companies", {
                method: initialData?.id ? "PATCH" : "POST",
                body: formData,
            })

            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.error || "Error al registrar la empresa")
            }

            toast({
                title: "¡Empresa Registrada Exitosamente!",
                description: `${data.legal_name} ha sido registrada correctamente en el sistema.`,
            })

            router.push("/companies")
        } catch (error: any) {
            console.error("Error al registrar empresa:", error)
            toast({
                title: "Error al registrar empresa",
                description: error.message || "Ocurrió un error inesperado.",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Sidebar>
            <div className="max-w-8xl mx-auto p-6 space-y-8">
                {/* Header */}
                <Card className="shadow-xl border-0 rounded-xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-br from-blue-50 via-slate-50 to-white p-8 border-b">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-blue-100 rounded-xl shadow-sm">
                                    <Building2 className="h-8 w-8 text-blue-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-3xl font-bold text-gray-800">
                                        {isEditMode ? "Editar Empresa" : "Registrar Nueva Empresa"}
                                    </CardTitle>
                                    <p className="text-gray-600 mt-1">Complete la información para registrar su empresa en el sistema.</p>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => router.push("/companies")}
                                className="border-gray-300 hover:bg-gray-100"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" /> Volver
                            </Button>
                        </div>
                    </CardHeader>
                </Card>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    {/* Información Básica */}
                    <SectionCard
                        icon={Building2}
                        title="Información Básica de la Empresa"
                        description="Datos generales y clasificación de la empresa"
                    >
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <InputField
                                    label="Nombre Legal de la Empresa"
                                    name="legal_name"
                                    register={register}
                                    error={errors.legal_name}
                                    required
                                    placeholder="Ej: Transportes Rápidos S.A."
                                    description="Nombre oficial registrado de la empresa"
                                    icon={Building2}
                                />
                                <InputField
                                    label="Nombre Comercial"
                                    name="trade_name"
                                    register={register}
                                    error={errors.trade_name}
                                    placeholder="Ej: TransRápido"
                                    description="Nombre con el que opera comercialmente (opcional)"
                                    icon={Briefcase}
                                />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <InputField
                                    label="Cédula Jurídica / ID Fiscal"
                                    name="legal_id"
                                    register={register}
                                    error={errors.legal_id}
                                    required
                                    placeholder="3-101-123456"
                                    description="Número de identificación fiscal de la empresa"
                                    icon={FileText}
                                />
                                <Controller
                                    name="company_type"
                                    control={control}
                                    render={({ field }) => (
                                        <SelectField
                                            label="Tipo de Empresa"
                                            value={field.value}
                                            onValueChange={field.onChange}
                                            options={[
                                                { value: "PdE", label: "Punto de Entrega (PdE)" },
                                                { value: "Transportista", label: "Empresa Transportista" },
                                            ]}
                                            error={errors.company_type}
                                            required
                                            description="Selecciona el tipo de operación principal"
                                            icon={Briefcase}
                                        />
                                    )}
                                />
                            </div>

                            <Controller
                                name="parent_company_id"
                                control={control}
                                render={({ field }) => (
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <Network className="h-4 w-4 text-blue-600" />
                                            Empresa Matriz (Opcional)
                                        </Label>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger className="h-11 transition-all duration-200 border-gray-300 focus-visible:ring-blue-500 bg-white">
                                                <SelectValue placeholder="Seleccione la empresa matriz" />
                                            </SelectTrigger>
                                            <SelectContent className="max-h-60">
                                                {buildCompanyHierarchy().map((option) => (
                                                    <SelectItem key={option.value} value={option.value} className="py-3">
                                                        <div className="flex flex-col items-start w-full">
                                                            <span className="font-medium">{option.label}</span>
                                                            {option.hierarchy && (
                                                                <div className="flex items-center gap-1 mt-1">
                                                                    <ChevronRight className="h-3 w-3 text-gray-400" />
                                                                    <span className="text-xs text-gray-500">{option.hierarchy}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-gray-500">
                                            Si esta empresa pertenece a un grupo empresarial, selecciona la empresa matriz. Se muestra la
                                            jerarquía completa.
                                        </p>
                                    </div>
                                )}
                            />
                        </div>
                    </SectionCard>

                    {/* Información de Contacto */}
                    <SectionCard
                        icon={Mail}
                        title="Información de Contacto"
                        description="Datos de contacto y ubicación de la empresa"
                    >
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <InputField
                                    label="Email de Contacto Principal"
                                    name="contact_email"
                                    type="email"
                                    register={register}
                                    error={errors.contact_email}
                                    required
                                    placeholder="contacto@empresa.com"
                                    description="Email principal para comunicaciones oficiales"
                                    icon={Mail}
                                />
                                <InputField
                                    label="Teléfono de Contacto"
                                    name="contact_phone"
                                    type="tel"
                                    register={register}
                                    error={errors.contact_phone}
                                    placeholder="2222-3333"
                                    description="Número de teléfono principal (opcional)"
                                    icon={Phone}
                                />
                            </div>

                            <TextareaField
                                label="Dirección Fiscal Completa"
                                name="fiscal_address"
                                register={register}
                                error={errors.fiscal_address}
                                required
                                rows={4}
                                placeholder="Provincia, cantón, distrito, señas exactas..."
                                description="Dirección completa registrada en el Registro Nacional"
                                icon={MapPin}
                            />
                        </div>
                    </SectionCard>

                    {/* Representante Legal */}
                    <SectionCard
                        icon={User}
                        title="Representante Legal"
                        description="Información del representante legal de la empresa"
                    >
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <Controller
                                    name="legal_representative.document_type_id"
                                    control={control}
                                    render={({ field }) => (
                                        <SelectField
                                            label="Tipo de Documento"
                                            value={field.value}
                                            onValueChange={field.onChange}
                                            options={documentTypes}
                                            error={errors.legal_representative?.document_type_id}
                                            required
                                            icon={FileText}
                                        />
                                    )}
                                />
                                <InputField
                                    label="Número de Identificación"
                                    name="legal_representative.identification_number"
                                    register={register}
                                    error={errors.legal_representative?.identification_number}
                                    required
                                    placeholder="1-1234-5678"
                                    icon={FileText}
                                />
                                <InputField
                                    label="Nombre Completo"
                                    name="legal_representative.full_name"
                                    register={register}
                                    error={errors.legal_representative?.full_name}
                                    required
                                    placeholder="Nombre completo del representante"
                                    icon={User}
                                />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <InputField
                                    label="Email del Representante"
                                    name="legal_representative.email"
                                    type="email"
                                    register={register}
                                    error={errors.legal_representative?.email}
                                    required
                                    placeholder="representante@empresa.com"
                                    icon={Mail}
                                />
                                <InputField
                                    label="Teléfono Principal"
                                    name="legal_representative.primary_phone"
                                    type="tel"
                                    register={register}
                                    error={errors.legal_representative?.primary_phone}
                                    required
                                    placeholder="8888-9999"
                                    icon={Phone}
                                />
                                <InputField
                                    label="Teléfono Secundario"
                                    name="legal_representative.secondary_phone"
                                    type="tel"
                                    register={register}
                                    error={errors.legal_representative?.secondary_phone}
                                    placeholder="7777-8888 (opcional)"
                                    icon={Phone}
                                />
                            </div>
                        </div>
                    </SectionCard>

                    {/* Logo y Finalización */}
                    <SectionCard icon={ImageIcon} title="Logo de la Empresa" description="Suba el logo de su empresa (opcional)">
                        <div className="space-y-6">
                            <div className="flex flex-col lg:flex-row items-start gap-8 p-6 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                                <Avatar className="h-32 w-32 rounded-xl shadow-lg ring-4 ring-white">
                                    <AvatarImage
                                        src={logoPreview || "/placeholder.svg?height=128&width=128&query=company+logo"}
                                        alt="Logo Preview"
                                        className="object-contain p-2"
                                    />
                                    <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600 text-2xl font-bold rounded-xl">
                                        {watchedValues.legal_name
                                            ?.split(" ")
                                            .map((n) => n[0])
                                            .join("")
                                            .toUpperCase()
                                            .slice(0, 2) || "EM"}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-700 mb-2">Subir Logo</h4>
                                    <p className="text-sm text-gray-600 mb-4">
                                        Sube una imagen para el logo de tu empresa. Se recomienda formato cuadrado, PNG o JPG, máximo 5MB.
                                    </p>
                                    <input id="logo-upload" type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
                                    <div className="flex flex-wrap gap-3">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => document.getElementById("logo-upload")?.click()}
                                            className="border-blue-300 text-blue-600 hover:bg-blue-50"
                                        >
                                            <Upload className="h-4 w-4 mr-2" />
                                            {logoPreview ? "Cambiar Logo" : "Subir Logo"}
                                        </Button>
                                        {logoPreview && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                onClick={() => {
                                                    setLogoPreview(null)
                                                    setValue("logo_url", "")
                                                }}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                                Quitar Logo
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Resumen de información */}
                            <Card className="bg-gradient-to-br from-blue-50 to-slate-50 border-blue-200">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                        <CheckCircle className="h-5 w-5 text-blue-600" />
                                        Resumen de la Información
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="font-medium text-gray-600">Nombre Legal:</p>
                                            <p className="text-gray-800">{watchedValues.legal_name || "No especificado"}</p>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-600">Tipo:</p>
                                            <p className="text-gray-800">{watchedValues.company_type || "No especificado"}</p>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-600">C.J./ID Fiscal:</p>
                                            <p className="text-gray-800">{watchedValues.legal_id || "No especificado"}</p>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-600">Email:</p>
                                            <p className="text-gray-800">{watchedValues.contact_email || "No especificado"}</p>
                                        </div>
                                        <div className="md:col-span-2">
                                            <p className="font-medium text-gray-600">Representante Legal:</p>
                                            <p className="text-gray-800">
                                                {watchedValues.legal_representative?.full_name || "No especificado"}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </SectionCard>

                    {/* Botones de acción */}
                    <Card className="shadow-lg border border-gray-200 rounded-xl overflow-hidden">
                        <CardContent className="p-6">
                            <div className="flex flex-col sm:flex-row gap-4 justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.push("/companies")}
                                    className="border-gray-300 hover:bg-gray-100"
                                    disabled={isSubmitting}
                                >
                                    <ArrowLeft className="h-4 w-4 mr-2" /> Cancelar
                                </Button>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                type="submit"
                                                disabled={isSubmitting || !isValid}
                                                className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 min-w-[200px]"
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                        {isEditMode ? "Actualizando..." : "Registrando Empresa..."}
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="h-4 w-4 mr-2" />
                                                        {isEditMode ? "Guardar Cambios" : "Registrar Empresa"}
                                                    </>
                                                )}

                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{!isValid ? "Complete todos los campos requeridos" : "Registrar la empresa en el sistema"}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </Sidebar>
    )
}
