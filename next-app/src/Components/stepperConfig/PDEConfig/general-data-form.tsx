"use client"
// src/Components/stepperConfig/PDEConfig/general-data-form.tsx

import React, { useState, useEffect, useRef } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/Components/ui/card"
import { Input } from "@/Components/ui/input"
import { Label } from "@/Components/ui/label"
import { Textarea } from "@/Components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/ui/select"
import { Switch } from "@/Components/ui/switch"
import { Button } from "@/Components/ui/button"
import {
  Clock,
  Info,
  MapPin,
  LocateFixed,
} from "lucide-react"
import { cn } from "../../../../lib/utils"
import CompanyVisualSelector from "@/Components/CompanyVisualSelector"
import MapSelector from "@/Components/Mapa/MapSelector.client"
import type { MapSelectorRef } from "@/Components/Mapa/MapSelector"

export interface DeliveryPointGeneralData {
  company_id: string
  name: string
  whatsapp_contact: string
  business_email: string
  province: string
  canton: string
  district: string
  exact_address: string
  postal_code: string
  latitude?: number
  longitude?: number
  schedule_json: Record<
    string,
    { isOpen: boolean; openTime: string; closeTime: string }
  >
  services_json: {
    cards: boolean
    cash: boolean
    sinpe: boolean
    guidesPrinting: boolean
    parking: boolean
    accessibility: boolean
  }
}
type CompanyMini = { id: string; trade_name: string; logo_url: string | null; company_type: string; active: boolean }

interface PdeGeneralDataFormProps {
  initialData?: Partial<DeliveryPointGeneralData>
  onChange: (data: Partial<DeliveryPointGeneralData>) => void
  companies: CompanyMini[]            /* ← llega del padre */

}

