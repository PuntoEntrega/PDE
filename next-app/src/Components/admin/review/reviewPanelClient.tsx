// v0 was here
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card"
import { Button } from "@/Components/ui/button"
import { Users, Building2, Store } from "lucide-react"
import ReviewUsersClient from "./reviewUsersPage"
import ReviewCompaniesClient from "./reviewCompanyPage"
import ReviewPDEPageClient from "./reviewPDEPage"
import ReviewDetailView from "./reviewDetailView"

interface ReviewPanelClientProps {
  adminId: string
}

type ReviewSection = "users" | "companies" | "pdes"
type ReviewItem = {
  id: string
  type: ReviewSection
  name: string
}

export default function ReviewPanelClient({ adminId }: ReviewPanelClientProps) {
  const [activeSection, setActiveSection] = useState<ReviewSection>("users")
  const [selectedItem, setSelectedItem] = useState<ReviewItem | null>(null)

  const handleItemSelect = (item: ReviewItem) => {
    setSelectedItem(item) 
  }

  const handleBackToList = () => {
    setSelectedItem(null)
  }

  const sections = [
    {
      key: "users" as ReviewSection,
      label: "Usuarios",
      icon: Users,
      color: "blue",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      borderColor: "border-blue-200",
    },
    {
      key: "companies" as ReviewSection,
      label: "Empresas",
      icon: Building2,
      color: "green",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      borderColor: "border-green-200",
    },
    {
      key: "pdes" as ReviewSection,
      label: "Puntos de Entrega",
      icon: Store,
      color: "purple",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      borderColor: "border-purple-200",
    },
  ]

  // Si hay un item seleccionado, mostrar la vista de detalle
  if (selectedItem) {
    return (
      <ReviewDetailView
        item={selectedItem}
        adminId={adminId}
        onBack={handleBackToList}
        onStatusChanged={handleBackToList}
      />
    )
  }

  return (
    <Card className="shadow-lg border border-gray-200 rounded-xl overflow-hidden">
      <CardHeader className="bg-gradient-to-br from-gray-50 to-slate-100 p-6 border-b">
        <CardTitle className="text-xl font-semibold text-gray-800">Selecciona qué revisar</CardTitle>
        <p className="text-sm text-gray-600 mt-1">Elige una categoría para ver las solicitudes pendientes</p>
      </CardHeader>

      <CardContent className="p-6">
        {/* Selector de sección */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {sections.map((section) => {
            const Icon = section.icon
            const isActive = activeSection === section.key

            return (
              <Button
                key={section.key}
                variant={isActive ? "default" : "outline"}
                onClick={() => setActiveSection(section.key)}
                className={`h-20 flex flex-col items-center justify-center gap-2 transition-all duration-200 ${
                  isActive
                    ? `${section.bgColor} ${section.iconColor} ${section.borderColor} border-2`
                    : "hover:bg-gray-50"
                }`}
              >
                <Icon className={`h-6 w-6 ${isActive ? section.iconColor : "text-gray-500"}`} />
                <span className={`font-medium ${isActive ? section.iconColor : "text-gray-700"}`}>{section.label}</span>
              </Button>
            )
          })}
        </div>

        {/* Contenido de la sección activa */}
        <div className="min-h-[400px]">
          {activeSection === "users" && <ReviewUsersClient adminId={adminId} onItemSelect={handleItemSelect} />}
          {activeSection === "companies" && <ReviewCompaniesClient adminId={adminId} onItemSelect={handleItemSelect} />}
          {activeSection === "pdes" && <ReviewPDEPageClient adminId={adminId} onItemSelect={handleItemSelect} />}
        </div>
      </CardContent>
    </Card>
  )
}
