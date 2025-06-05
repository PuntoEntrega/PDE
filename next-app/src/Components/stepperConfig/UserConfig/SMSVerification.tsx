"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import PhoneInput from "react-phone-input-2"
import "react-phone-input-2/lib/style.css"
import { Button } from "@/Components/ui/button"
import { Loader2, CheckCircle, AlertCircle, RefreshCcw, Phone, Shield, XCircle } from "lucide-react"
import { useToast } from "@/Components/ui/use-toast"
import { cn } from "../../../../lib/utils" // Asegúrate de tener esta utilidad

interface SMSVerificationProps {
    userId: string
    initialVerified: boolean
    onVerified: (updatedUser: any) => void
}

const RESEND_COOLDOWN_SEC = 60

// Componente para los 6 inputs del código
const CodeInputs = ({
    value,
    onChange,
    disabled,
    hasError,
}: {
    value: string
    onChange: (value: string) => void
    disabled: boolean
    hasError?: boolean
}) => {
    const inputRefs = useRef<(HTMLInputElement | null)[]>(new Array(6).fill(null))
    const digits = (value + "      ").slice(0, 6).split("")

    const handleChange = (index: number, newValue: string) => {
        const char = newValue.slice(-1) // Tomar solo el último carácter ingresado

        if (!/^\d*$/.test(char) && char !== "") return // Solo permitir dígitos o string vacío (al borrar)

        const newDigits = [...digits]
        newDigits[index] = char
        const newCode = newDigits.join("").replace(/\s/g, "") // Quitar espacios por si acaso
        onChange(newCode)

        if (char && index < 5) {
            inputRefs.current[index + 1]?.focus()
        }
    }

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault()
        const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
        if (pastedData) {
            onChange(pastedData)
            const nextFocusIndex = Math.min(pastedData.length, 5)
            setTimeout(() => {
                inputRefs.current[nextFocusIndex]?.focus()
                if (inputRefs.current[nextFocusIndex]) {
                    inputRefs.current[nextFocusIndex]!.select()
                }
            }, 0)
        }
    }

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace") {
            e.preventDefault()
            const newDigits = [...digits]
            if (newDigits[index]) {
                // Si hay un dígito en el input actual, borrarlo
                newDigits[index] = ""
            } else if (index > 0) {
                // Si está vacío y no es el primero, borrar el anterior y hacer focus
                newDigits[index - 1] = ""
                inputRefs.current[index - 1]?.focus()
            }
            onChange(newDigits.join("").replace(/\s/g, ""))
        } else if (e.key === "ArrowLeft" && index > 0) {
            e.preventDefault()
            inputRefs.current[index - 1]?.focus()
        } else if (e.key === "ArrowRight" && index < 5) {
            e.preventDefault()
            inputRefs.current[index + 1]?.focus()
        } else if (e.key.length === 1 && /\D/.test(e.key) && !e.ctrlKey && !e.metaKey && e.key !== "Tab") {
            // Prevenir caracteres no numéricos, excepto si es Tab, Ctrl+C, Ctrl+V, etc.
            e.preventDefault()
        }
    }

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        e.target.select()
    }

    return (
        <div className="flex justify-center space-x-2 sm:space-x-3">
            {Array.from({ length: 6 }, (_, index) => (
                <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text" // Cambiado a text para mejor manejo de borrado y pegado
                    inputMode="numeric"
                    maxLength={1} // Cada input solo acepta un dígito
                    value={digits[index] || ""}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onFocus={handleFocus}
                    onPaste={handlePaste}
                    className={cn(
                        "w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold bg-white border-2 rounded-lg transition-all duration-200 outline-none",
                        hasError
                            ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                            : "border-gray-300 focus:border-blue-500 focus:ring-blue-200",
                        disabled && "bg-gray-100 cursor-not-allowed",
                    )}
                    disabled={disabled}
                    aria-label={`Dígito ${index + 1} del código de verificación`}
                />
            ))}
        </div>
    )
}

// Componente de Alerta mejorado
const InlineAlert = ({ message, type = "error" }: { message: string | null; type?: "error" | "warning" | "info" }) => {
    if (!message) return null

    const iconMap = {
        error: <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />,
        warning: <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />,
        info: <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />,
    }

    const colorClasses = {
        error: "bg-red-50 border-red-200 text-red-700",
        warning: "bg-yellow-50 border-yellow-200 text-yellow-700",
        info: "bg-blue-50 border-blue-200 text-blue-700",
    }

    return (
        <div className={cn("p-3 rounded-md border", colorClasses[type])}>
            <div className="flex items-center space-x-2">
                {iconMap[type]}
                <p className="text-sm font-medium">{message}</p>
            </div>
        </div>
    )
}

