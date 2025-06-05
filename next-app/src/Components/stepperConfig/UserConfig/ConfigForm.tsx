"use client"

import type React from "react"
import { useState, useEffect, use } from "react"
import Image from "next/image"
import { Button } from "@/Components/ui/button"
import { Input } from "@/Components/ui/input"
import { SMSVerification } from "@/Components/stepperConfig/UserConfig/SMSVerification"
import { jwtDecode } from "jwt-decode";
import PhoneInput from "react-phone-input-2"
import "react-phone-input-2/lib/style.css"
import {
  Camera,
  LockKeyhole,
  User as UserIcon,
  Mail,
  Phone,
  Shield,
  CreditCard,
  Save,
  ArrowRight,
  Loader2,
  X,
  Briefcase,
  AtSign,
} from "lucide-react"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/Components/ui/tooltip"
import { useToast } from "@/Components/ui/use-toast"
import { z } from "zod"
import type { User as UserType } from "@/context/UserContext"
import { useUser } from "@/context/UserContext"
import { useRouter } from "next/navigation"

interface ProfileConfigFormProps {
  onSave: () => Promise<void>
  onNext: () => void
  onChangePassword: () => void
  isSaving: boolean
  userData?: UserData // Datos del usuario que vienen de la BD
}

// Simulación de datos del usuario que vendrían de la BD
interface UserData {
  document_type_id: string
  identification_number: string
  first_name: string
  last_name: string
  username: string
  email: string
  phone?: string
  avatar_url?: string
  role_id: string
  verified: boolean
  // Campos adicionales que no se muestran pero podrían ser útiles
  company_name?: string
}

interface DecodedToken {
  sub: string
  role: string
  first_name: string
  last_name: string
  email: string
  active: boolean
  exp: number
  iat: number
  [key: string]: any
}



// Esquema de validación
const profileSchema = z.object({
  username: z.string().min(3, "El nombre de usuario debe tener al menos 3 caracteres"),
  email: z.string().email("Correo electrónico inválido"),
  phone: z
    .string()
    .regex(/^\d{8,13}$/, "Formato inválido. Ej: 50688881234 o vacío")
    .optional()
    .or(z.literal("")),
})


