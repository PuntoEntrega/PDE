"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/Components/ui/card"
import { Input } from "@/Components/ui/input"
import { Package, Info } from "lucide-react"
import { cn } from "../../../../lib/utils"

const PDEParcelServiceForm = () => {
  // Estado para los tamaños de paquetes
  const [packageSizes, setPackageSizes] = useState({
    xs: true,
    s: true,
    m: true,
    l: true,
    xl: false,
    xxl: false,
    xxxl: false,
  })

  // Estado para el área disponible
  const [availableArea, setAvailableArea] = useState("200")

  // Función para alternar tamaños de paquetes
  const togglePackageSize = (size: string) => {
    setPackageSizes((prev) => ({
      ...prev,
      [size]: !prev[size],
    }))
  }

  return (
    <div className="space-y-6">
      {/* Área en bodega */}
      <Card className="border border-gray-200 shadow-sm overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Info className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-800">
                Área en bodega disponible para los paquetes
              </CardTitle>
              <CardDescription>Espacio disponible para almacenar paquetes en m²</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={availableArea}
              onChange={(e) => setAvailableArea(e.target.value)}
              className="max-w-[120px] border-gray-300"
            />
            <span className="text-gray-600">m²</span>
          </div>
        </CardContent>
      </Card>

      {/* Tamaños de paquetes */}
      <Card className="border border-gray-200 shadow-sm overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-800">
                Seleccione el tamaño de paquetes que podría recibir en el PDE
              </CardTitle>
              <CardDescription>Activa los tamaños de paquetes que tu PDE puede manejar</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-3">
            {[
              {
                id: "xs",
                label: "XS: Sobres y Paquetes",
                description: "que miden de 10cm a 20cm de altura",
                icon: "📦",
              },
              {
                id: "s",
                label: "S: Sobres y Paquetes",
                description: "que miden de 20cm a 30cm de altura",
                icon: "📦",
              },
              {
                id: "m",
                label: "M: Sobres y Paquetes",
                description: "que miden de 30cm a 40cm de altura",
                icon: "📦",
              },
              {
                id: "l",
                label: "L: Sobres y Paquetes",
                description: "que miden de 40cm a 50cm de altura",
                icon: "📦",
              },
              {
                id: "xl",
                label: "XL: Paquetes",
                description: "que miden de 50cm a 60cm de altura",
                icon: "📦",
              },
              {
                id: "xxl",
                label: "XXL: Paquetes",
                description: "que miden de 60cm a 80cm de altura",
                icon: "📦",
              },
              {
                id: "xxxl",
                label: "XXXL: Paquetes",
                description: "que miden de 80cm a 100cm de altura",
                icon: "📦",
              },
            ].map((size) => (
              <div
                key={size.id}
                className={cn(
                  "flex items-center p-4 rounded-xl border transition-all duration-200 cursor-pointer hover:shadow-sm",
                  packageSizes[size.id]
                    ? "border-blue-200 bg-gradient-to-r from-blue-50 to-white"
                    : "border-gray-200 hover:border-gray-300",
                )}
                onClick={() => togglePackageSize(size.id)}
              >
                <div className="flex-1 flex items-center gap-3">
                  <div
                    className={cn(
                      "w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200",
                      packageSizes[size.id] ? "bg-blue-500 border-2 border-blue-500" : "border-2 border-gray-300",
                    )}
                  >
                    {packageSizes[size.id] && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <div>
                    <h3 className={cn("font-medium", packageSizes[size.id] ? "text-blue-900" : "text-gray-700")}>
                      {size.label}
                    </h3>
                    <p className="text-sm text-gray-500">{size.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PDEParcelServiceForm
