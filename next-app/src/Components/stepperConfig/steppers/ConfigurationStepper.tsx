// src/components/stepperConfig/steppers/ConfigurationStepper.tsx
"use client"

import { CheckCircle, User, Building2, MapPin } from "lucide-react"
import { cn } from "../../../../lib/utils"
import Link from "next/link"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/Components/ui/tooltip"
import { useStepProgress } from "@/hooks/useStepProgress"

export function ConfigurationStepper() {
  const { currentStep, maxStepReached, goToStep } = useStepProgress()

  const steps = [
    {
      id: 1,
      name: "Mi Perfil",
      description: "Datos personales y de contacto",
      icon: User,
      href: "/configuration/profile",
    },
    {
      id: 2,
      name: "Mi Empresa",
      description: "Información de la empresa",
      icon: Building2,
      href: "/configuration/company",
    },
    {
      id: 3,
      name: "Mis PDEs",
      description: "Configuración de puntos de entrega",
      icon: MapPin,
      href: "/configuration/pde",
    },
  ]

  return (
    <TooltipProvider>
      <nav aria-label="Progress" className="py-4 bg-white rounded-xl shadow-lg">
        <ol role="list" className="flex items-start justify-around px-2 sm:px-4">
          {steps.map((step, stepIdx) => {
            const isCompleted = currentStep > step.id
            const isCurrent = currentStep === step.id
            // No permitimos saltar más de un paso por delante del maxStepReached
            const isLocked = step.id > maxStepReached + 1

            return (
              <li
                key={step.name}
                className="relative flex-1 flex flex-col items-center group"
              >
                {/* Línea que conecta los iconos */}
                {stepIdx > 0 && (
                  <div
                    aria-hidden="true"
                    className="absolute left-0 top-[1.875rem] h-0.5 w-full -translate-x-1/2 transform"
                  >
                    <div
                      className={cn(
                        "h-full transition-colors duration-300",
                        isCompleted ? "bg-blue-600" : "bg-gray-200"
                      )}
                    />
                  </div>
                )}

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={step.href}
                      onClick={(e) => {
                        // Si está bloqueado, detenemos la navegación
                        if (isLocked) {
                          e.preventDefault()
                          return
                        }
                        // Si no está bloqueado, sincronizamos el paso
                        goToStep(step.id)
                      }}
                      className="flex flex-col items-center text-center no-underline"
                    >
                      <div className="relative z-10">
                        <div
                          className={cn(
                            "w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                            isCurrent
                              ? "bg-blue-600 border-blue-600 shadow-blue-300/50 shadow-lg"
                              : isCompleted
                                ? "bg-blue-600 border-blue-600"
                                : "bg-white border-gray-300 group-hover:border-gray-400"
                          )}
                        >
                          {isCompleted ? (
                            <CheckCircle className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                          ) : (
                            <step.icon
                              className={cn(
                                "w-6 h-6 sm:w-7 sm:h-7 transition-colors duration-300",
                                isCurrent
                                  ? "text-white"
                                  : "text-gray-500 group-hover:text-gray-700"
                              )}
                            />
                          )}
                        </div>
                        {/* Indicador de paso actual (pulsante) */}
                        {isCurrent && (
                          <div className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2">
                            <div className="w-3 h-3 bg-blue-600 rounded-full border-2 border-white animate-pulse" />
                          </div>
                        )}
                      </div>
                      <p
                        className={cn(
                          "mt-2.5 text-xs sm:text-sm font-medium transition-colors duration-300 max-w-[120px] sm:max-w-[150px]",
                          isCurrent || isCompleted
                            ? "text-blue-600"
                            : "text-gray-500 group-hover:text-gray-700"
                        )}
                      >
                        {step.name}
                      </p>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-center">
                    <p className="font-semibold">{step.name}</p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </TooltipContent>
                </Tooltip>
              </li>
            )
          })}
        </ol>
      </nav>
    </TooltipProvider>
  )
}
