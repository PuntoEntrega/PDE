"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { jwtDecode } from "jwt-decode"
import { z } from "zod"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import PhoneInput from "react-phone-input-2"
import "react-phone-input-2/lib/style.css"

import { Input } from "@/Components/ui/input"
import { Button } from "@/Components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card"
import { Label } from "@/Components/ui/label"
import { Alert, AlertDescription } from "@/Components/ui/alert"
import { Badge } from "@/Components/ui/badge"
import { useToast } from "@/Components/ui/use-toast"
import {
    Loader2,
    Phone,
    User,
    Lock,
    Camera,
    CheckCircle,
    AlertCircle,
    Eye,
    EyeOff,
    Upload,
    X,
    UserCheck,
    Mail,
} from "lucide-react"

import { SMSVerification } from "@/Components/stepperConfig/UserConfig/SMSVerification"

// Esquema de validación completo
const registrationSchema = z
    .object({
        first_name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(50, "Máximo 50 caracteres"),
        last_name: z.string().min(2, "El apellido debe tener al menos 2 caracteres").max(50, "Máximo 50 caracteres"),
        username: z
            .string()
            .min(3, "El username debe tener al menos 3 caracteres")
            .max(30, "Máximo 30 caracteres")
            .optional()
            .or(z.literal("")),
        phone: z.string().min(8, "Número de teléfono inválido"),
        currentPassword: z.string().min(1, "La contraseña provisional es requerida"),
        newPassword: z
            .string()
            .min(8, "Debe tener al menos 8 caracteres")
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

interface TokenPayload {
    sub: string
    exp: number
    iat: number
    [key: string]: any
}

type RegistrationForm = z.infer<typeof registrationSchema>

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
    <Card
        className={`shadow-lg border border-gray-200/50 rounded-xl overflow-hidden backdrop-blur-sm bg-white/95 ${className}`}
    >
        <CardHeader className="bg-gradient-to-r from-blue-50/80 to-slate-100/80 p-5 border-b border-gray-200/50">
            <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-100/80 rounded-lg shadow-sm backdrop-blur-sm">
                    <Icon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                    <CardTitle className="text-lg font-semibold text-gray-800">{title}</CardTitle>
                    <p className="text-sm text-gray-600 mt-0.5">{description}</p>
                </div>
            </div>
        </CardHeader>
        <CardContent className="p-6 bg-white/95">{children}</CardContent>
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
            type={type}
            {...register(name)}
            placeholder={placeholder || `Ingrese ${label.toLowerCase()}`}
            className={`h-11 transition-all duration-200 backdrop-blur-sm ${error
                    ? "border-red-500 focus-visible:ring-red-500 bg-red-50/80"
                    : "border-gray-300 focus-visible:ring-blue-500 focus-visible:border-blue-500 bg-white/90"
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

const PasswordField = ({
    label,
    name,
    register,
    error,
    required,
    placeholder,
    showPassword,
    onToggleVisibility,
}: {
    label: string
    name: string
    register: any
    error?: any
    required?: boolean
    placeholder?: string
    showPassword: boolean
    onToggleVisibility: () => void
}) => (
    <div className="space-y-2">
        <Label htmlFor={name} className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Lock className="h-4 w-4 text-blue-600" />
            {label}
            {required && <span className="text-red-500">*</span>}
        </Label>
        <div className="relative">
            <Input
                id={name}
                type={showPassword ? "text" : "password"}
                {...register(name)}
                placeholder={placeholder}
                className={`h-11 pr-12 transition-all duration-200 backdrop-blur-sm ${error
                        ? "border-red-500 focus-visible:ring-red-500 bg-red-50/80"
                        : "border-gray-300 focus-visible:ring-blue-500 focus-visible:border-blue-500 bg-white/90"
                    }`}
            />
            <button
                type="button"
                onClick={onToggleVisibility}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
        </div>
        {error && (
            <div className="flex items-center space-x-1">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <p className="text-red-600 text-xs">{error.message}</p>
            </div>
        )}
    </div>
)

const PasswordStrengthIndicator = ({ password }: { password: string }) => {
    const checks = [
        { test: /.{8,}/, label: "Al menos 8 caracteres" },
        { test: /[A-Z]/, label: "Una letra mayúscula" },
        { test: /[a-z]/, label: "Una letra minúscula" },
        { test: /[0-9]/, label: "Un número" },
        { test: /[^A-Za-z0-9]/, label: "Un carácter especial" },
    ]

    const passedChecks = checks.filter((check) => check.test.test(password))
    const strength = (passedChecks.length / checks.length) * 100

    const getStrengthColor = () => {
        if (strength < 40) return "bg-red-500"
        if (strength < 80) return "bg-yellow-500"
        return "bg-green-500"
    }

    const getStrengthText = () => {
        if (strength < 40) return "Débil"
        if (strength < 80) return "Media"
        return "Fuerte"
    }

    if (!password) return null

    return (
        <div className="space-y-3 p-4 bg-gray-50/80 backdrop-blur-sm rounded-lg border border-gray-200/50">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Seguridad de la contraseña</span>
                <Badge
                    variant="outline"
                    className={`text-xs backdrop-blur-sm ${strength < 40
                            ? "text-red-600 border-red-300 bg-red-50/80"
                            : strength < 80
                                ? "text-yellow-600 border-yellow-300 bg-yellow-50/80"
                                : "text-green-600 border-green-300 bg-green-50/80"
                        }`}
                >
                    {getStrengthText()}
                </Badge>
            </div>
            <div className="w-full bg-gray-200/80 rounded-full h-2">
                <div
                    className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor()}`}
                    style={{ width: `${strength}%` }}
                />
            </div>
            <div className="space-y-1">
                {checks.map((check, index) => (
                    <div key={index} className="flex items-center gap-2">
                        {check.test.test(password) ? (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : (
                            <div className="h-3 w-3 rounded-full border border-gray-300" />
                        )}
                        <span className={`text-xs ${check.test.test(password) ? "text-green-600" : "text-gray-500"}`}>
                            {check.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}

const AvatarUpload = ({
    onFileSelect,
    currentFile,
    error,
}: {
    onFileSelect: (file: File | null) => void
    currentFile: File | null
    error?: string
}) => {
    const [preview, setPreview] = useState<string | null>(null)

    useEffect(() => {
        if (currentFile) {
            const url = URL.createObjectURL(currentFile)
            setPreview(url)
            return () => URL.revokeObjectURL(url)
        } else {
            setPreview(null)
        }
    }, [currentFile])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            // Validar tamaño (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert("El archivo debe ser menor a 5MB")
                return
            }
            // Validar tipo
            if (!file.type.startsWith("image/")) {
                alert("Solo se permiten archivos de imagen")
                return
            }
            onFileSelect(file)
        }
    }

    const removeFile = () => {
        onFileSelect(null)
        setPreview(null)
    }

    return (
        <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Camera className="h-4 w-4 text-blue-600" />
                Foto de perfil (opcional)
            </Label>

            {preview ? (
                <div className="relative inline-block">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg backdrop-blur-sm">
                        <img src={preview || "/placeholder.svg"} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                    <button
                        type="button"
                        onClick={removeFile}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-lg"
                    >
                        <X className="h-3 w-3" />
                    </button>
                </div>
            ) : (
                <div className="flex items-center gap-4">
                    <div className="w-24 h-24 rounded-full bg-gray-100/80 backdrop-blur-sm border-2 border-dashed border-gray-300 flex items-center justify-center">
                        <Camera className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="flex-1">
                        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="avatar-upload" />
                        <Label
                            htmlFor="avatar-upload"
                            className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-50/80 backdrop-blur-sm text-blue-700 rounded-lg hover:bg-blue-100/80 transition-colors"
                        >
                            <Upload className="h-4 w-4" />
                            Subir foto
                        </Label>
                        <p className="text-xs text-gray-500 mt-1">JPG, PNG o GIF. Máximo 5MB.</p>
                    </div>
                </div>
            )}

            {error && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {error}
                </p>
            )}
        </div>
    )
}

export default function CompleteRegistrationForm() {
    const router = useRouter()
    const { toast } = useToast()
    const token = useSearchParams().get("token")

    const [userId, setUserId] = useState("")
    const [loading, setLoading] = useState(false)
    const [isVerified, setIsVerified] = useState(false)
    const [defaultCountry, setDefaultCountry] = useState("cr")
    const [avatar, setAvatar] = useState<File | null>(null)
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    })

    const form = useForm<RegistrationForm>({
        resolver: zodResolver(registrationSchema),
        mode: "onChange",
        defaultValues: {
            first_name: "",
            last_name: "",
            username: "",
            phone: "",
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    })

    // Decodificar token
    useEffect(() => {
        if (!token) {
            toast({
                title: "Token faltante",
                description: "No se encontró el token de invitación",
                variant: "destructive",
            })
            router.replace("/error")
            return
        }

        try {
            const decoded = jwtDecode<TokenPayload>(token)

            // Verificar si el token ha expirado
            if (decoded.exp * 1000 < Date.now()) {
                toast({
                    title: "Token expirado",
                    description: "El enlace de invitación ha expirado",
                    variant: "destructive",
                })
                router.replace("/error")
                return
            }

            setUserId(decoded.sub)

            // Restaurar estado de verificación SMS
            if (localStorage.getItem(`phone_verified_${decoded.sub}`) === "true") {
                setIsVerified(true)
            }
        } catch (error) {
            toast({
                title: "Token inválido",
                description: "El enlace de invitación no es válido",
                variant: "destructive",
            })
            router.replace("/error")
        }
    }, [token, router, toast])

    // Detectar país por IP
    useEffect(() => {
        const detectCountry = async () => {
            try {
                const response = await fetch("https://ipapi.co/json/")
                const data = await response.json()
                setDefaultCountry(data.country_code?.toLowerCase() || "cr")
            } catch (error) {
                setDefaultCountry("cr") // Costa Rica por defecto
            }
        }
        detectCountry()
    }, [])

    const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
        setShowPasswords((prev) => ({
            ...prev,
            [field]: !prev[field],
        }))
    }

    const handleSubmit = async (data: RegistrationForm) => {
        if (!isVerified) {
            toast({
                title: "Verificación pendiente",
                description: "Debes verificar tu número de teléfono antes de continuar",
                variant: "destructive",
            })
            return
        }

        setLoading(true)

        try {
            // 1. Cambiar contraseña
            const passwordResponse = await fetch(`/api/users/${userId}/change-password`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentPassword: data.currentPassword,
                    newPassword: data.newPassword,
                }),
            })

            if (!passwordResponse.ok) {
                const errorData = await passwordResponse.json()
                if (passwordResponse.status === 401) {
                    form.setError("currentPassword", {
                        message: errorData.message || "Contraseña provisional incorrecta",
                    })
                    return
                }
                throw new Error(errorData.message || "Error al cambiar la contraseña")
            }

            // 2. Completar registro
            const formData = new FormData()
            formData.append("first_name", data.first_name)
            formData.append("last_name", data.last_name)
            if (data.username) {
                formData.append("username", data.username)
            }
            formData.append("phone", data.phone)
            formData.append("verified", "true")
            formData.append("status", "active")

            if (avatar) {
                formData.append("avatar", avatar)
            }

            const registrationResponse = await fetch(`/api/collaborators/complete-registration/${userId}`, {
                method: "PATCH",
                body: formData,
            })

            if (!registrationResponse.ok) {
                const errorData = await registrationResponse.json()
                throw new Error(errorData.message || "Error al completar el registro")
            }

            // Limpiar localStorage
            localStorage.removeItem(`phone_verified_${userId}`)

            toast({
                title: "¡Registro completado!",
                description: "Tu cuenta ha sido activada exitosamente",
            })

            console.log("que pasaaaaaaaa");
            
            router.push("/login?message=registration_complete")
        } catch (error: any) {
            console.error("Error en registro:", error)
            toast({
                title: "Error al completar registro",
                description: error.message || "Ocurrió un error inesperado",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const watchedPassword = form.watch("newPassword")
    const isFormValid = form.formState.isValid && isVerified

    return (
        <div className="w-full max-w-5xl space-y-8">
            {/* Header */}
            <Card className="shadow-xl border-0 rounded-xl overflow-hidden backdrop-blur-sm bg-white/95">
                <CardHeader className="bg-gradient-to-br from-blue-50/80 via-slate-50/80 to-white/80 p-8 border-b border-gray-200/50">
                    <div className="flex items-center justify-center">
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-3 mb-4">
                                <div className="p-3 bg-blue-100/80 backdrop-blur-sm rounded-xl shadow-sm">
                                    <UserCheck className="h-8 w-8 text-blue-600" />
                                </div>
                            </div>
                            <CardTitle className="text-3xl font-bold text-gray-800">Completa tu registro</CardTitle>
                            <p className="text-gray-600 mt-2">
                                Proporciona la información necesaria para activar tu cuenta en la plataforma.
                            </p>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
                {/* Información Personal */}
                <SectionCard icon={User} title="Información Personal" description="Datos básicos para tu perfil de usuario">
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField
                                label="Nombre"
                                name="first_name"
                                register={form.register}
                                error={form.formState.errors.first_name}
                                required
                                placeholder="Tu nombre"
                                icon={User}
                            />
                            <InputField
                                label="Apellido"
                                name="last_name"
                                register={form.register}
                                error={form.formState.errors.last_name}
                                required
                                placeholder="Tu apellido"
                                icon={User}
                            />
                        </div>

                        <InputField
                            label="Nombre de usuario"
                            name="username"
                            register={form.register}
                            error={form.formState.errors.username}
                            placeholder="Ej: juan_perez (opcional)"
                            description="Si no especificas uno, se generará automáticamente"
                            icon={Mail}
                        />

                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <Phone className="h-4 w-4 text-blue-600" />
                                Número de teléfono
                                <span className="text-red-500">*</span>
                            </Label>
                            <Controller
                                name="phone"
                                control={form.control}
                                render={({ field }) => (
                                    <div className="relative">
                                        <style jsx global>{`
                      .phone-input-container .react-tel-input {
                        width: 100%;
                      }
                      .phone-input-container .react-tel-input .form-control {
                        width: 100%;
                        height: 44px;
                        padding: 0 16px 0 58px;
                        border: 2px solid #d1d5db;
                        border-radius: 8px;
                        font-size: 14px;
                        background: rgba(255, 255, 255, 0.9);
                        backdrop-filter: blur(4px);
                        transition: all 0.2s ease;
                      }
                      .phone-input-container .react-tel-input .form-control:focus {
                        border-color: #3b82f6;
                        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                        outline: none;
                      }
                      .phone-input-container .react-tel-input .flag-dropdown {
                        border: 2px solid #d1d5db;
                        border-right: none;
                        border-radius: 8px 0 0 8px;
                        background: rgba(255, 255, 255, 0.9);
                        backdrop-filter: blur(4px);
                        height: 44px;
                      }
                      .phone-input-container .react-tel-input .flag-dropdown:hover {
                        background: rgba(249, 250, 251, 0.9);
                      }
                      .phone-input-container .react-tel-input .flag-dropdown.open {
                        border-color: #3b82f6;
                      }
                      .phone-input-container .country-list {
                        z-index: 9999;
                        border: 2px solid #d1d5db;
                        border-radius: 8px;
                        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                        background: rgba(255, 255, 255, 0.95);
                        backdrop-filter: blur(8px);
                      }
                      .phone-input-container .country-list .country:hover {
                        background: rgba(243, 244, 246, 0.8);
                      }
                      .phone-input-container .country-list .country.highlight {
                        background: rgba(239, 246, 255, 0.8);
                      }
                      ${form.formState.errors.phone
                                                ? `
                      .phone-input-container .react-tel-input .form-control {
                        border-color: #ef4444;
                        background: rgba(254, 242, 242, 0.8);
                      }
                      .phone-input-container .react-tel-input .flag-dropdown {
                        border-color: #ef4444;
                      }
                      `
                                                : ""
                                            }
                    `}</style>
                                        <div className="phone-input-container">
                                            <PhoneInput
                                                country={defaultCountry}
                                                value={field.value}
                                                onChange={(value) => field.onChange(value.replace(/\D/g, ""))}
                                                inputProps={{
                                                    name: "phone",
                                                    required: true,
                                                    placeholder: "Ingresa tu número de teléfono",
                                                }}
                                                containerClass="w-full"
                                                dropdownClass="z-50"
                                                preferredCountries={["cr", "us", "mx", "gt", "ni", "pa", "hn", "sv", "bz"]}
                                                enableSearch
                                                searchPlaceholder="Buscar país..."
                                                searchNotFound="No se encontró el país"
                                            />
                                        </div>
                                    </div>
                                )}
                            />
                            {form.formState.errors.phone && (
                                <div className="flex items-center space-x-1">
                                    <AlertCircle className="h-4 w-4 text-red-500" />
                                    <p className="text-red-600 text-xs">{form.formState.errors.phone.message}</p>
                                </div>
                            )}
                        </div>

                        <AvatarUpload onFileSelect={setAvatar} currentFile={avatar} />
                    </div>
                </SectionCard>

                {/* Configuración de Contraseña */}
                <SectionCard
                    icon={Lock}
                    title="Configuración de Contraseña"
                    description="Cambia tu contraseña provisional por una nueva y segura"
                >
                    <div className="space-y-6">
                        <Alert className="bg-amber-50/80 border-amber-200/50 backdrop-blur-sm">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                Debes cambiar tu contraseña provisional por una nueva y segura para completar el registro.
                            </AlertDescription>
                        </Alert>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <PasswordField
                                    label="Contraseña provisional"
                                    name="currentPassword"
                                    register={form.register}
                                    error={form.formState.errors.currentPassword}
                                    required
                                    placeholder="Ingresa la contraseña que recibiste"
                                    showPassword={showPasswords.current}
                                    onToggleVisibility={() => togglePasswordVisibility("current")}
                                />

                                <PasswordField
                                    label="Nueva contraseña"
                                    name="newPassword"
                                    register={form.register}
                                    error={form.formState.errors.newPassword}
                                    required
                                    placeholder="Crea una contraseña segura"
                                    showPassword={showPasswords.new}
                                    onToggleVisibility={() => togglePasswordVisibility("new")}
                                />

                                <PasswordField
                                    label="Confirmar nueva contraseña"
                                    name="confirmPassword"
                                    register={form.register}
                                    error={form.formState.errors.confirmPassword}
                                    required
                                    placeholder="Repite tu nueva contraseña"
                                    showPassword={showPasswords.confirm}
                                    onToggleVisibility={() => togglePasswordVisibility("confirm")}
                                />
                            </div>

                            <div>
                                <PasswordStrengthIndicator password={watchedPassword} />
                            </div>
                        </div>
                    </div>
                </SectionCard>

                {/* Verificación SMS */}
                <SectionCard
                    icon={Phone}
                    title="Verificación de Teléfono"
                    description="Verifica tu número de teléfono para activar tu cuenta"
                >
                    <div className="space-y-6">
                        <Alert className="bg-blue-50/80 border-blue-200/50 backdrop-blur-sm">
                            <CheckCircle className="h-4 w-4" />
                            <AlertDescription>
                                Último paso: verifica tu número de teléfono para completar el proceso de registro.
                            </AlertDescription>
                        </Alert>

                        <SMSVerification
                            userId={userId}
                            initialVerified={isVerified}
                            initialPhone={form.getValues("phone")}
                            onVerified={() => {
                                setIsVerified(true)
                                localStorage.setItem(`phone_verified_${userId}`, "true")
                            }}
                        />
                    </div>
                </SectionCard>

                {/* Botón de envío */}
                <Card className="shadow-lg border border-gray-200/50 rounded-xl overflow-hidden backdrop-blur-sm bg-white/95">
                    <CardContent className="p-6">
                        <div className="flex flex-col gap-4">
                            <Button
                                type="submit"
                                disabled={loading || !isFormValid}
                                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 text-base font-medium backdrop-blur-sm"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin h-5 w-5 mr-2" />
                                        Finalizando registro...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="h-5 w-5 mr-2" />
                                        Finalizar Registro
                                    </>
                                )}
                            </Button>

                            {!isFormValid && (
                                <div className="text-center">
                                    <p className="text-sm text-gray-500">
                                        {!isVerified
                                            ? "Verifica tu número de teléfono para continuar"
                                            : "Completa todos los campos requeridos"}
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    )
}
