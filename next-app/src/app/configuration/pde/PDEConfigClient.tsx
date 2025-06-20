"use client"
// src/app/components/PdeConfigPage.tsx

import React from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/Components/Sidebar/Sidebar"
import { ConfigurationStepper } from "@/Components/stepperConfig/steppers/ConfigurationStepper"
import PDECreator from "@/Components/PDE/PDECreator"

export default function PdeConfigPage() {
  const router = useRouter()

  // Si quisieras: podrías comprobar aquí que el usuario tiene permiso,
  // pero la lógica de creación queda en PDECreator.

  return (
    <Sidebar>
      <div className="min-h-full bg-gradient-to-br from-gray-50 to-blue-50/20 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Solo el stepper */}
          <ConfigurationStepper />

          {/* Aquí va el creador */}
          <PDECreator />
        </div>
      </div>
    </Sidebar>
  )
}
