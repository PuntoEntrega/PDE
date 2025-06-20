"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/context/UserContext"
import { useStepProgress } from "@/hooks/useStepProgress"
import { useToast } from "@/Components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/Components/ui/card"
import { Input } from "@/Components/ui/input"
import { Label } from "@/Components/ui/label"
import { Textarea } from "@/Components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select"
import { Switch } from "@/Components/ui/switch"
import { Button } from "@/Components/ui/button"
import { ArrowLeft, Send, Info, MapPin, LocateFixed, Clock, Package, CreditCard } from "lucide-react"
import { cn } from "../../../lib/utils"
import CompanyVisualSelector from "@/Components/CompanyVisualSelector"
import MapSelector from "@/Components/Mapa/MapSelector.client"
import type { MapSelectorRef } from "@/Components/Mapa/MapSelector"

interface CompanyMini {
  id: string
  trade_name: string
  logo_url: string | null
  company_type: string
  active: boolean
}

export default function PDECreator() {
  const router = useRouter()
  const { user } = useUser()
  const { goToStep } = useStepProgress()
  const { toast } = useToast()
  const mapRef = useRef<MapSelectorRef>(null)

  // Loading empresas
  const [companies, setCompanies] = useState<CompanyMini[]>([])

  // Datos básicos
  const [companyId, setCompanyId] = useState<string>("")
  const [name, setName] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [email, setEmail] = useState("")

  // Ubicación
  const [province, setProvince] = useState("")
  const [canton, setCanton] = useState("")
  const [district, setDistrict] = useState("")
  const [exactAddress, setExactAddress] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [geo, setGeo] = useState<[number, number] | null>(null)

  // Horario
  const [schedule, setSchedule] = useState({
    monday: { isOpen: true, openTime: "08:00", closeTime: "18:00" },
    tuesday: { isOpen: true, openTime: "08:00", closeTime: "18:00" },
    wednesday: { isOpen: true, openTime: "08:00", closeTime: "18:00" },
    thursday: { isOpen: true, openTime: "08:00", closeTime: "18:00" },
    friday: { isOpen: true, openTime: "08:00", closeTime: "18:00" },
    saturday: { isOpen: true, openTime: "09:00", closeTime: "13:00" },
    sunday: { isOpen: false, openTime: "09:00", closeTime: "13:00" },
  })

  // Métodos de pago
  const [paymentMethods, setPaymentMethods] = useState({
    cards: false,
    cash: false,
    sinpe: false,
  })

  // Servicios adicionales
  const [additionalServices, setAdditionalServices] = useState({
    guidesPrinting: false,
    parking: false,
    accessibility: false,
  })

  // Paquetería
  const [storageArea, setStorageArea] = useState("200")
  const [packageSizes, setPackageSizes] = useState({
    xs: true,
    s: true,
    m: true,
    l: true,
    xl: false,
    xxl: false,
    xxxl: false,
  })

  const [saving, setSaving] = useState(false)

  // Helpers para horario
  const toggleDay = (day: string) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], isOpen: !prev[day].isOpen },
    }))
  }

  const updateSchedule = (day: string, field: "openTime" | "closeTime", value: string) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }))
  }

  const setQuickSchedule = (type: "weekdays" | "all" | "none") => {
    const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const
    if (type === "weekdays") {
      setSchedule(
        (prev) =>
          Object.fromEntries(
            days.map((day, i) => [
              day,
              {
                ...prev[day],
                isOpen: i < 5,
                openTime: i < 5 ? "08:00" : prev[day].openTime,
                closeTime: i < 5 ? "18:00" : prev[day].closeTime,
              },
            ]),
          ) as typeof schedule,
      )
    } else if (type === "all") {
      setSchedule((prev) => Object.fromEntries(days.map((day) => [day, { ...prev[day], isOpen: true }])))
    } else {
      setSchedule((prev) => Object.fromEntries(days.map((day) => [day, { ...prev[day], isOpen: false }])))
    }
  }

  // Toggle métodos de pago
  const togglePaymentMethod = (method: keyof typeof paymentMethods) => {
    setPaymentMethods((prev) => ({ ...prev, [method]: !prev[method] }))
  }

  // Toggle servicios adicionales
  const toggleAdditionalService = (service: keyof typeof additionalServices) => {
    setAdditionalServices((prev) => ({
      ...prev,
      [service]: !prev[service],
    }))
  }

  // Toggle tamaños de paquetes
  const togglePackageSize = (size: keyof typeof packageSizes) => {
    setPackageSizes((prev) => ({
      ...prev,
      [size]: !prev[size],
    }))
  }

  // Validaciones
  const validateForm = () => {
    if (!companyId) return "Seleccione una empresa"
    if (!name) return "Ingrese el nombre del PDE"
    if (!whatsapp) return "Ingrese el teléfono/WhatsApp"
    if (!email) return "Ingrese el correo electrónico"
    if (!province) return "Seleccione la provincia"
    if (!canton) return "Seleccione el cantón"
    if (!district) return "Seleccione el distrito"
    if (!exactAddress) return "Ingrese la dirección exacta"
    if (!postalCode) return "Ingrese el código postal"
    if (!geo) return "Seleccione la ubicación en el mapa"
    if (!storageArea || isNaN(Number(storageArea)) || Number(storageArea) <= 0) {
      return "Ingrese un área de bodega válida"
    }
    if (!Object.values(packageSizes).some(Boolean)) {
      return "Seleccione al menos un tamaño de paquete"
    }
    return null
  }

  const handleSave = async () => {
    const error = validateForm()
    if (error) {
      toast({
        title: "Error de validación",
        description: error,
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      const payload = {
        company_id: companyId,
        name,
        whatsapp_contact: whatsapp,
        business_email: email,
        province,
        canton,
        district,
        exact_address: exactAddress,
        postal_code: postalCode,
        latitude: geo![0],
        longitude: geo![1],
        schedule_json: schedule,
        services_json: { ...paymentMethods, ...additionalServices },
        storage_area_m2: Number.parseFloat(storageArea),
        accepts_xs: packageSizes.xs,
        accepts_s: packageSizes.s,
        accepts_m: packageSizes.m,
        accepts_l: packageSizes.l,
        accepts_xl: packageSizes.xl,
        accepts_xxl: packageSizes.xxl,
        accepts_xxxl: packageSizes.xxxl,
      }

      // Crear PDE
      const pdeRes = await fetch("/api/pdes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!pdeRes.ok) throw new Error("Error al crear el PDE")

      // Enviar a revisión
      await fetch(`/api/users/${user?.sub}/submit-review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          changed_by_id: user?.sub,
          reason: "Configuración completada, solicita revisión.",
        }),
      })

      toast({
        title: "¡Éxito!",
        description: "PDE creado y enviado a revisión.",
      })

      await goToStep(3)
      router.push("/configuration/status-info")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Algo salió mal",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
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
              <CardTitle className="text-lg font-semibold text-gray-800">Información General</CardTitle>
              <CardDescription>Datos básicos del PDE</CardDescription>
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
                placeholder="Ej: Los Pollos Hermanos"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp">Teléfono / WhatsApp</Label>
              <Input
                id="whatsapp"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
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
              <CompanyVisualSelector value={companyId} onChange={(id) => setCompanyId(id)} companies={companies} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dirección y Geolocalización */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <MapPin className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-800">Dirección y Geolocalización</CardTitle>
              <CardDescription>Ubicación exacta del PDE</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="province">Provincia</Label>
              <Select value={province} onValueChange={setProvince}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione una" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="san_jose">San José</SelectItem>
                  <SelectItem value="alajuela">Alajuela</SelectItem>
                  <SelectItem value="cartago">Cartago</SelectItem>
                  <SelectItem value="heredia">Heredia</SelectItem>
                  <SelectItem value="guanacaste">Guanacaste</SelectItem>
                  <SelectItem value="puntarenas">Puntarenas</SelectItem>
                  <SelectItem value="limon">Limón</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="canton">Cantón</Label>
              <Select value={canton} onValueChange={setCanton}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione uno" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="central">Central</SelectItem>
                  <SelectItem value="escazu">Escazú</SelectItem>
                  <SelectItem value="desamparados">Desamparados</SelectItem>
                  <SelectItem value="puriscal">Puriscal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="district">Distrito</Label>
              <Select value={district} onValueChange={setDistrict}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione uno" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="carmen">Carmen</SelectItem>
                  <SelectItem value="merced">Merced</SelectItem>
                  <SelectItem value="hospital">Hospital</SelectItem>
                  <SelectItem value="catedral">Catedral</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="exactAddress">Dirección exacta</Label>
            <Textarea
              id="exactAddress"
              value={exactAddress}
              onChange={(e) => setExactAddress(e.target.value)}
              placeholder="Ej: 200m norte de la iglesia, edificio azul"
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
                value={geo ? `${geo[0].toFixed(6)}, ${geo[1].toFixed(6)}` : ""}
                placeholder="Seleccione en el mapa"
              />
            </div>
          </div>

          <div className="h-[300px] relative border border-gray-300 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => mapRef.current?.locateUser()}
              className="absolute top-2 right-2 z-10 bg-white shadow-md px-3 py-2 rounded-full text-sm flex items-center gap-2 hover:bg-gray-50"
            >
              <LocateFixed className="w-4 h-4 text-green-600" />
              Ubicarme
            </button>
            <MapSelector ref={mapRef} onLocationSelect={(lat, lng) => setGeo([lat, lng])} />
          </div>
        </CardContent>
      </Card>

      {/* Horario Comercial */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-800">Horario Comercial</CardTitle>
              <CardDescription>Configura días y horarios de atención</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-wrap gap-3 mb-4">
            <Button variant="outline" size="sm" onClick={() => setQuickSchedule("weekdays")}>
              Solo laborales
            </Button>
            <Button variant="outline" size="sm" onClick={() => setQuickSchedule("all")}>
              Todos los días
            </Button>
            <Button variant="outline" size="sm" onClick={() => setQuickSchedule("none")}>
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
                      ? "border-purple-200 bg-gradient-to-r from-purple-50 to-white"
                      : "border-gray-200 bg-gray-50",
                  )}
                >
                  <div className="absolute top-3 right-3">
                    <Switch checked={cfg.isOpen} onCheckedChange={() => toggleDay(key)} />
                  </div>
                  <h3 className={cfg.isOpen ? "text-purple-900 font-medium" : "text-gray-500"}>{dayName}</h3>
                  {cfg.isOpen ? (
                    <div className="mt-3 flex items-center gap-2">
                      <Input
                        type="time"
                        value={cfg.openTime}
                        onChange={(e) => updateSchedule(key, "openTime", e.target.value)}
                        className="text-sm"
                      />
                      <span className="text-gray-500">a</span>
                      <Input
                        type="time"
                        value={cfg.closeTime}
                        onChange={(e) => updateSchedule(key, "closeTime", e.target.value)}
                        className="text-sm"
                      />
                    </div>
                  ) : (
                    <p className="text-gray-500 mt-1">Cerrado</p>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Métodos de Pago y Servicios */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <CreditCard className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-800">Métodos de Pago y Servicios</CardTitle>
              <CardDescription>Selecciona métodos de pago y servicios adicionales</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div>
            <h4 className="font-medium text-gray-800 mb-3">Métodos de Pago</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { id: "cards", label: "Tarjetas" },
                { id: "cash", label: "Efectivo" },
                { id: "sinpe", label: "Sinpe Móvil" },
              ].map((method) => (
                <div
                  key={method.id}
                  className={cn(
                    "flex justify-between items-center p-4 rounded-xl border cursor-pointer transition-colors",
                    paymentMethods[method.id as keyof typeof paymentMethods]
                      ? "border-orange-200 bg-gradient-to-r from-orange-50 to-white"
                      : "border-gray-200 bg-gray-50 hover:bg-gray-100",
                  )}
                  onClick={() => togglePaymentMethod(method.id as keyof typeof paymentMethods)}
                >
                  <span className="font-medium">{method.label}</span>
                  <Switch
                    checked={paymentMethods[method.id as keyof typeof paymentMethods]}
                    onCheckedChange={() => togglePaymentMethod(method.id as keyof typeof paymentMethods)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-800 mb-3">Servicios Adicionales</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { id: "guidesPrinting", label: "Impresión de guías" },
                { id: "parking", label: "Parqueo disponible" },
                { id: "accessibility", label: "Accesibilidad" },
              ].map((service) => (
                <div
                  key={service.id}
                  className={cn(
                    "flex justify-between items-center p-4 rounded-xl border cursor-pointer transition-colors",
                    additionalServices[service.id as keyof typeof additionalServices]
                      ? "border-orange-200 bg-gradient-to-r from-orange-50 to-white"
                      : "border-gray-200 bg-gray-50 hover:bg-gray-100",
                  )}
                  onClick={() => toggleAdditionalService(service.id as keyof typeof additionalServices)}
                >
                  <span className="font-medium">{service.label}</span>
                  <Switch
                    checked={additionalServices[service.id as keyof typeof additionalServices]}
                    onCheckedChange={() => toggleAdditionalService(service.id as keyof typeof additionalServices)}
                  />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuración de Paquetería */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-indigo-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Package className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-800">Configuración de Paquetería</CardTitle>
              <CardDescription>Área de bodega y tamaños de paquetes aceptados</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="storageArea">Área disponible en bodega</Label>
            <div className="flex items-center gap-2">
              <Input
                id="storageArea"
                type="number"
                min="1"
                value={storageArea}
                onChange={(e) => setStorageArea(e.target.value)}
                className="max-w-[150px]"
                placeholder="200"
              />
              <span className="text-gray-600">m²</span>
            </div>
          </div>

          <div>
            <Label className="text-base font-medium">Tamaños de paquetes aceptados</Label>
            <p className="text-sm text-gray-600 mb-4">Selecciona los tamaños de paquetes que puede recibir tu PDE</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { id: "xs", label: "XS", description: "10-20cm" },
                { id: "s", label: "S", description: "20-30cm" },
                { id: "m", label: "M", description: "30-40cm" },
                { id: "l", label: "L", description: "40-50cm" },
                { id: "xl", label: "XL", description: "50-60cm" },
                { id: "xxl", label: "XXL", description: "60-80cm" },
                { id: "xxxl", label: "XXXL", description: "80-100cm" },
              ].map((size) => (
                <div
                  key={size.id}
                  className={cn(
                    "p-4 rounded-xl border cursor-pointer transition-colors text-center",
                    packageSizes[size.id as keyof typeof packageSizes]
                      ? "border-indigo-200 bg-gradient-to-r from-indigo-50 to-white"
                      : "border-gray-200 bg-gray-50 hover:bg-gray-100",
                  )}
                  onClick={() => togglePackageSize(size.id as keyof typeof packageSizes)}
                >
                  <div className="font-bold text-lg">{size.label}</div>
                  <div className="text-sm text-gray-600">{size.description}</div>
                  <div className="mt-2">
                    <Switch
                      checked={packageSizes[size.id as keyof typeof packageSizes]}
                      onCheckedChange={() => togglePackageSize(size.id as keyof typeof packageSizes)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botones de acción */}
      <div className="flex justify-between pt-6 border-t">
        <Button variant="outline" onClick={() => router.push("/configuration/company")} disabled={saving}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Atrás
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Enviando..." : "Enviar a Aprobación"}
          <Send className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