export default function PdeGeneralDataForm({
  initialData,
  onChange,
  companies, // 👈 faltaba esto
}: PdeGeneralDataFormProps) {
  // Datos básicos
  const [name, setName] = useState(initialData?.name || "")
  const [telefono, setTelefono] = useState(initialData?.whatsapp_contact || "")
  const [email, setEmail] = useState(initialData?.business_email || "")
  const [companyId, setCompanyId] = useState<string | null>(
    initialData?.company_id ?? null
  )

  // Ubicación
  const [locationJson, setLocationJson] = useState<any>(initialData?.location_json || null);
  const [exactAddress, setExactAddress] = useState(
    initialData?.exact_address || ""
  )
  const [postalCode, setPostalCode] = useState(initialData?.postal_code || "")
  const [geo, setGeo] = useState<[number, number] | null>(
    initialData?.latitude != null && initialData?.longitude != null
      ? [initialData.latitude, initialData.longitude]
      : null
  )
  const mapRef = useRef<MapSelectorRef>(null)

  // Horario
  const [schedule, setSchedule] = useState(
    initialData?.schedule_json || {
      monday: { isOpen: true, openTime: "08:00", closeTime: "18:00" },
      tuesday: { isOpen: true, openTime: "08:00", closeTime: "18:00" },
      wednesday: { isOpen: true, openTime: "08:00", closeTime: "18:00" },
      thursday: { isOpen: true, openTime: "08:00", closeTime: "18:00" },
      friday: { isOpen: true, openTime: "08:00", closeTime: "18:00" },
      saturday: { isOpen: true, openTime: "09:00", closeTime: "13:00" },
      sunday: { isOpen: false, openTime: "09:00", closeTime: "13:00" },
    }
  )

  // Métodos de pago / servicios
  const [paymentMethods, setPaymentMethods] = useState(
    initialData?.services_json
      ? {
        cards: initialData.services_json.cards,
        cash: initialData.services_json.cash,
        sinpe: initialData.services_json.sinpe,
      }
      : { cards: false, cash: false, sinpe: false }
  )
  const [additionalServices, setAdditionalServices] = useState(
    initialData?.services_json
      ? {
        guidesPrinting: initialData.services_json.guidesPrinting,
        parking: initialData.services_json.parking,
        accessibility: initialData.services_json.accessibility,
      }
      : { guidesPrinting: false, parking: false, accessibility: false }
  )

  // Sync cuando cambien los initialData
  useEffect(() => {
    if (!initialData) return
    setName(initialData.name || "")
    setTelefono(initialData.whatsapp_contact || "")
    setEmail(initialData.business_email || "")
    setCompanyId(initialData.company_id ?? null)
    setExactAddress(initialData.exact_address || "")
    setPostalCode(initialData.postal_code || "")
    if (
      initialData.latitude != null &&
      initialData.longitude != null
    ) {
      setGeo([initialData.latitude, initialData.longitude])
    }
    if (initialData.schedule_json) {
      setSchedule(initialData.schedule_json)
    }
    if (initialData.services_json) {
      const s = initialData.services_json
      setPaymentMethods({ cards: s.cards, cash: s.cash, sinpe: s.sinpe })
      setAdditionalServices({
        guidesPrinting: s.guidesPrinting,
        parking: s.parking,
        accessibility: s.accessibility,
      })
    }
  }, [initialData])

  // Efecto para notificar cambios al padre (YA NO depende de onChange)
  useEffect(() => {
    onChange({
      company_id: companyId,
      name,
      whatsapp_contact: telefono,
      business_email: email,
      exact_address: exactAddress,
      postal_code: postalCode,
      latitude: geo?.[0],
      longitude: geo?.[1],
      location_json: locationJson,
      schedule_json: schedule,
      services_json: { ...paymentMethods, ...additionalServices },
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    companyId,
    name,
    telefono,
    email,
    exactAddress,
    postalCode,
    geo,
    schedule,
    paymentMethods,
    additionalServices,
  ])

  // Helpers para horario...
  const toggleDay = (day: string) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], isOpen: !prev[day].isOpen },
    }))
  }
  const updateSchedule = (
    day: string,
    field: "openTime" | "closeTime",
    value: string
  ) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }))
  }
  const setQuickSchedule = (type: "weekdays" | "all" | "none") => {
    const days = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ] as const
    if (type === "weekdays") {
      setSchedule((prev) =>
        Object.fromEntries(
          days.map((day, i) => [
            day,
            {
              ...prev[day],
              isOpen: i < 5,
              openTime: i < 5 ? "08:00" : prev[day].openTime,
              closeTime: i < 5 ? "18:00" : prev[day].closeTime,
            },
          ])
        ) as typeof schedule
      )
    } else if (type === "all") {
      setSchedule((prev) =>
        Object.fromEntries(days.map((day) => [day, { ...prev[day], isOpen: true }]))
      )
    } else {
      setSchedule((prev) =>
        Object.fromEntries(days.map((day) => [day, { ...prev[day], isOpen: false }]))
      )
    }
  }

  // Toggle métodos / servicios...
  const togglePaymentMethod = (method: keyof typeof paymentMethods) => {
    setPaymentMethods((prev) => ({ ...prev, [method]: !prev[method] }))
  }
  const toggleAdditionalService = (
    service: keyof typeof additionalServices
  ) => {
    setAdditionalServices((prev) => ({
      ...prev,
      [service]: !prev[service],
    }))
  }

  return (
    <div className="space-y-6">
      {/* Información General */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Info className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-800">
                Información General
              </CardTitle>
              <CardDescription>Datos básicos del PDE.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del PDE</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Los pollos"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono / WhatsApp</Label>
              <Input
                id="telefono"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="8888-8888"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo comercial</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="empresa@ejemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Empresa asociada</Label>
              <CompanyVisualSelector
                value={companyId}
                onChange={(id) => setCompanyId(id)}
                companies={companies}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dirección */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MapPin className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-800">
                Dirección y geolocalización
              </CardTitle>
              <CardDescription>Ubicación exacta del PDE.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="exactAddress">Dirección exacta</Label>
            <Textarea
              id="exactAddress"
              value={exactAddress}
              onChange={(e) => setExactAddress(e.target.value)}
              placeholder="Diagonal a la iglesia…"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="postalCode">Código Postal</Label>
              <Input
                id="postalCode"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="20202"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="geolocation">Geolocalización</Label>
              <Input
                id="geolocation"
                readOnly
                value={
                  geo ? `${geo[0].toFixed(6)}, ${geo[1].toFixed(6)}` : ""
                }
              />
            </div>
          </div>

          <div className="h-[300px] relative border-gray-300 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => mapRef.current?.locateUser()}
              className="absolute top-2 right-2 bg-white shadow px-2 py-1 rounded-full text-sm flex items-center gap-1"
            >
              <LocateFixed className="w-4 h-4 text-blue-600" />
              Ubicarme
            </button>
            {locationJson?.display_name && (
              <div className="text-sm text-gray-700 bg-gray-50 border rounded-md px-4 py-2">
                Ubicación detectada: <strong>{locationJson.display_name}</strong>
              </div>
            )}
            <MapSelector
              ref={mapRef}
              onLocationSelect={(locationData) => {
                setGeo([locationData.lat, locationData.lon]);
                setLocationJson(locationData);
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Horario */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-800">
                Horario Comercial
              </CardTitle>
              <CardDescription>
                Configura días y horarios de atención.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-wrap gap-3 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuickSchedule("weekdays")}
            >
              Solo laborales
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuickSchedule("all")}
            >
              Todos
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuickSchedule("none")}
            >
              Ninguno
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(schedule).map(([key, cfg]) => {
              const dayName = key.charAt(0).toUpperCase() + key.slice(1)
              return (
                <div
                  key={key}
                  className={cn(
                    "relative rounded-xl border p-4",
                    cfg.isOpen
                      ? "border-blue-200 bg-gradient-to-r from-blue-50 to-white"
                      : "border-gray-200 bg-gray-50"
                  )}
                >
                  <div className="absolute top-3 right-3">
                    <Switch
                      checked={cfg.isOpen}
                      onCheckedChange={() => toggleDay(key)}
                    />
                  </div>
                  <h3
                    className={
                      cfg.isOpen ? "text-blue-900" : "text-gray-500"
                    }
                  >
                    {dayName}
                  </h3>
                  {cfg.isOpen ? (
                    <div className="mt-2 flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateSchedule(key, "openTime", cfg.openTime)
                        }
                      >
                        {cfg.openTime}
                      </Button>
                      <span>a</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateSchedule(key, "closeTime", cfg.closeTime)
                        }
                      >
                        {cfg.closeTime}
                      </Button>
                    </div>
                  ) : (
                    <p className="text-gray-500">Cerrado</p>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Métodos de pago y servicios */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Info className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-800">
                Pago y Servicios
              </CardTitle>
              <CardDescription>
                Selecciona métodos y servicios extras.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {/* Pago */}
          <div className="space-y-3">
            {[
              { id: "cards", label: "Tarjetas" },
              { id: "cash", label: "Efectivo" },
              { id: "sinpe", label: "Sinpe" },
            ].map((m) => (
              <div
                key={m.id}
                className={cn(
                  "flex justify-between p-4 rounded-xl border cursor-pointer",
                  paymentMethods[m.id]
                    ? "border-blue-200 bg-gradient-to-r from-blue-50 to-white"
                    : "border-gray-200 bg-gray-50"
                )}
                onClick={() =>
                  togglePaymentMethod(m.id as keyof typeof paymentMethods)
                }
              >
                <span>{m.label}</span>
                <span>
                  {paymentMethods[m.id] ? "Sí" : "No"}
                </span>
              </div>
            ))}
          </div>
          {/* Servicios */}
          <div className="space-y-3">
            {[
              {
                id: "guidesPrinting",
                label: "Impresión de guías",
              },
              { id: "parking", label: "Parqueo" },
              { id: "accessibility", label: "Accesibilidad" },
            ].map((s) => (
              <div
                key={s.id}
                className={cn(
                  "flex justify-between p-4 rounded-xl border cursor-pointer",
                  additionalServices[s.id]
                    ? "border-blue-200 bg-gradient-to-r from-blue-50 to-white"
                    : "border-gray-200 bg-gray-50"
                )}
                onClick={() =>
                  toggleAdditionalService(
                    s.id as keyof typeof additionalServices
                  )
                }
              >
                <span>{s.label}</span>
                <span>
                  {additionalServices[s.id] ? "Sí" : "No"}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
