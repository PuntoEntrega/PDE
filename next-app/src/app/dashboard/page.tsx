// src/app/dashboard/page.tsx (o donde tengas tu DashboardPage)
"use client"

import logoAppConTexto from '../../../public/punto_entrega_logo.png'
import { useRouter } from "next/navigation"
import { cn } from "../../../lib/utils"
import { Sidebar } from "../../Components/Sidebar/Sidebar"
import { Button } from "@/Components/ui/button"
import Image from "next/image"
import { Card } from "@/Components/ui/card"
import { CheckCircle2, ArrowRight, PackageIcon } from "lucide-react"
import { useStepProgress } from "@/hooks/useStepProgress"

export default function DashboardPage() {
  const { currentStep, loading } = useStepProgress()
  const router = useRouter()

  const steps = [
    {
      id: 1,
      title: "Datos personales",
      description: "Completa tu información personal",
      href: "/configuration/profile",
    },
    {
      id: 2,
      title: "Datos de la Empresa",
      description: "Registra los datos de tu empresa",
      href: "/configuration/company",
    },
    {
      id: 3,
      title: "Datos de tus Puntos de Entrega (PdE)",
      description: "Configura tus puntos de entrega",
      href: "/configuration/pde",
    },
  ].map((step) => ({
    ...step,
    completed: step.id < currentStep,
    current: step.id === currentStep,
  }))

  if (loading) return null  // o tu spinner

  return (
    <Sidebar>
      <div className="min-h-full bg-gradient-to-br from-gray-50 to-blue-50/20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Welcome Section */}
          <Card className="bg-white shadow-lg rounded-2xl p-8 mb-8 border-0 overflow-hidden">
            {/* ... tu contenido de bienvenida ... */}
          </Card>

          {/* Progress Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Completa tu configuración</h2>
            <div className="relative">
              <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gray-200"></div>
              <div className="space-y-6">
                {steps.map((step) => (
                  <Card
                    key={step.id}
                    className={cn(
                      "bg-white shadow-md rounded-xl p-6 border-0 relative",
                      step.completed ? "bg-green-50" : step.current ? "bg-blue-50" : "bg-white",
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start flex-1">
                        <div
                          className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg z-10",
                            step.completed
                              ? "bg-green-100 text-green-600"
                              : step.current
                                ? "bg-blue-100 text-blue-600 ring-4 ring-blue-50"
                                : "bg-gray-100 text-gray-400",
                          )}
                        >
                          {step.completed ? (
                            <CheckCircle2 className="w-6 h-6" />
                          ) : (
                            <span>{step.id}</span>
                          )}
                        </div>
                        <div className="ml-4 pt-1">
                          <h3
                            className={cn(
                              "font-semibold text-lg",
                              step.completed ? "text-green-800" : step.current ? "text-blue-800" : "text-gray-800",
                            )}
                          >
                            {step.title}
                          </h3>
                          <p
                            className={cn(
                              "text-sm mt-1",
                              step.completed ? "text-green-600" : step.current ? "text-blue-600" : "text-gray-600",
                            )}
                          >
                            {step.description}
                          </p>
                        </div>
                      </div>

                      {/* Flecha solo en el paso actual, y llevando a su href */}
                      {step.current && (
                        <div className="flex items-center">
                          <div
                            onClick={() => router.push(step.href)}
                            className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shadow-md hover:shadow-lg hover:bg-blue-700 transition-all cursor-pointer"
                          >
                            <ArrowRight className="w-5 h-5 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Botón dinámico */}
          <div className="text-center">
            <Button
              onClick={() => {
                const nextHref = steps.find((s) => s.id === currentStep)?.href!
                router.push(nextHref)
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-8 text-lg rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              {currentStep < 3 ? "Continuar configuración" : "Ver estado"}
            </Button>
          </div>
        </div>
      </div>
    </Sidebar>
  )
}
