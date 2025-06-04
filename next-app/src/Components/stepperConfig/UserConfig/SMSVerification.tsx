// src/Components/SMSVerification.tsx
"use client"

import { useState, useEffect } from "react"
import PhoneInput from "react-phone-input-2"
import "react-phone-input-2/lib/style.css"
import { Button } from "@/Components/ui/button"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/Components/ui/use-toast"

interface SMSVerificationProps {
    userId: string
    initialVerified: boolean
    onVerified: (updatedUser: any) => void
}

export function SMSVerification({
    userId,
    initialVerified,
    onVerified,
}: SMSVerificationProps) {
    const { toast } = useToast()

    const [phoneFull, setPhoneFull] = useState("")        // número completo: e.g. "50688881234"
    const [step, setStep] = useState<"idle" | "sent" | "verifying" | "verified">(
        initialVerified ? "verified" : "idle"
    )
    const [isSending, setIsSending] = useState(false)
    const [smsCode, setSmsCode] = useState("")
    const [isVerifying, setIsVerifying] = useState(false)
    const [errorSending, setErrorSending] = useState<string | null>(null)
    const [errorVerifying, setErrorVerifying] = useState<string | null>(null)

    useEffect(() => {
        if (initialVerified) {
            setStep("verified")
        }
    }, [initialVerified])

    const handleSendCode = async () => {
        // Validación mínima: phoneFull debe incluir código y al menos 8 dígitos
        if (!phoneFull.match(/^\d{8,}$/)) {
            setErrorSending("Ingresa un número válido (mín. 8 dígitos).")
            return
        }

        setIsSending(true)
        setErrorSending(null)

        try {
            const res = await fetch("/api/sms/send-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, phone: phoneFull }),
            })

            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.message || "No se pudo enviar el SMS.")
            }

            toast({
                title: "Código enviado",
                description: `Revisa tu teléfono ${phoneFull}`,
            })
            setStep("sent")
        } catch (err: any) {
            console.error("Error enviando SMS:", err)
            setErrorSending(err.message)
        } finally {
            setIsSending(false)
        }
    }

    const handleVerifyCode = async () => {
        if (!smsCode.match(/^\d{6}$/)) {
            setErrorVerifying("El código debe tener 6 dígitos.")
            return
        }

        setIsVerifying(true)
        setErrorVerifying(null)

        try {
            const res = await fetch("/api/sms/verify-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, code: smsCode }),
            })

            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.message || "Código inválido.")
            }

            toast({
                title: "Número verificado",
                description: `¡Teléfono ${phoneFull} confirmado!`,
            })
            setStep("verified")
            if (data.user) {
                onVerified(data.user)
            }
        } catch (err: any) {
            console.error("Error verificando código:", err)
            setErrorVerifying(err.message)
        } finally {
            setIsVerifying(false)
        }
    }

    if (step === "verified") {
        return (
            <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm">Teléfono verificado</span>
            </div>
        )
    }

    return (
        <div className="bg-white p-4 rounded-md border border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Verificación por SMS</h4>

            {step === "idle" && (
                <>
                    <PhoneInput
                        country={"cr"}
                        value={phoneFull}
                        onChange={(value) => {
                            // react-phone-input-2 devuelve algo como "50688881234"
                            setPhoneFull(value.replace(/\D/g, ""))
                        }}
                        inputProps={{
                            name: "phone",
                            required: true,
                        }}
                        containerClass="w-full"
                        inputClass="h-10"
                        buttonClass="bg-white"
                        dropdownClass="z-50"
                    />

                    {errorSending && (
                        <p className="text-xs text-red-500 mt-2 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" /> {errorSending}
                        </p>
                    )}

                    <Button
                        className="w-full mt-3 flex items-center justify-center"
                        onClick={handleSendCode}
                        disabled={isSending}
                    >
                        {isSending ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                            "Enviar código"
                        )}
                    </Button>
                </>
            )}

            {step === "sent" && (
                <>
                    <p className="text-xs text-gray-600 mb-2">
                        Ingresa el código de 6 dígitos que recibiste en <strong>{phoneFull}</strong>
                    </p>
                    <input
                        type="text"
                        maxLength={6}
                        placeholder="******"
                        value={smsCode}
                        onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, ""))}
                        className="w-full h-10 border-gray-300 rounded-md px-3 mb-2"
                        disabled={isVerifying}
                    />

                    {errorVerifying && (
                        <p className="text-xs text-red-500 mb-2 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" /> {errorVerifying}
                        </p>
                    )}

                    <Button
                        className="w-full flex items-center justify-center"
                        onClick={handleVerifyCode}
                        disabled={isVerifying}
                    >
                        {isVerifying ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                            "Verificar código"
                        )}
                    </Button>
                </>
            )}
        </div>
    )
}
