"use client"

import type React from "react"
import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm, Controller, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/Components/ui/button" // Assuming @/Components is an alias
import { Input } from "@/Components/ui/input"
import { Label } from "@/Components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card"
import { Badge } from "@/Components/ui/badge"
import { Textarea } from "@/Components/ui/textarea"
import { Checkbox } from "@/Components/ui/checkbox"
import { Sidebar } from "../Sidebar/Sidebar" // Assuming relative path is correct
import { useUser } from "@/context/UserContext"
import { useToast } from "@/Components/ui/use-toast"

import type {
    InvitationFormData,
    CompanyOptionForInvitation,
    RoleOptionForInvitation,
    DeliveryPointWithCompany,
} from "@/lib/types/collaborator" // Ensure this path is correct

import {
    UserPlus,
    ArrowLeft,
    Mail,
    User,
    Briefcase,
    MapPin,
    Shield,
    AlertCircle,
    CheckCircle,
    Send,
    Loader2,
    Info,
    Users,
    Building2,
    X,
    Plus,
} from "lucide-react"
import { getValidRoles, getAssignableCompanies, getAssignablePdes, inviteCollaborator } from "@/Services/invitation" // Ensure this path is correct
import { updateCollaborator } from "@/Services/collaborators" // Ensure this path is correct

