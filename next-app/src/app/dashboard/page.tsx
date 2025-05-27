"use client"

import { cn } from "../../../lib/utils"
import { Sidebar } from "../../Components/Sidebar/Sidebar"
import { DashboardContent } from "@/Components/Dashboard/Dashboard"
import { Button } from "@/Components/ui/button"
import Image from "next/image"
import { Card } from "@/Components/ui/card"
import { CheckCircle2, ArrowRight, PackageIcon } from "lucide-react"

export default function DashboardPage() {
  const steps = [
    {
      id: 1,
      title: "Datos personales",
      description: "Completa tu información personal",
      completed: false,
      current: true,
    },
    {
      id: 2,
      title: "Datos de la Empresa",
      description: "Registra los datos de tu empresa",
      completed: false,
      current: false,
    },
    {
      id: 3,
      title: "Datos de tus Puntos de Entrega (PdE)",
      description: "Configura tus puntos de entrega",
      completed: false,
      current: false,
    },
  ]

  return (
    <Sidebar userName="Juan Pérez Araya">
      <DashboardContent>
        <div className="min-h-full bg-gradient-to-br from-gray-50 to-blue-50/20">
          <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Welcome Section */}
            <Card className="bg-white shadow-lg rounded-2xl p-8 mb-8 border-0 overflow-hidden">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="flex-1 text-center md:text-left mb-6 md:mb-0">
                  <div className="mb-6">
                    <Image
                      src="/logo.png"
                      alt="Punto Entrega"
                      width={180}
                      height={54}
                      className="h-auto mx-auto md:mx-0"
                    />
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                    ¡Te damos la bienvenida a nuestro Sistema PdE!
                  </h1>
                  <p className="text-lg text-blue-700 leading-relaxed">
                    En nuestro sistema podrás gestionar la entrega y recepción de paquetes directamente desde tu
                    computadora o sistema móvil
                  </p>
                </div>
                <div className="hidden md:block relative">
                  <div className="w-64 h-64 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg overflow-hidden">
                    <div className="absolute inset-0 bg-blue-600 opacity-20 rounded-full"></div>
                    <PackageIcon className="w-32 h-32 text-white" />
                  </div>
                  <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-blue-100 rounded-full z-0"></div>
                  <div className="absolute -top-4 -left-4 w-16 h-16 bg-blue-100 rounded-full z-0"></div>
                </div>
              </div>
            </Card>

            {/* Progress Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Completa tu configuración</h2>
              <div className="relative">
                {/* Línea vertical conectora */}
                <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gray-200"></div>

                <div className="space-y-6">
                  {steps.map((step, index) => (
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
                              <div className="flex items-center justify-center">
                                <span>{step.id}</span>
                              </div>
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

                        {/* Flecha de acción - solo visible en el paso actual */}
                        {step.current && (
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shadow-md hover:shadow-lg hover:bg-blue-700 transition-all cursor-pointer">
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

            {/* Action Button */}
            <div className="text-center">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg rounded-xl shadow-md hover:shadow-lg transition-all">
                Comenzar configuración
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </DashboardContent>
    </Sidebar>
  )
}