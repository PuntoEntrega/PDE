"use client"
// src/Components/stepperConfig/PDEConfig/parcel-service-form.tsx

import React, { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/Components/ui/card"
import { Input } from "@/Components/ui/input"
import { Package, Info } from "lucide-react"
import { cn } from "../../../../lib/utils"

export interface DeliveryPointParcelData {
  storage_area_m2: number
  accepts_xs: boolean
  accepts_s: boolean
  accepts_m: boolean
  accepts_l: boolean
  accepts_xl: boolean
  accepts_xxl: boolean
  accepts_xxxl: boolean
}

interface PdeParcelServiceFormProps {
  onChange: (data: Partial<DeliveryPointParcelData>) => void
}

export default function PdeParcelServiceForm({
  onChange,
}: PdeParcelServiceFormProps) {
  const [packageSizes, setPackageSizes] = useState({
    xs: true,
    s: true,
    m: true,
    l: true,
    xl: false,
    xxl: false,
    xxxl: false,
  })
  const [availableArea, setAvailableArea] = useState("200")

  useEffect(() => {
    onChange({
      storage_area_m2: parseFloat(availableArea),
      accepts_xs: packageSizes.xs,
      accepts_s: packageSizes.s,
      accepts_m: packageSizes.m,
      accepts_l: packageSizes.l,
      accepts_xl: packageSizes.xl,
      accepts_xxl: packageSizes.xxl,
      accepts_xxxl: packageSizes.xxxl,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])  // ← solo una vez


  const togglePackageSize = (size: keyof typeof packageSizes) => {
    setPackageSizes((prev) => ({
      ...prev,
      [size]: !prev[size],
    }))
  }

  return (
    <div className="space-y-6">
      {/* Área en bodega */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Info className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-800">
                Área disponible (m²)
              </CardTitle>
              <CardDescription>
                Espacio en bodega para paquetes
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={availableArea}
              onChange={(e) => setAvailableArea(e.target.value)}
              className="max-w-[120px]"
            />
            <span>m²</span>
          </div>
        </CardContent>
      </Card>

      {/* Tamaños de paquetes */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-800">
                Tamaños de paquetes
              </CardTitle>
              <CardDescription>
                Activa los tamaños que recibes
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {[
            { id: "xs", label: "XS: 10–20cm" },
            { id: "s", label: "S: 20–30cm" },
            { id: "m", label: "M: 30–40cm" },
            { id: "l", label: "L: 40–50cm" },
            { id: "xl", label: "XL: 50–60cm" },
            { id: "xxl", label: "XXL: 60–80cm" },
            { id: "xxxl", label: "XXXL: 80–100cm" },
          ].map((size) => (
            <div
              key={size.id}
              className={cn(
                "flex items-center p-4 rounded-xl border cursor-pointer",
                packageSizes[size.id]
                  ? "border-blue-200 bg-gradient-to-r from-blue-50 to-white"
                  : "border-gray-200 bg-gray-50"
              )}
              onClick={() => togglePackageSize(size.id as keyof typeof packageSizes)}
            >
              <div className="flex-1">
                <h3
                  className={
                    packageSizes[size.id]
                      ? "text-blue-900"
                      : "text-gray-700"
                  }
                >
                  {size.label}
                </h3>
              </div>
              <div>
                <span>
                  {packageSizes[size.id] ? "✔️" : ""}
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
