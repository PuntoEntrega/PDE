import { CheckCircle, User, Building2, Users } from "lucide-react"
import { cn } from "../../../lib/utils"
import Link from "next/link"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/Components/ui/tooltip"

interface ConfigurationStepperProps {
  currentStep: number
}

export function ConfigurationStepper({ currentStep }: ConfigurationStepperProps) {
  const steps = [
    {
      id: 1,
      name: "Configuración Mi Perfil",
      description: "Datos personales y de contacto",
      icon: User,
      href: "/configuracion/perfil",
    },
    {
      id: 2,
      name: "Configuración Mi Empresa",
      description: "Información de la empresa",
      icon: Building2,
      href: "/configuracion/empresa",
    },
    {
      id: 3,
      name: "Usuarios de Mis PdEs",
      description: "Gestión de usuarios",
      icon: Users,
      href: "/configuracion/usuarios",
    },
  ]

  return (
    <TooltipProvider>
      <nav aria-label="Progress" className="py-4">
        <ol className="flex items-center justify-between w-full">
          {steps.map((step, stepIdx) => (
            <li key={step.name} className={cn("relative", stepIdx !== steps.length - 1 ? "pr-8 sm:pr-20" : "")}>
              <div className="flex flex-col items-center group">
                {/* Line between steps */}
                {stepIdx !== steps.length - 1 && (
                  <div className="absolute top-1/2 w-full h-0.5 -translate-y-1/2 bg-gray-200 left-0 transform translate-x-1/2">
                    <div
                      className={cn(
                        "h-full bg-blue-600 transition-all duration-500",
                        currentStep > step.id ? "w-full" : "w-0",
                      )}
                    ></div>
                  </div>
                )}

                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative flex items-center justify-center">
                      <Link
                        href={step.href}
                        className={cn(
                          "h-14 w-14 rounded-full flex items-center justify-center text-white transition-all duration-200",
                          currentStep === step.id
                            ? "bg-blue-600 ring-4 ring-blue-100 shadow-md"
                            : currentStep > step.id
                              ? "bg-blue-600"
                              : "bg-gray-300 hover:bg-gray-400",
                        )}
                      >
                        {currentStep > step.id ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : (
                          <step.icon className="w-6 h-6" />
                        )}
                      </Link>

                      {/* Indicador de paso actual */}
                      {currentStep === step.id && (
                        <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-600 rounded-full border-2 border-white animate-pulse"></span>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-sm">
                      <p className="font-medium">{step.name}</p>
                      <p className="text-xs text-gray-500">{step.description}</p>
                    </div>
                  </TooltipContent>
                </Tooltip>

                <div className="mt-3 flex flex-col items-center">
                  <span
                    className={cn(
                      "text-xs font-medium text-center",
                      currentStep === step.id
                        ? "text-blue-600"
                        : currentStep > step.id
                          ? "text-blue-600"
                          : "text-gray-500",
                    )}
                  >
                    {step.name}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </nav>
    </TooltipProvider>
  )
}