export function ProfileConfigForm({
  onSave,
  onNext,
  onChangePassword,
  isSaving,
  userData: initialUserData, // Renombrar para claridad
}: ProfileConfigFormProps) {
  // Simulación de datos del usuario si no se proporcionan
  const defaultUserData: UserData = {
    document_type_id: "Cédula Física Nacional",
    identification_number: "1-2345-6789",
    first_name: "Juan",
    last_name: "Pérez Araya",
    username: "juan.perez",
    email: "juan.perez@example.com",
    phone: "8888-8888",
    avatar_url: "/placeholder.svg?height=128&width=128",
    role_id: "Super Admin",
    company_name: "AMPM",
  }

  const currentUserData = initialUserData || defaultUserData

  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const { toast } = useToast()
  const { user, setUser } = useUser()
  const [isSmsVerified, setIsSmsVerified] = useState(user?.verified || false)
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
  })
  const [defaultCountry, setDefaultCountry] = useState<string>("")

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        phone: user.phone || "",
      });
      setProfileImage(user.avatar_url || null);
      setIsSmsVerified(user.verified || false)
      console.log(isSmsVerified);
      
      
    }
  }, [user]);

  // Cargar datos del usuario cuando el componente se monta o los datos iniciales cambian
  useEffect(() => {
    if (initialUserData) {
      setFormData({
        username: initialUserData.username,
        email: initialUserData.email,
        phone: initialUserData.phone || "",
      })
      setProfileImage(initialUserData.avatar_url || null)
      setIsSmsVerified(initialUserData.verified || false)
    }
  }, [initialUserData])

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (touched[name]) {
      validateField(name, value)
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
    validateField(name, value)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const imageUrl = URL.createObjectURL(file);

      // Solo para mostrar un efecto visual de carga breve
      setTimeout(() => {
        setProfileImage(imageUrl);
        setIsUploading(false);
        toast({
          title: "Imagen seleccionada",
          description: "Será cargada al guardar los cambios.",
          variant: "default",
        });
      }, 1200);
    }
  };

  const handleRemoveImage = () => {
    setProfileImage(null)
    toast({
      title: "Imagen eliminada",
      description: "Tu foto de perfil ha sido eliminada.",
    })
    // Aquí llamarías a una función para eliminar `avatar_url` de la BD
  }

  const validateForm = () => {
    const result = profileSchema.safeParse(formData)
    if (!result.success) {
      const newErrors: Record<string, string> = {}
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          newErrors[err.path[0] as string] = err.message
        }
      })
      setErrors(newErrors)
      // Marcar todos los campos como tocados para mostrar errores
      const allTouched = Object.keys(formData).reduce(
        (acc, key) => {
          acc[key] = true
          return acc
        },
        {} as Record<string, boolean>,
      )
      setTouched(allTouched)
      return false
    }
    setErrors({})
    return true
  }

  const handlePatchUser = async () => {
    const form = new FormData();
    form.append("username", formData.username);
    form.append("email", formData.email);
    form.append("phone", formData.phone);
    const file = (document.getElementById("profile-photo") as HTMLInputElement)?.files?.[0];
    if (file) form.append("avatar", file);

    const res = await fetch(`/api/users/${user.sub}`, { method: "PATCH", body: form });
    if (!res.ok) throw new Error("Error actualizando el usuario");
    return res.json() as Promise<{ token: string }>;
  };


  const handleSave = async () => {
    if (!validateForm()) {
      toast({ title: "Error de validación", description: "Revisa los campos.", variant: "destructive" });
      return;
    }

    try {
      const { token } = await handlePatchUser();          // 1️⃣  token nuevo
      localStorage.setItem("token", token);               // 2️⃣  guardar

      const decoded = jwtDecode(token) as User;           // 3️⃣  decodificar
      setUser(decoded);                                   // 4️⃣  actualizar contexto

      toast({ title: "Usuario actualizado", description: "Cambios guardados.", variant: "success" });
      await onSave?.();
    } catch (err) {
      console.error(err);
      toast({ title: "Error al guardar", description: "Hubo un problema.", variant: "destructive" });
    }
  };

    const handleSaveandNext = async () => {
      handleSave()
      onNext()
  };


  const FormField = ({ label, value, icon: Icon }: { label: string; value: string; icon?: React.ElementType }) => (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-0.5">{label}</label>
      <div className="flex items-center h-10 bg-gray-100 border border-gray-200 rounded-md px-3">
        {Icon && <Icon className="h-4 w-4 text-gray-400 mr-2" />}
        <span className="text-sm text-gray-700 truncate">{value}</span>
      </div>
    </div>
  )

  return (
    <div className="p-6">
      <div className="space-y-6">
        {/* Foto de Perfil */}
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
          <h3 className="text-lg font-medium text-gray-700 mb-4 flex items-center">
            <UserIcon className="mr-2 h-5 w-5 text-blue-500" />

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
                      className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors shadow-sm"
                      aria-label="Eliminar foto"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <Image
                    src="/placeholder.svg?height=128&width=128"
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

        {/* Datos Personales (No Editables) */}
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
          <h3 className="text-lg font-medium text-gray-700 mb-4 flex items-center">
            <CreditCard className="mr-2 h-5 w-5 text-blue-500" />
            Información Personal
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
            <FormField label="Nombre Completo" value={`${user?.first_name} ${user?.last_name}`} />
            <FormField label="Tipo de Identificación" value={user?.document_type_id} />
            <FormField label="Número de Identificación" value={user?.identification_number} />
            <FormField label="Rol de Usuario" value={user?.role} icon={Briefcase} />
          </div>
        </div>

        {/* Datos Editables */}
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
          <h3 className="text-lg font-medium text-gray-700 mb-4 flex items-center">
            <AtSign className="mr-2 h-5 w-5 text-blue-500" />
            Información de Contacto y Usuario
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de usuario <span className="text-red-500">*</span>
              </label>
              <Input
                id="username"
                name="username"
                type="text"
                className={`w-full h-10 bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md ${errors.username && touched.username ? "border-red-500 focus:ring-red-500" : ""
                  }`}
                value={formData.username}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {errors.username && touched.username && <p className="mt-1 text-xs text-red-500">{errors.username}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  className={`w-full h-10 bg-white border-gray-300 pl-10 focus:ring-blue-500 focus:border-blue-500 rounded-md ${errors.email && touched.email ? "border-red-500 focus:ring-red-500" : ""
                    }`}
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </div>
              {errors.email && touched.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
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
        onChange={(value) => setFormData((prev) => ({ ...prev, phone: value.replace(/\D/g, "") }))}
        inputProps={{
          name: "phone",
          required: true,
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
              {errors.phone && touched.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
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
              className="bg-blue-600 text-white hover:bg-blue-700 flex items-center text-sm px-4 py-2 h-auto"
              onClick={onChangePassword}
            >
              <LockKeyhole className="mr-2 h-4 w-4" />
              Cambiar Contraseña
            </Button>
            <p className="ml-4 text-xs text-gray-500">
              Mantén tu cuenta segura actualizando tu contraseña periódicamente.
            </p>
          </div>
          {/* Aquí integramos el componente SMSVerification */}
          <div className="pt-6">
            <SMSVerification
              userId={user?.sub}
              initialVerified={isSmsVerified}
              initialPhone={formData.phone} 
              onVerified={(updatedUser) => {
                setIsSmsVerified(true)
                // Actualizamos el contexto de usuario con la info nueva
                setUser(updatedUser)
              }}
            />
          </div>
        </div>

        {/* Botones de navegación */}
        <div className="flex flex-col sm:flex-row justify-between items-center pt-5 border-t mt-6">
          <Button
            onClick={() => (router.push("/dashboard"))}
            variant="outline"
            className="px-5 py-2 text-sm border-gray-300 text-gray-700 hover:bg-gray-100 w-full sm:w-auto mb-2 sm:mb-0"
          >
            Atrás
          </Button>
          <div className="flex space-x-3 w-full sm:w-auto">
            <Button
              variant="outline"
              className="px-5 py-2 text-sm border-blue-600 text-blue-600 hover:bg-blue-50 flex-1 sm:flex-none"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Guardar
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 text-sm flex-1 sm:flex-none"
              onClick={
                handleSaveandNext
              }
              disabled={isSaving}
            >
              Siguiente
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
