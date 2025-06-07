// src/hooks/useStepProgress.ts
import { useState, useEffect } from "react"
import axios from "axios"
import { useUser } from "@/context/UserContext"

export function useStepProgress() {
    const { user } = useUser()                // Contexto de usuario con campo `verified`
    const [currentStep, setCurrentStep] = useState<number>(1)
    const [maxStepReached, setMaxStepReached] = useState<number>(1)
    const [loading, setLoading] = useState<boolean>(true)

    useEffect(() => {
        // Al montar, leemos Redis vía API para saber en qué paso está el usuario
        axios
            .get("/api/progress")
            .then((res) => {
                const step = res.data.currentStep || 1
                setCurrentStep(step)
                setMaxStepReached(step)
            })
            .finally(() => {
                setLoading(false)
            })
    }, [])

    // 🔐 Validar si se puede avanzar al paso solicitado
    const validateStep = async (step: number): Promise<boolean> => {
        if (step === 2) {
            // Paso 2: el usuario debe estar verificado (SMS) según contexto
            return user?.verified === true
        }
        if (step === 3) {
            // Paso 3: debe existir empresa en Redis (draft)
            const res = await axios.get(`/api/companies/draft?user_id=${user.sub}`)
            return !!res.data.companyId
        }
        return true // Paso 1 o cualquier otro no requiere validación extra
    }

    const goToStep = async (nextStep: number) => {
        // Si el siguiente paso es mayor que el registrado, validamos y actualizamos Redis
        if (nextStep > maxStepReached) {
            const valid = await validateStep(nextStep)
            if (!valid) {
                // Nota: aquí puedes reemplazar alert(...) por un toast de tu UI
                alert("No puedes avanzar a este paso aún.")
                return
            }
            // Actualizar Redis: guardar sólo si nextStep > valor actual en Redis
            await axios.patch("/api/progress", { step: nextStep })
            setMaxStepReached(nextStep)
        }
        // Finalmente, actualizamos el estado local
        setCurrentStep(nextStep)
    }

    return { currentStep, maxStepReached, loading, goToStep }
}