export function SMSVerification({ userId, initialVerified, onVerified }: SMSVerificationProps) {
    const { toast } = useToast()

    const [step, setStep] = useState<"idle" | "enter-phone" | "sent" | "verifying" | "verified">(
        initialVerified ? "verified" : "idle",
    )
    const [phoneFull, setPhoneFull] = useState("")
    const [smsCode, setSmsCode] = useState("")
    const [errorSending, setErrorSending] = useState<string | null>(null)
    const [errorVerifying, setErrorVerifying] = useState<string | null>(null)
    const [isSending, setIsSending] = useState(false)
    const [isVerifying, setIsVerifying] = useState(false)
    const [cooldown, setCooldown] = useState(0)
    const cooldownRef = useRef<NodeJS.Timer | null>(null)

    useEffect(() => {
        if (initialVerified) {
            setStep("verified")
        }
    }, [initialVerified])

    useEffect(() => {
        if (cooldown > 0) {
            cooldownRef.current = setInterval(() => {
                setCooldown((prev) => prev - 1)
            }, 1000)
        }
        return () => {
            if (cooldownRef.current) {
                clearInterval(cooldownRef.current)
                cooldownRef.current = null
            }
        }
    }, [cooldown])

    const handleSendCode = async () => {
        setErrorSending(null)
        setErrorVerifying(null) // Limpiar error de verificación previo

        if (!phoneFull.match(/^\d{8,}$/)) {
            // Simplificado para cualquier número con al menos 8 dígitos
            setErrorSending("Ingresa un número de teléfono válido (mínimo 8 dígitos).")
            return
        }

        setIsSending(true)
        try {
            const res = await fetch("/api/sms/send-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, phone: phoneFull }),
            })
            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || data.message || "No se pudo enviar el SMS. Inténtalo de nuevo.")
            }

            toast({
                title: "Código enviado",
                description: `Revisa tu teléfono +${phoneFull}. El código es válido por 5 minutos.`,
                variant: "default",
            })
            setStep("sent")
            setSmsCode("") // Limpiar código anterior
            setCooldown(RESEND_COOLDOWN_SEC)
        } catch (err: any) {
            console.error("Error enviando SMS:", err)
            setErrorSending(err.message || "Ocurrió un error al enviar el código.")
            toast({
                title: "Error al enviar SMS",
                description: err.message || "No se pudo enviar el código. Verifica el número e inténtalo de nuevo.",
                variant: "destructive",
            })
        } finally {
            setIsSending(false)
        }
    }

    const handleResendCode = async () => {
        if (cooldown > 0) return
        setErrorVerifying(null) // Limpiar error de verificación al reenviar
        handleSendCode()
    }

    const handleVerifyCode = async () => {
        setErrorVerifying(null)

        if (!smsCode.match(/^\d{6}$/)) {
            setErrorVerifying("El código de verificación debe tener 6 dígitos.")
            return
        }

        setIsVerifying(true)
        try {
            const res = await fetch("/api/sms/verify-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, code: smsCode }),
            })
            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || "Código inválido o expirado. Inténtalo de nuevo.")
            }

            toast({
                title: "¡Número verificado!",
                description: `Tu teléfono +${phoneFull} ha sido confirmado exitosamente.`,
                variant: "success",
            })
            setStep("verified")

            // 🔑 1. Guardar el token nuevo que envía el backend
            if (data.token) {
                localStorage.setItem("token", data.token)
            }

            onVerified(data.user)
        } catch (err: any) {
            console.error("Error verificando código:", err)
            setErrorVerifying(err.message || "El código ingresado es incorrecto o ha expirado.")
            toast({
                title: "Error de verificación",
                description: err.message || "El código es incorrecto o ha expirado. Revisa el código o solicita uno nuevo.",
                variant: "destructive",
            })
        } finally {
            setIsVerifying(false)
        }
    }

    // --------------------------------------------
    // 3) Cancelar / Cambiar número de teléfono
    const handleCancel = async () => {
        try {
            await fetch("/api/sms/cancel-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId }),
            })
        } catch (err) {
            console.error("Error cancelando código en Redis:", err)
        } finally {
            // Reset completo de estados
            setPhoneFull("")
            setSmsCode("")
            setErrorSending(null)
            setErrorVerifying(null)
            setCooldown(0)
            if (cooldownRef.current) {
                clearInterval(cooldownRef.current)
                cooldownRef.current = null
            }
            setStep("idle")
        }
    }
    // --------------------------------------------

    const handleChangeNumber = () => {
        // Elimina el código en Redis:
        fetch("/api/sms/cancel-code", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId }),
        }).catch((err) => console.error(err))

        // Solo reset remoto de SMS y volver a input de teléfono
        setStep("enter-phone")
        setSmsCode("")
        setErrorVerifying(null)
        setErrorSending(null)
        setCooldown(0)
        if (cooldownRef.current) {
            clearInterval(cooldownRef.current)
            cooldownRef.current = null
        }
    }

    // Estado verificado
    if (step === "verified") {
        return (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-green-800">Teléfono Verificado</h4>
                        <p className="text-xs text-green-600 mt-1">Tu número de teléfono ha sido confirmado exitosamente.</p>
                    </div>
                </div>
            </div>
        )
    }

    // Estado inicial
    if (step === "idle") {
        return (
            <div className="flex items-center">
                <Button
                    variant="outline"
                    className="bg-blue-600 text-white hover:bg-blue-700 flex items-center text-sm px-4 py-2 h-auto"
                    onClick={() => setStep("enter-phone")}
                >
                    <Shield className="mr-2 h-4 w-4" />
                    Verificar tu Teléfono
                </Button>
                <p className="ml-4 text-xs text-gray-500">Verifica tu número de teléfono para mayor seguridad en tu cuenta.</p>
            </div>
        )
    }

    // Formulario de verificación
    return (
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 space-y-6">
            {" "}
            {/* Aumentado el space-y general */}
            <div className="flex items-center space-x-2">
                <Phone className="h-5 w-5 text-blue-600" />
                <h4 className="text-lg font-medium text-blue-800">Verificación por SMS</h4>
            </div>
            {/* Paso 1: Ingresar teléfono */}
            {step === "enter-phone" && (
                <div className="space-y-4">
                    <div>
                        <label htmlFor="phone-input-field" className="block text-sm font-medium text-gray-700 mb-1">
                            Número de teléfono <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
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
                                    country={"cr"}
                                    value={phoneFull}
                                    onChange={(value) => setPhoneFull(value.replace(/\D/g, ""))}
                                    inputProps={{
                                        name: "phone",
                                        required: true,
                                        id: "phone-input-field", // Para el label
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
                        <p className="text-xs text-gray-500 mt-1.5">
                            Ingresa tu número de teléfono para recibir un código de verificación.
                        </p>
                    </div>

                    <InlineAlert message={errorSending} type="error" />

                    <div className="flex space-x-3 pt-2">
                        {" "}
                        {/* Añadido padding top */}
                        <Button
                            variant="outline"
                            className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                            onClick={() => {
                                handleCancel
                            }}
                            disabled={isSending}
                        >
                            Cancelar
                        </Button>
                        <Button
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={handleSendCode}
                            disabled={isSending}
                        >
                            {isSending ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Enviando...
                                </>
                            ) : (
                                "Enviar código"
                            )}
                        </Button>
                    </div>
                </div>
            )}
            {/* Paso 2: Verificar código */}
            {step === "sent" && (
                <div className="space-y-6">
                    {" "}
                    {/* Aumentado el space-y */}
                    <div className="bg-white p-4 rounded-md border border-gray-200 text-center sm:text-left">
                        <p className="text-sm text-gray-700 mb-1">
                            <strong>Código enviado a:</strong> +{phoneFull}
                        </p>
                        <p className="text-xs text-gray-500">Ingresa el código de 6 dígitos que recibiste por SMS.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                            Código de verificación <span className="text-red-500">*</span>
                        </label>
                        <CodeInputs value={smsCode} onChange={setSmsCode} disabled={isVerifying} hasError={!!errorVerifying} />
                        {/* <p className="text-xs text-gray-500 text-center mt-2">Ingresa los 6 dígitos del código SMS</p> */}
                    </div>
                    <InlineAlert message={errorVerifying} type="error" />
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-2">
                        {" "}
                        {/* Añadido padding top */}
                        <Button
                            variant="outline"
                            className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                            onClick={() => {
                                handleChangeNumber
                            }}
                            disabled={isVerifying}
                        >
                            Cambiar número
                        </Button>
                        <Button
                            variant="outline"
                            className="flex items-center justify-center border-blue-300 text-blue-700 hover:bg-blue-50"
                            onClick={handleResendCode}
                            disabled={cooldown > 0 || isVerifying}
                        >
                            {cooldown > 0 ? (
                                <>
                                    <span className="mr-2">Reenviar en {cooldown}s</span>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                </>
                            ) : (
                                <>
                                    <RefreshCcw className="h-4 w-4 mr-2" />
                                    Reenviar código
                                </>
                            )}
                        </Button>
                        <Button
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={handleVerifyCode}
                            disabled={isVerifying || smsCode.length !== 6}
                        >
                            {isVerifying ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Verificando...
                                </>
                            ) : (
                                "Verificar código"
                            )}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
