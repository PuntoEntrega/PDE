"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/Components/ui/card"
import { Input } from "@/Components/ui/input"
import { Label } from "@/Components/ui/label"
import { Clock, MapPin, Building, CreditCard, Truck, Info, Calendar, Check, X } from "lucide-react"
import { Button } from "@/Components/ui/button"
import { Textarea } from "@/Components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/Components/ui/popover"
import { cn } from "../../../../lib/utils"
import { Switch } from "@/Components/ui/switch"
import MapSelector, { MapSelectorRef } from "@/Components/Mapa/MapSelector"
import { LocateFixed } from "lucide-react"

const PDEGeneralDataForm = () => {
  // Estado para el horario

  const [geo, setGeo] = useState<[number, number] | null>(null);
  const mapRef = useRef<MapSelectorRef>(null)


  const [schedule, setSchedule] = useState({
    monday: { isOpen: true, openTime: "08:00", closeTime: "18:00" },
    tuesday: { isOpen: true, openTime: "08:00", closeTime: "18:00" },
    wednesday: { isOpen: true, openTime: "08:00", closeTime: "18:00" },
    thursday: { isOpen: true, openTime: "08:00", closeTime: "18:00" },
    friday: { isOpen: true, openTime: "08:00", closeTime: "18:00" },
    saturday: { isOpen: true, openTime: "09:00", closeTime: "13:00" },
    sunday: { isOpen: false, openTime: "09:00", closeTime: "13:00" },
  })

  // Estado para los métodos de pago
  const [paymentMethods, setPaymentMethods] = useState({
    cards: false,
    cash: false,
    sinpe: false,
  })

  // Estado para servicios adicionales
  const [additionalServices, setAdditionalServices] = useState({
    guidesPrinting: false,
    parking: false,
    accessibility: false,
  })

  // Función para alternar días
  const toggleDay = (day: string) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        isOpen: !prev[day].isOpen,
      },
    }))
  }

  // Función para actualizar horarios
  const updateSchedule = (day: string, field: string, value: string) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }))
  }

  // Función para configuraciones rápidas
  const setQuickSchedule = (type: "weekdays" | "all" | "none") => {
    const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]

    if (type === "weekdays") {
      const newSchedule = { ...schedule }
      days.forEach((day, index) => {
        newSchedule[day] = {
          ...newSchedule[day],
          isOpen: index < 5, // Solo lunes a viernes
          openTime: index < 5 ? "08:00" : "09:00",
          closeTime: index < 5 ? "18:00" : "13:00",
        }
      })
      setSchedule(newSchedule)
    } else if (type === "all") {
      const newSchedule = { ...schedule }
      days.forEach((day) => {
        newSchedule[day] = { ...newSchedule[day], isOpen: true }
      })
      setSchedule(newSchedule)
    } else if (type === "none") {
      const newSchedule = { ...schedule }
      days.forEach((day) => {
        newSchedule[day] = { ...newSchedule[day], isOpen: false }
      })
      setSchedule(newSchedule)
    }
  }

  // Función para alternar métodos de pago
  const togglePaymentMethod = (method: string) => {
    setPaymentMethods((prev) => ({
      ...prev,
      [method]: !prev[method],
    }))
  }

  // Función para alternar servicios adicionales
  const toggleAdditionalService = (service: string) => {
    setAdditionalServices((prev) => ({
      ...prev,
      [service]: !prev[service],
    }))
  }

  return (
    <div className="space-y-6">
      {/* Información General */}
      <Card className="border border-gray-200 shadow-sm overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Info className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-800">Información General</CardTitle>
              <CardDescription>Datos básicos del Punto de Despacho Eléctrico.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1">
            <div className="space-y-2">
              <Label htmlFor="name" className="font-medium">
                Nombre Punto de Entrega
              </Label>
              <Input id="name" placeholder="Los pollos" className="border-gray-300" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="Teléfono" className="font-medium">
                Teléfono
              </Label>
              <Input id="Teléfono" placeholder="Teléfono o WhatsApp" className="border-gray-300" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="font-medium">
                Correo electrónico local comercial
              </Label>
              <Input id="email" type="email" placeholder="empresa@ejemplo.com" className="border-gray-300" />
            </div>
          </div>


        </CardContent>
      </Card>


      {/* Dirección del Punto de Entrega */}
      <Card className="border border-gray-200 shadow-sm overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MapPin className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-800">Dirección del Punto de Entrega</CardTitle>
              <CardDescription>Ubicación exacta del PDE.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="province" className="font-medium">
                Provincia
              </Label>
              <Select>
                <SelectTrigger className="border-gray-300">
                  <SelectValue placeholder="Seleccione una opción" />
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
              <Label htmlFor="canton" className="font-medium">
                Cantón
              </Label>
              <Select>
                <SelectTrigger className="border-gray-300">
                  <SelectValue placeholder="Seleccione una opción" />
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
              <Label htmlFor="district" className="font-medium">
                Distrito
              </Label>
              <Select>
                <SelectTrigger className="border-gray-300">
                  <SelectValue placeholder="Seleccione una opción" />
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
            <Label htmlFor="exactAddress" className="font-medium">
              Dirección exacta
            </Label>
            <Textarea
              id="exactAddress"
              placeholder="Diagonal a la iglesia comunal de Coronado, local esquinero"
              className="border-gray-300 min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="postalCode" className="font-medium">
                Código Postal
              </Label>
              <Input id="postalCode" placeholder="Ej: 20202" className="border-gray-300" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="geolocation" className="font-medium">
                Geolocalización
              </Label>
              <Input
                id="geolocation"
                readOnly
                value={geo ? `${geo[0].toFixed(6)}, ${geo[1].toFixed(6)}` : ""}
                className="border-gray-300"
              />

            </div>
          </div>

          {/* Mapa (placeholder para Google Maps) */}
          <div className="h-[300px] border border-gray-300 rounded-lg overflow-hidden relative">
            {/* Botón flotante 📍 */}
            <button
              type="button"
              onClick={() => mapRef.current?.locateUser()}
              className="absolute z-[1000] top-2 right-2 bg-white shadow px-2 py-1 rounded-full text-sm border hover:bg-blue-50 text-blue-600 flex items-center gap-1"
            >
              <LocateFixed className="w-4 h-4" />
              Ubicarme 📍
            </button>

            {/* Mapa */}
            <MapSelector
              ref={mapRef}
              onLocationSelect={(lat, lng) => {
                setGeo([lat, lng])
              }}
            />
          </div>


        </CardContent>
      </Card>

      {/* Horario Comercial - Componente mejorado */}
      <Card className="border border-gray-200 shadow-sm overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-800">Horario Comercial</CardTitle>
              <CardDescription>Configura los días y horarios de atención</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-wrap gap-3 mb-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setQuickSchedule("weekdays")}
              className="text-xs border-blue-200 hover:bg-blue-50 hover:border-blue-300 text-blue-700"
            >
              <Calendar className="h-3.5 w-3.5 mr-1" />
              Solo días laborales
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setQuickSchedule("all")}
              className="text-xs border-blue-200 hover:bg-blue-50 hover:border-blue-300 text-blue-700"
            >
              <Check className="h-3.5 w-3.5 mr-1" />
              Todos los días
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setQuickSchedule("none")}
              className="text-xs border-red-200 hover:bg-red-50 hover:border-red-300 text-red-600"
            >
              <X className="h-3.5 w-3.5 mr-1" />
              Limpiar todo
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { day: "Lunes", key: "monday" },
              { day: "Martes", key: "tuesday" },
              { day: "Miércoles", key: "wednesday" },
              { day: "Jueves", key: "thursday" },
              { day: "Viernes", key: "friday" },
              { day: "Sábado", key: "saturday" },
              { day: "Domingo", key: "sunday" },
            ].map(({ day, key }, index) => (
              <div
                key={key}
                className={cn(
                  "group relative rounded-xl border transition-all duration-200 hover:shadow-sm",
                  schedule[key].isOpen
                    ? "border-blue-200 bg-gradient-to-r from-blue-50 to-white"
                    : "border-gray-200 bg-gray-50",
                  index === 6 && "md:col-span-2",
                )}
              >
                <div className="absolute top-3 right-3">
                  <Switch
                    checked={schedule[key].isOpen}
                    onCheckedChange={() => toggleDay(key)}
                    className="data-[state=checked]:bg-blue-500"
                  />
                </div>

                <div className="p-4 pr-16">
                  <h3 className={cn("font-medium", schedule[key].isOpen ? "text-blue-900" : "text-gray-500")}>{day}</h3>

                  {schedule[key].isOpen ? (
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className={cn(
                                "w-[110px] justify-start text-left font-normal border-blue-200",
                                !schedule[key].openTime && "text-muted-foreground",
                              )}
                            >
                              <Clock className="mr-2 h-3.5 w-3.5 text-blue-500" />
                              {schedule[key].openTime || "Apertura"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <div className="p-3 space-y-3">
                              <div className="space-y-1">
                                <h4 className="text-sm font-medium">Hora de apertura</h4>
                                <p className="text-xs text-gray-500">Selecciona la hora de apertura para {day}</p>
                              </div>
                              <div className="grid grid-cols-4 gap-2">
                                {["07:00", "08:00", "09:00", "10:00"].map((time) => (
                                  <Button
                                    key={time}
                                    variant="outline"
                                    size="sm"
                                    className={cn(
                                      "text-xs",
                                      schedule[key].openTime === time && "bg-blue-100 border-blue-300 text-blue-700",
                                    )}
                                    onClick={() => updateSchedule(key, "openTime", time)}
                                  >
                                    {time}
                                  </Button>
                                ))}
                              </div>
                              <Input
                                type="time"
                                value={schedule[key].openTime}
                                onChange={(e) => updateSchedule(key, "openTime", e.target.value)}
                                className="w-full text-sm border-blue-200 focus:border-blue-400"
                              />
                            </div>
                          </PopoverContent>
                        </Popover>

                        <span className="text-gray-500">a</span>

                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className={cn(
                                "w-[110px] justify-start text-left font-normal border-blue-200",
                                !schedule[key].closeTime && "text-muted-foreground",
                              )}
                            >
                              <Clock className="mr-2 h-3.5 w-3.5 text-blue-500" />
                              {schedule[key].closeTime || "Cierre"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <div className="p-3 space-y-3">
                              <div className="space-y-1">
                                <h4 className="text-sm font-medium">Hora de cierre</h4>
                                <p className="text-xs text-gray-500">Selecciona la hora de cierre para {day}</p>
                              </div>
                              <div className="grid grid-cols-4 gap-2">
                                {["17:00", "18:00", "19:00", "20:00"].map((time) => (
                                  <Button
                                    key={time}
                                    variant="outline"
                                    size="sm"
                                    className={cn(
                                      "text-xs",
                                      schedule[key].closeTime === time && "bg-blue-100 border-blue-300 text-blue-700",
                                    )}
                                    onClick={() => updateSchedule(key, "closeTime", time)}
                                  >
                                    {time}
                                  </Button>
                                ))}
                              </div>
                              <Input
                                type="time"
                                value={schedule[key].closeTime}
                                onChange={(e) => updateSchedule(key, "closeTime", e.target.value)}
                                className="w-full text-sm border-blue-200 focus:border-blue-400"
                              />
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-1 text-sm text-gray-500">Cerrado</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Métodos de cobro */}
      <Card className="border border-gray-200 shadow-sm overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CreditCard className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-800">Tipo de Cobro</CardTitle>
              <CardDescription>Métodos de cobro aceptados en el PDE.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-3">
            {[
              { id: "cards", label: "Tarjetas", description: "Aceptar pagos con tarjetas de crédito y débito" },
              { id: "cash", label: "Efectivo", description: "Aceptar pagos en efectivo" },
              {
                id: "sinpe",
                label: "Sinpe Movil",
                description: "Recibir pago por medio de Sinpe Movil",
              },
            ].map((method) => (
              <div
                key={method.id}
                className={cn(
                  "flex items-center justify-between p-4 rounded-xl border transition-all duration-200 cursor-pointer hover:shadow-sm",
                  paymentMethods[method.id]
                    ? "border-blue-200 bg-gradient-to-r from-blue-50 to-white"
                    : "border-gray-200 bg-gray-50 hover:border-gray-300",
                )}
                onClick={() => togglePaymentMethod(method.id)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200",
                      paymentMethods[method.id] ? "bg-blue-500 border-2 border-blue-500" : "border-2 border-gray-300",
                    )}
                  >
                    {paymentMethods[method.id] && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <div>
                    <h3 className={cn("font-medium", paymentMethods[method.id] ? "text-blue-900" : "text-gray-700")}>
                      {method.label}
                    </h3>
                    <p className="text-sm text-gray-500">{method.description}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span
                    className={cn(
                      "px-3 py-1 text-xs font-medium rounded-full",
                      paymentMethods[method.id] ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500",
                    )}
                  >
                    {paymentMethods[method.id] ? "Sí" : "No"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Servicios adicionales */}
      <Card className="border border-gray-200 shadow-sm overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Truck className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-800">Servicios adicionales</CardTitle>
              <CardDescription>Servicios complementarios ofrecidos en el PDE.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-3">
            {[
              {
                id: "guidesPrinting",
                label: "Impresión de guías",
                description: "Ofrecer servicio de impresión de guías",
              },
              { id: "parking", label: "Parqueo", description: "Disponer de parqueo para clientes" },
              {
                id: "accessibility",
                label: "Accesibilidad para personas con discapacidad",
                description: "Contar con facilidades para personas con discapacidad",
              },
            ].map((service) => (
              <div
                key={service.id}
                className={cn(
                  "flex items-center justify-between p-4 rounded-xl border transition-all duration-200 cursor-pointer hover:shadow-sm",
                  additionalServices[service.id]
                    ? "border-blue-200 bg-gradient-to-r from-blue-50 to-white"
                    : "border-gray-200 bg-gray-50 hover:border-gray-300",
                )}
                onClick={() => toggleAdditionalService(service.id)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200",
                      additionalServices[service.id]
                        ? "bg-blue-500 border-2 border-blue-500"
                        : "border-2 border-gray-300",
                    )}
                  >
                    {additionalServices[service.id] && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <div>
                    <h3
                      className={cn("font-medium", additionalServices[service.id] ? "text-blue-900" : "text-gray-700")}
                    >
                      {service.label}
                    </h3>
                    <p className="text-sm text-gray-500">{service.description}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span
                    className={cn(
                      "px-3 py-1 text-xs font-medium rounded-full",
                      additionalServices[service.id] ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500",
                    )}
                  >
                    {additionalServices[service.id] ? "Sí" : "No"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PDEGeneralDataForm