const SectionCard = ({
    icon: Icon,
    title,
    description,
    children,
    className = "",
}: {
    icon: React.ElementType
    title: string
    description: string
    children: React.ReactNode
    className?: string
}) => (
    <Card className={`shadow-lg border border-gray-200 rounded-xl overflow-hidden ${className}`}>
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

const InputField = ({
    label,
    name,
    type = "text",
    register,
    error,
    required,
    placeholder,
    description,
    disabled,
    icon: Icon,
}: {
    label: string
    name: string
    type?: string
    register: any
    error?: any
    required?: boolean
    placeholder?: string
    description?: string
    disabled?: boolean
    icon?: React.ElementType
}) => (
    <div className="space-y-2">
        <Label htmlFor={name} className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            {Icon && <Icon className="h-4 w-4 text-blue-600" />}
            {label}
            {required && <span className="text-red-500">*</span>}
        </Label>
        <Input
            id={name}
            disabled={disabled}
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

const MultiSelectCompanies = ({
    companies,
    selectedCompanyIds,
    onSelectionChange,
    error,
    disabled = false,
    allowMultiple = true, // Default to true, will be controlled by form logic
}: {
    companies: CompanyOptionForInvitation[]
    selectedCompanyIds: string[]
    onSelectionChange: (companyIds: string[]) => void
    error?: any
    disabled?: boolean
    allowMultiple?: boolean
}) => {
    const handleCompanyToggle = (companyId: string) => {
        if (!allowMultiple) {
            // If multiple are not allowed, selecting one deselects others.
            onSelectionChange([companyId])
            return
        }

        const newSelection = selectedCompanyIds.includes(companyId)
            ? selectedCompanyIds.filter((id) => id !== companyId)
            : [...selectedCompanyIds, companyId]
        onSelectionChange(newSelection)
    }

    const removeCompany = (companyId: string) => {
        onSelectionChange(selectedCompanyIds.filter((id) => id !== companyId))
    }

    return (
        <div className="space-y-3">
            {selectedCompanyIds.length > 0 && (
                <div className="flex flex-wrap gap-2 p-2 border border-gray-200 rounded-md bg-gray-50">
                    {selectedCompanyIds.map((companyId) => {
                        const company = companies.find((c) => c.id === companyId)
                        return company ? (
                            <Badge
                                key={companyId}
                                variant="secondary"
                                className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-800 border border-blue-300 rounded-md text-sm"
                            >
                                <Building2 className="h-4 w-4" />
                                {company.trade_name}
                                <button
                                    type="button"
                                    onClick={() => removeCompany(companyId)}
                                    className="ml-1.5 hover:bg-blue-200 rounded-full p-0.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
                                    disabled={disabled}
                                    aria-label={`Quitar ${company.trade_name}`}
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </Badge>
                        ) : null
                    })}
                </div>
            )}

            <div
                className={`border rounded-lg p-4 max-h-60 overflow-y-auto ${error ? "border-red-500 bg-red-50" : "border-gray-300 bg-white"
                    }`}
            >
                {companies.length === 0 && !disabled && (
                    <p className="text-sm text-gray-500">No hay empresas disponibles para seleccionar.</p>
                )}
                <div className="space-y-3">
                    {companies.map((company) => (
                        <div key={company.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-md">
                            <Checkbox
                                id={`company-${company.id}`}
                                checked={selectedCompanyIds.includes(company.id)}
                                onCheckedChange={() => handleCompanyToggle(company.id)}
                                disabled={disabled}
                                aria-labelledby={`company-label-${company.id}`}
                            />
                            <label
                                id={`company-label-${company.id}`}
                                htmlFor={`company-${company.id}`}
                                className={`flex items-center gap-3 cursor-pointer flex-1 ${disabled ? "opacity-50" : ""}`}
                            >
                                <div className="p-1.5 bg-blue-50 rounded-md">
                                    <Building2 className="h-4 w-4 text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-800">{company.trade_name}</p>
                                    <p className="text-xs text-gray-500">{company.delivery_points?.length ?? 0} puntos de entrega</p>
                                </div>
                            </label>
                        </div>
                    ))}
                </div>
            </div>
            {error && (
                <div className="flex items-center space-x-1 mt-1">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <p className="text-red-600 text-xs">{error.message}</p>
                </div>
            )}
        </div>
    )
}

const MultiSelectDeliveryPoints = ({
    deliveryPoints,
    selectedDeliveryPointIds,
    onSelectionChange,
    error,
    disabled = false,
    groupByCompany = false,
}: {
    deliveryPoints: DeliveryPointWithCompany[]
    selectedDeliveryPointIds: string[]
    onSelectionChange: (dpIds: string[]) => void
    error?: any
    disabled?: boolean
    groupByCompany?: boolean
}) => {
    const handleDpToggle = (dpId: string) => {
        const newSelection = selectedDeliveryPointIds.includes(dpId)
            ? selectedDeliveryPointIds.filter((id) => id !== dpId)
            : [...selectedDeliveryPointIds, dpId]
        onSelectionChange(newSelection)
    }

    const removeDp = (dpId: string) => {
        onSelectionChange(selectedDeliveryPointIds.filter((id) => id !== dpId))
    }

    const groupedDeliveryPoints = useMemo(() => {
        if (!groupByCompany) return { "": deliveryPoints } // Group under an empty key if not grouping by company

        return deliveryPoints.reduce(
            (acc, dp) => {
                const companyName = dp.company_name || "Sin Empresa Asignada"
                if (!acc[companyName]) {
                    acc[companyName] = []
                }
                acc[companyName].push(dp)
                return acc
            },
            {} as Record<string, DeliveryPointWithCompany[]>,
        )
    }, [deliveryPoints, groupByCompany])

    return (
        <div className="space-y-3">
            {selectedDeliveryPointIds.length > 0 && (
                <div className="flex flex-wrap gap-2 p-2 border border-gray-200 rounded-md bg-gray-50">
                    {selectedDeliveryPointIds.map((dpId) => {
                        const dp = deliveryPoints.find((d) => d.id === dpId)
                        return dp ? (
                            <Badge
                                key={dpId}
                                variant="secondary"
                                className="flex items-center gap-1 px-3 py-1.5 bg-teal-100 text-teal-800 border border-teal-300 rounded-md text-sm"
                            >
                                <MapPin className="h-4 w-4" />
                                {dp.name}
                                {groupByCompany && <span className="text-xs opacity-75 ml-1">({dp.company_name})</span>}
                                <button
                                    type="button"
                                    onClick={() => removeDp(dpId)}
                                    className="ml-1.5 hover:bg-teal-200 rounded-full p-0.5 focus:outline-none focus:ring-1 focus:ring-teal-400"
                                    disabled={disabled}
                                    aria-label={`Quitar ${dp.name}`}
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </Badge>
                        ) : null
                    })}
                </div>
            )}

            <div
                className={`border rounded-lg p-4 max-h-80 overflow-y-auto ${error ? "border-red-500 bg-red-50" : "border-gray-300 bg-white"
                    }`}
            >
                {deliveryPoints.length === 0 && !disabled && (
                    <p className="text-sm text-gray-500">No hay puntos de entrega disponibles para seleccionar.</p>
                )}
                <div className="space-y-4">
                    {Object.entries(groupedDeliveryPoints).map(([companyName, dpsInGroup]) => (
                        <div key={companyName || "default_group"}>
                            {groupByCompany && companyName && dpsInGroup.length > 0 && (
                                <div className="mb-3 pb-2 border-b border-gray-200">
                                    <div className="flex items-center gap-2">
                                        <Building2 className="h-4 w-4 text-blue-600" />
                                        <h4 className="font-medium text-gray-800">{companyName}</h4>
                                        <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                                            {dpsInGroup.length} {dpsInGroup.length === 1 ? "punto" : "puntos"}
                                        </Badge>
                                    </div>
                                </div>
                            )}
                            <div className="space-y-3">
                                {dpsInGroup.map((dp) => (
                                    <div key={dp.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-md">
                                        <Checkbox
                                            id={`dp-${dp.id}`}
                                            checked={selectedDeliveryPointIds.includes(dp.id)}
                                            onCheckedChange={() => handleDpToggle(dp.id)}
                                            disabled={disabled}
                                            aria-labelledby={`dp-label-${dp.id}`}
                                        />
                                        <label
                                            id={`dp-label-${dp.id}`}
                                            htmlFor={`dp-${dp.id}`}
                                            className={`flex items-center gap-3 cursor-pointer flex-1 ${disabled ? "opacity-50" : ""}`}
                                        >
                                            <div className="p-1.5 bg-teal-50 rounded-md">
                                                <MapPin className="h-4 w-4 text-teal-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800">{dp.name}</p>
                                                {dp.address && <p className="text-xs text-gray-500">{dp.address}</p>}
                                                {!groupByCompany && dp.company_name && (
                                                    <p className="text-xs text-blue-600 font-medium">{dp.company_name}</p>
                                                )}
                                            </div>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {error && (
                <div className="flex items-center space-x-1 mt-1">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <p className="text-red-600 text-xs">{error.message}</p>
                </div>
            )}
        </div>
    )
}

export function InvitationForm({
    isEdit = false,
    initialData,
    onSuccess,
    onCancel,
}: {
    isEdit?: boolean
    initialData?: Partial<InvitationFormData> & { id: string }
    onSuccess?: () => void
    onCancel?: () => void
}) {
    const router = useRouter()
    const { toast } = useToast()
    const { user } = useUser() // Assuming useUser provides current user info
    const [availableRoles, setAvailableRoles] = useState<RoleOptionForInvitation[]>([])
    const [availableCompanies, setAvailableCompanies] = useState<CompanyOptionForInvitation[]>([])

    const [availableDeliveryPoints, setAvailableDeliveryPoints] = useState<DeliveryPointWithCompany[]>([])
    const [isLoadingData, setIsLoadingData] = useState(true)

    // Define el esquema de validación Zod
    const invitationSchema = z
        .object({
            email: z.string().email({ message: "Email inválido." }),
            role_id: z.string().min(1, { message: "Debe seleccionar un rol." }),
            company_ids: z.array(z.string()).optional(), // Ahora es un array
            delivery_point_ids: z.array(z.string()).optional(), // Ahora es un array
            first_name: z.string().optional(),
            last_name: z.string().optional(),
            message: z.string().optional(),
        })
        .refine(
            (data) => {
                const selectedRoleObject = availableRoles.find((r) => r.id === data.role_id)
                const roleName = selectedRoleObject?.name
                if (
                    (roleName === "AdministradorEmpresa" || roleName === "AdminPdE" || roleName === "OperadorPdE") &&
                    (!data.company_ids || data.company_ids.length === 0)
                ) {
                    return false // Falla la validación si no hay empresas seleccionadas para estos roles
                }
                return true
            },
            {
                message: "Debe seleccionar al menos una empresa para este rol.",
                path: ["company_ids"],
            },
        )
        .refine(
            (data) => {
                const selectedRoleObject = availableRoles.find((r) => r.id === data.role_id)
                const roleName = selectedRoleObject?.name
                if (
                    (roleName === "AdminPdE" || roleName === "OperadorPdE") &&
                    (!data.delivery_point_ids || data.delivery_point_ids.length === 0)
                ) {
                    return false // Falla la validación si no hay PdEs seleccionados para estos roles
                }
                return true
            },
            {
                message: "Debe seleccionar al menos un punto de entrega para este rol.",
                path: ["delivery_point_ids"],
            },
        )

    // Hook de React Hook Form
    const {
        control,
        handleSubmit,
        watch,
        register,
        setValue,
        formState: { errors, isSubmitting, isValid },
    } = useForm<InvitationFormData>({
        resolver: zodResolver(invitationSchema),
        mode: "onChange", // Validar en cada cambio para feedback inmediato
        defaultValues: {
            email: isEdit ? initialData?.email ?? "" : "",
            first_name: isEdit ? initialData?.first_name ?? "" : "",
            last_name: isEdit ? initialData?.last_name ?? "" : "",
            role_id: isEdit ? initialData?.role_id ?? "" : "",
            company_ids: isEdit ? initialData?.company_ids ?? [] : [],
            delivery_point_ids: isEdit ? initialData?.delivery_point_ids ?? [] : [],
            message: "",
        },
    })

    // Observar cambios en campos relevantes
    const selectedRoleId = watch("role_id")
    const selectedCompanyIds = watch("company_ids") || [] // Asegurar que siempre sea un array
    const selectedDeliveryPointIds = watch("delivery_point_ids") || [] // Asegurar que siempre sea un array
    const watchedValues = watch() // Para el resumen

    // Cargar datos iniciales (roles, empresas)
    useEffect(() => {
        const fetchData = async () => {
            setIsLoadingData(true)
            try {
                const [roles, companies] = await Promise.all([getValidRoles(), getAssignableCompanies()])
                setAvailableRoles(roles)
                setAvailableCompanies(companies)
            } catch (error) {
                console.error("Error fetching initial data:", error)
                toast({
                    variant: "destructive",
                    title: "Error al cargar datos",
                    description: "No se pudieron cargar los roles o empresas disponibles.",
                })
            } finally {
                setIsLoadingData(false)
            }
        }
        if (user?.sub) {
            // Asumiendo que user.sub indica que el usuario está cargado
            fetchData()
        }
    }, [user?.sub, toast])

    // Determinar el nombre (key) del rol seleccionado
    const selectedRoleName = useMemo(() => {
        if (!selectedRoleId) return null
        return availableRoles.find((r) => r.id === selectedRoleId)?.name
    }, [selectedRoleId, availableRoles])

    // Obtener el objeto completo del rol seleccionado
    const selectedRole = useMemo(() => {
        if (!selectedRoleId) return null
        return availableRoles.find((r) => r.id === selectedRoleId)
    }, [selectedRoleId, availableRoles])

    // Lógica para mostrar el selector de empresas
    const showCompanySelect = useMemo(() => {
        if (!selectedRoleName) return false
        return ["AdministradorEmpresa", "AdminPdE", "OperadorPdE", "SuperAdminEmpresa"].includes(selectedRoleName)
    }, [selectedRoleName])

    // Lógica para permitir múltiples empresas
    const allowMultipleCompanies = useMemo(() => {
        if (!selectedRoleName) return false
        return ["AdministradorEmpresa", "AdminPdE", "OperadorPdE"].includes(selectedRoleName)
    }, [selectedRoleName])

    // Lógica para mostrar el selector de puntos de entrega
    const showDeliveryPointSelect = useMemo(() => {
        if (!selectedRoleName || selectedCompanyIds.length === 0) return false
        return ["AdminPdE", "OperadorPdE"].includes(selectedRoleName)
    }, [selectedRoleName, selectedCompanyIds.length])

    // Cargar puntos de entrega basados en las empresas seleccionadas
    useEffect(() => {
        const fetchDeliveryPoints = async () => {
            if (!showDeliveryPointSelect || selectedCompanyIds.length === 0) {
                setAvailableDeliveryPoints([])
                return
            }

            setIsLoadingData(true)
            try {
                const allDpsPromises = selectedCompanyIds.map(async (companyId) => {
                    const company = availableCompanies.find((c) => c.id === companyId)
                    if (!company) return []

                    const dpsResponse = await getAssignablePdes(companyId) // 👈 devuelve un objeto
                    const dps = dpsResponse.delivery_points ?? [] // 👈 accedes a array o fallback []

                    return dps.map((dp) => ({
                        ...dp,
                        company_id: companyId,
                        company_name: company.trade_name,
                    }))
                })

                const results = await Promise.all(allDpsPromises)
                const flattenedDps = results.flat()
                setAvailableDeliveryPoints(flattenedDps)

                // Filtrar los PdEs seleccionados para mantener solo los válidos
                const validSelectedDpIds = selectedDeliveryPointIds.filter((dpId) =>
                    flattenedDps.some((validDp: any) => validDp.id === dpId),
                )
                if (validSelectedDpIds.length !== selectedDeliveryPointIds.length) {
                    setValue("delivery_point_ids", validSelectedDpIds, { shouldValidate: true })
                }
            } catch (error) {
                console.error("Error fetching delivery points:", error)
                toast({
                    variant: "destructive",
                    title: "Error al cargar Puntos de Entrega",
                    description: "No se pudieron cargar los puntos de entrega para las empresas seleccionadas.",
                })
                setAvailableDeliveryPoints([])
            } finally {
                setIsLoadingData(false)
            }
        }

        fetchDeliveryPoints()
    }, [selectedCompanyIds, showDeliveryPointSelect, availableCompanies, setValue, toast, selectedDeliveryPointIds]) // Added selectedDeliveryPointIds

    // Resetear selecciones si el rol cambia y ya no aplica
    useEffect(() => {
        if (!selectedRoleName) return

        // Si el rol no permite múltiples empresas, y hay más de una seleccionada, mantener solo la primera.
        if (!allowMultipleCompanies && selectedCompanyIds.length > 1) {
            setValue("company_ids", [selectedCompanyIds[0]], { shouldValidate: true })
        }
        // Si el selector de empresas ya no debe mostrarse, limpiar company_ids
        if (!showCompanySelect) {
            setValue("company_ids", [], { shouldValidate: true })
        }
        // Si el selector de PdE ya no debe mostrarse, limpiar delivery_point_ids
        if (!showDeliveryPointSelect) {
            setValue("delivery_point_ids", [], { shouldValidate: true })
        }
    }, [
        selectedRoleName,
        allowMultipleCompanies,
        showCompanySelect,
        showDeliveryPointSelect,
        setValue,
        selectedCompanyIds,
    ])

    const getRoleIcon = (roleKey: string | undefined) => {
        if (!roleKey) return User
        switch (roleKey) {
            case "SuperAdminEmpresa":
                return Briefcase
            case "AdministradorEmpresa":
                return Users
            case "AdminPdE":
                return MapPin
            case "OperadorPdE":
                return User
            default:
                return User
        }
    }

    const getRoleColor = (roleKey: string | undefined) => {
        if (!roleKey) return "bg-gray-100 text-gray-700 border-gray-300"
        switch (roleKey) {
            case "SuperAdminEmpresa":
                return "bg-blue-100 text-blue-700 border-blue-300"
            case "AdministradorEmpresa":
                return "bg-indigo-100 text-indigo-700 border-indigo-300"
            case "AdminPdE":
                return "bg-teal-100 text-teal-700 border-teal-300"
            case "OperadorPdE":
                return "bg-green-100 text-green-700 border-green-300"
            default:
                return "bg-gray-100 text-gray-700 border-gray-300"
        }
    }

    // Manejador del envío del formulario
    const onSubmit: SubmitHandler<InvitationFormData> = async (data) => {
        // Asegurarse de que los campos opcionales que son arrays vacíos se envíen como undefined o se omitan si el backend lo prefiere
        const payload: Partial<InvitationFormData> = { ...data }
        if (payload.company_ids?.length === 0) delete payload.company_ids
        if (payload.delivery_point_ids?.length === 0) delete payload.delivery_point_ids

        console.log("Sending invitation data:", payload)
        try {
            if (isEdit && initialData?.id) {
                await updateCollaborator(initialData.id, payload);     // >>>> PATCH
                toast({ title: "Colaborador actualizado correctamente." });
            } else {
                await inviteCollaborator(payload as InvitationFormData); // >>>> POST
                toast({ title: "Invitación enviada exitosamente." });
            }
            if (isEdit && onSuccess) {
                onSuccess()
            } else {
                router.push("/collaborators")
            } // Redirigir a la lista de colaboradores
        } catch (error: any) {
            console.error("Error sending invitation:", error)
            toast({
                variant: "destructive",
                title: "Error al Enviar Invitación",
                description: error?.response?.data?.message || error?.message || "Ocurrió un problema inesperado.",
            })
        }
    }

    if (isLoadingData && availableRoles.length === 0 && availableCompanies.length === 0) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                <p className="ml-4 text-lg text-gray-700">Cargando datos del formulario...</p>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-8">
            {/* Header */}
            <Card className="shadow-xl border-0 rounded-xl overflow-hidden">
                <CardHeader className="bg-gradient-to-br from-blue-50 via-slate-50 to-white p-6 md:p-8 border-b">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-blue-100 rounded-xl shadow-sm">
                                <UserPlus className="h-7 w-7 md:h-8 md:w-8 text-blue-600" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl md:text-3xl font-bold text-gray-800">
                                    {isEdit ? "Editar Colaborador" : "Invitar Nuevo Colaborador"}
                                </CardTitle>
                                <p className="text-gray-600 mt-1 text-sm md:text-base">
                                    Envíe una invitación para que un nuevo colaborador se una al equipo.
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => router.push("/collaborators")}
                            className="border-gray-300 hover:bg-gray-100 self-start sm:self-center"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" /> Volver
                        </Button>
                    </div>
                </CardHeader>
            </Card>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Información Básica */}
                <SectionCard
                    icon={Mail}
                    title="Información Básica del Colaborador"
                    description="Datos principales del nuevo colaborador."
                >
                    <div className="space-y-6">
                        <InputField
                            label="Email del Colaborador"
                            name="email"
                            type="email"
                            register={register}
                            error={errors.email}
                            required
                            placeholder="colaborador@empresa.com"
                            description="El colaborador recibirá la invitación en este email."
                            icon={Mail}
                            disabled={isEdit}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField
                                label="Nombre"
                                name="first_name"
                                register={register}
                                error={errors.first_name}
                                placeholder="Juan"
                                description="Opcional."
                                icon={User}
                                disabled={isEdit}
                            />
                            <InputField
                                label="Apellido"
                                name="last_name"
                                register={register}
                                error={errors.last_name}
                                placeholder="Pérez"
                                description="Opcional."
                                icon={User}
                                disabled={isEdit}
                            />
                        </div>
                    </div>
                </SectionCard>

                {/* Rol y Permisos */}
                <SectionCard
                    icon={Shield}
                    title="Rol y Permisos"
                    description="Defina el rol y nivel de acceso del colaborador."
                >
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <Shield className="h-4 w-4 text-blue-600" />
                            Rol del Colaborador
                            <span className="text-red-500">*</span>
                        </Label>
                        <Controller
                            name="role_id"
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting || isLoadingData}>
                                    <SelectTrigger
                                        className={`mt-1 h-11 ${errors.role_id
                                            ? "border-red-500 focus-visible:ring-red-500 bg-red-50"
                                            : "border-gray-300 focus-visible:ring-blue-500 bg-white"
                                            }`}
                                    >
                                        <SelectValue placeholder="Seleccione el rol..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableRoles.map((role) => {
                                            const RoleIcon = getRoleIcon(role.name)
                                            return (
                                                <SelectItem key={role.id} value={role.id} className="py-2.5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-1.5 bg-blue-50 rounded-md">
                                                            <RoleIcon className="h-4 w-4 text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">{role.name}</p>
                                                            <p className="text-xs text-gray-500">Nivel {role.level}</p>
                                                        </div>
                                                    </div>
                                                </SelectItem>
                                            )
                                        })}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {selectedRole && (
                            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200 space-y-1">
                                <div className="flex items-center gap-2">
                                    <Badge className={`${getRoleColor(selectedRole.name)} px-2 py-0.5 text-xs`}>
                                        {selectedRole.name}
                                    </Badge>
                                    <p className="text-xs text-blue-700">Nivel {selectedRole.level}</p>
                                </div>
                                {allowMultipleCompanies && showCompanySelect && (
                                    <Badge variant="outline" className="text-xs border-blue-300 text-blue-700 bg-blue-50">
                                        <Plus className="h-3 w-3 mr-1" /> Múltiples empresas
                                    </Badge>
                                )}
                                {showDeliveryPointSelect && (
                                    <Badge variant="outline" className="text-xs border-teal-300 text-teal-700 bg-teal-50">
                                        <MapPin className="h-3 w-3 mr-1" /> Múltiples puntos de entrega
                                    </Badge>
                                )}
                            </div>
                        )}
                        {errors.role_id && (
                            <div className="flex items-center space-x-1 mt-1">
                                <AlertCircle className="h-4 w-4 text-red-500" />
                                <p className="text-red-600 text-xs">{errors.role_id.message}</p>
                            </div>
                        )}
                    </div>
                </SectionCard>

                {/* Asignación Empresarial */}
                {showCompanySelect && (
                    <SectionCard
                        icon={Building2}
                        title="Asignación Empresarial"
                        description={
                            allowMultipleCompanies
                                ? "Seleccione una o más empresas donde trabajará."
                                : "Seleccione la empresa donde trabajará."
                        }
                    >
                        <div className="space-y-6">
                            <div>
                                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-1">
                                    <Building2 className="h-4 w-4 text-blue-600" />
                                    {allowMultipleCompanies ? "Empresas" : "Empresa"}
                                    <span className="text-red-500">*</span>
                                    {allowMultipleCompanies && (
                                        <Badge
                                            variant="outline"
                                            className="text-xs ml-1 px-1.5 py-0.5 border-blue-300 text-blue-700 bg-blue-50"
                                        >
                                            Selección múltiple
                                        </Badge>
                                    )}
                                </Label>
                                <MultiSelectCompanies
                                    companies={availableCompanies}
                                    selectedCompanyIds={selectedCompanyIds}
                                    onSelectionChange={(companyIds) => setValue("company_ids", companyIds, { shouldValidate: true })}
                                    error={errors.company_ids}
                                    disabled={isSubmitting || isLoadingData}
                                    allowMultiple={allowMultipleCompanies}
                                />
                            </div>

                            {showDeliveryPointSelect && (
                                <div>
                                    <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-1">
                                        <MapPin className="h-4 w-4 text-blue-600" />
                                        Puntos de Entrega
                                        <span className="text-red-500">*</span>
                                        <Badge
                                            variant="outline"
                                            className="text-xs ml-1 px-1.5 py-0.5 border-teal-300 text-teal-700 bg-teal-50"
                                        >
                                            Selección múltiple
                                        </Badge>
                                    </Label>
                                    {selectedCompanyIds.length > 1 && availableDeliveryPoints.length > 0 && (
                                        <div className="mt-2 mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <Info className="h-4 w-4 text-blue-600 flex-shrink-0" />
                                                <p className="text-sm text-blue-700">
                                                    Mostrando puntos de entrega de todas las empresas seleccionadas.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    <MultiSelectDeliveryPoints
                                        deliveryPoints={availableDeliveryPoints}
                                        selectedDeliveryPointIds={selectedDeliveryPointIds}
                                        onSelectionChange={(dpIds) => setValue("delivery_point_ids", dpIds, { shouldValidate: true })}
                                        error={errors.delivery_point_ids}
                                        disabled={availableDeliveryPoints.length === 0 || isSubmitting || isLoadingData}
                                        groupByCompany={selectedCompanyIds.length > 1}
                                    />
                                    {availableDeliveryPoints.length === 0 && selectedCompanyIds.length > 0 && !isLoadingData && (
                                        <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                                                <p className="text-sm text-amber-700">
                                                    No hay puntos de entrega disponibles para las empresas seleccionadas o están cargando.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </SectionCard>
                )}

                {/* Mensaje Personalizado */}
                <SectionCard
                    icon={Send}
                    title="Mensaje de Invitación (Opcional)"
                    description="Añada un mensaje personalizado a la invitación."
                >
                    <div>
                        <Label htmlFor="message" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <Send className="h-4 w-4 text-blue-600" />
                            Mensaje Personalizado
                        </Label>
                        <Textarea
                            id="message"
                            {...register("message")}
                            placeholder="Escriba un mensaje de bienvenida..."
                            rows={3}
                            className="mt-1 transition-all duration-200 resize-none border-gray-300 focus-visible:ring-blue-500 focus-visible:border-blue-500 bg-white"
                            disabled={isSubmitting}
                        />
                        <p className="text-xs text-gray-500 mt-1">Este mensaje se incluirá en el email de invitación.</p>
                    </div>
                </SectionCard>

                {/* Resumen */}
                {(watchedValues.email || selectedRole) && (
                    <SectionCard
                        icon={CheckCircle}
                        title="Resumen de la Invitación"
                        description="Revise los detalles antes de enviar."
                        className="bg-gradient-to-br from-green-50 to-blue-50 border-green-200"
                    >
                        <div className="space-y-4 text-sm">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                                <div>
                                    <p className="font-medium text-gray-600">Email:</p>
                                    <p className="text-gray-800 break-all">{watchedValues.email || "No especificado"}</p>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-600">Rol:</p>
                                    <p className="text-gray-800">{selectedRole?.name || "No especificado"}</p>
                                </div>
                                {(watchedValues.first_name || watchedValues.last_name) && (
                                    <div>
                                        <p className="font-medium text-gray-600">Nombre:</p>
                                        <p className="text-gray-800">
                                            {watchedValues.first_name || ""} {watchedValues.last_name || ""}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {selectedCompanyIds.length > 0 && (
                                <div className="pt-3 border-t border-green-200">
                                    <p className="font-medium text-gray-600 mb-1.5">
                                        {selectedCompanyIds.length > 1 ? "Empresas Asignadas:" : "Empresa Asignada:"}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedCompanyIds.map((companyId) => {
                                            const company = availableCompanies.find((c) => c.id === companyId)
                                            return company ? (
                                                <Badge key={companyId} variant="outline" className="bg-white border-green-300 text-green-800">
                                                    <Building2 className="h-3.5 w-3.5 mr-1.5" />
                                                    {company.trade_name}
                                                </Badge>
                                            ) : null
                                        })}
                                    </div>
                                </div>
                            )}

                            {selectedDeliveryPointIds.length > 0 && (
                                <div className="pt-3 border-t border-green-200">
                                    <p className="font-medium text-gray-600 mb-1.5">
                                        {selectedDeliveryPointIds.length > 1
                                            ? "Puntos de Entrega Asignados:"
                                            : "Punto de Entrega Asignado:"}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedDeliveryPointIds.map((dpId) => {
                                            const dp = availableDeliveryPoints.find((d) => d.id === dpId)
                                            return dp ? (
                                                <Badge key={dpId} variant="outline" className="bg-white border-green-300 text-green-800">
                                                    <MapPin className="h-3.5 w-3.5 mr-1.5" />
                                                    {dp.name}
                                                    {selectedCompanyIds.length > 1 && (
                                                        <span className="ml-1 text-xs opacity-75">({dp.company_name})</span>
                                                    )}
                                                </Badge>
                                            ) : null
                                        })}
                                    </div>
                                </div>
                            )}

                            {watchedValues.message && (
                                <div className="pt-3 border-t border-green-200">
                                    <p className="font-medium text-gray-600 mb-1">Mensaje personalizado:</p>
                                    <p className="text-gray-700 text-sm italic bg-white/50 p-2 rounded border border-green-200">
                                        "{watchedValues.message}"
                                    </p>
                                </div>
                            )}
                        </div>
                    </SectionCard>
                )}

                {/* Acciones */}
                <Card className="shadow-lg border-gray-200 rounded-xl overflow-hidden">
                    <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row gap-3 justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onCancel ? onCancel() : router.push("/collaborators")}
                                className="border-gray-300 hover:bg-gray-100 w-full sm:w-auto"
                                disabled={isSubmitting}
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" /> Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting || !isValid || isLoadingData}
                                className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60 w-full sm:w-auto min-w-[180px]"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        {isEdit ? "Guardando..." : "Enviando..."}
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-4 w-4 mr-2" />
                                        {isEdit ? "Guardar Cambios" : "Enviar Invitación"}
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    )
}
