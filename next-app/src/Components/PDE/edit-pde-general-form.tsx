// v0 was here
"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { Button } from "@/Components/ui/button"
import { Input } from "@/Components/ui/input"
import { Label } from "@/Components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card"
import { Switch } from "@/Components/ui/switch"
import { useToast } from "@/Components/ui/use-toast"
import { Store, ArrowLeft, Save, Loader2, Mail, Phone, Clock3, CreditCard, CheckCircle, XCircle } from "lucide-react"
import { Sidebar } from "../Sidebar/Sidebar"
import { Separator } from "@/Components/ui/separator"
import { Badge } from "@/Components/ui/badge"
import { updatePDE } from "@/Services/pde/pde"

interface EditPDEGeneralFormProps {
  pde: any
  onCancel: () => void
  onSave: (updatedPDE: any) => void
}

export function EditPDEGeneralForm({ pde, onCancel, onSave }: EditPDEGeneralFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      business_email: pde.business_email || "",
      whatsapp_contact: pde.whatsapp_contact || "",
      services: {
        cash: pde.services_json?.cash || false,
        cards: pde.services_json?.cards || false,
        sinpe: pde.services_json?.sinpe || false,
        parking: pde.services_json?.parking || false,
        accessibility: pde.services_json?.accessibility || false,
        guidesPrinting: pde.services_json?.guidesPrinting || false,
      },
      schedule: {
        monday: {
          isOpen: pde.schedule_json?.monday?.isOpen || false,
          openTime: pde.schedule_json?.monday?.openTime || "08:00",
          closeTime: pde.schedule_json?.monday?.closeTime || "18:00",
        },
        tuesday: {
          isOpen: pde.schedule_json?.tuesday?.isOpen || false,
          openTime: pde.schedule_json?.tuesday?.openTime || "08:00",
          closeTime: pde.schedule_json?.tuesday?.closeTime || "18:00",
        },
        wednesday: {
          isOpen: pde.schedule_json?.wednesday?.isOpen || false,
          openTime: pde.schedule_json?.wednesday?.openTime || "08:00",
          closeTime: pde.schedule_json?.wednesday?.closeTime || "18:00",
        },
        thursday: {
          isOpen: pde.schedule_json?.thursday?.isOpen || false,
          openTime: pde.schedule_json?.thursday?.openTime || "08:00",
          closeTime: pde.schedule_json?.thursday?.closeTime || "18:00",
        },
        friday: {
          isOpen: pde.schedule_json?.friday?.isOpen || false,
          openTime: pde.schedule_json?.friday?.openTime || "08:00",
          closeTime: pde.schedule_json?.friday?.closeTime || "18:00",
        },
        saturday: {
          isOpen: pde.schedule_json?.saturday?.isOpen || false,
          openTime: pde.schedule_json?.saturday?.openTime || "09:00",
          closeTime: pde.schedule_json?.saturday?.closeTime || "13:00",
        },
        sunday: {
          isOpen: pde.schedule_json?.sunday?.isOpen || false,
          openTime: pde.schedule_json?.sunday?.openTime || "09:00",
          closeTime: pde.schedule_json?.sunday?.closeTime || "13:00",
        },
      },
    },
  })

  const watchedServices = watch("services")
  const watchedSchedule = watch("schedule")

  const onSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      // Preparar los datos para el patch
      const updateData = {
        business_email: data.business_email,
        whatsapp_contact: data.whatsapp_contact,
        services_json: data.services,
        schedule_json: data.schedule,
      }

      const updatedPDE = await updatePDE(pde.id, updateData)

      toast({
        title: "Punto de entrega actualizado",
        description: "Los cambios han sido guardados correctamente.",
      })

      onSave(updatedPDE)
    } catch (error) {
      console.error("Error updating PDE:", error)
      toast({
        title: "Error al actualizar",
        description: "No se pudieron guardar los cambios. Intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const days: { key: DayKey; name: string }[] = [
    { key: "monday", name: "Lunes" },
    { key: "tuesday", name: "Martes" },
    { key: "wednesday", name: "Miércoles" },
    { key: "thursday", name: "Jueves" },
    { key: "friday", name: "Viernes" },
    { key: "saturday", name: "Sábado" },
    { key: "sunday", name: "Domingo" },
  ]

  const services: { key: ServiceKey; name: string; icon: any }[] = [
    { key: "cash", name: "Efectivo", icon: "💵" },
    { key: "cards", name: "Tarjetas", icon: "💳" },
    { key: "sinpe", name: "SINPE Móvil", icon: "📱" },
    { key: "parking", name: "Parqueo", icon: "🚗" },
    { key: "accessibility", name: "Accesibilidad", icon: "♿" },
    { key: "guidesPrinting", name: "Impresión de guías", icon: "🖨️" },
  ]

  type ServiceKey = "cash" | "cards" | "sinpe" | "parking" | "accessibility" | "guidesPrinting"
  type DayKey = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"


  return (
    <Sidebar>
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <Card className="shadow-xl border-0 rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-br from-blue-50 via-slate-50 to-white p-8 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-xl shadow-sm">
                  <Store className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-bold text-gray-800">Editar Datos Generales</CardTitle>
                  <p className="text-gray-600 mt-1">
                    Actualiza la información de contacto, servicios y horarios del punto de entrega.
                  </p>
                </div>
              </div>
              <Button variant="outline" onClick={onCancel} className="border-gray-300 hover:bg-gray-100">
                <ArrowLeft className="mr-2 h-4 w-4" /> Cancelar
              </Button>
            </div>
          </CardHeader>
        </Card>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Información de Contacto */}
          <Card className="shadow-lg border border-gray-200 rounded-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-100 p-5 border-b">
              <div className="flex items-center">
                <div className="p-2.5 bg-blue-100 rounded-lg mr-3 shadow-sm">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-lg font-semibold text-gray-800">Información de Contacto</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="business_email"
                    className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                  >
                    <Mail className="h-4 w-4 text-blue-600" />
                    Email de Contacto
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="business_email"
                    type="email"
                    {...register("business_email", {
                      required: "El email es requerido",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Email inválido",
                      },
                    })}
                    className={`h-11 transition-all duration-200 ${errors.business_email
                      ? "border-red-500 focus-visible:ring-red-500 bg-red-50"
                      : "border-gray-300 focus-visible:ring-blue-500 focus-visible:border-blue-500 bg-white"
                      }`}
                    placeholder="contacto@empresa.com"
                  />
                  {errors.business_email && <p className="text-red-600 text-xs">{typeof errors.business_email?.message === "string" && (
                    <p className="text-red-600 text-xs">{errors.business_email.message}</p>
                  )}</p>}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="whatsapp_contact"
                    className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                  >
                    <Phone className="h-4 w-4 text-blue-600" />
                    WhatsApp de Contacto
                  </Label>
                  <Input
                    id="whatsapp_contact"
                    type="tel"
                    {...register("whatsapp_contact")}
                    className="h-11 transition-all duration-200 border-gray-300 focus-visible:ring-blue-500 focus-visible:border-blue-500 bg-white"
                    placeholder="8888-9999"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Servicios Disponibles */}
          <Card className="shadow-lg border border-gray-200 rounded-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-100 p-5 border-b">
              <div className="flex items-center">
                <div className="p-2.5 bg-blue-100 rounded-lg mr-3 shadow-sm">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-lg font-semibold text-gray-800">Servicios Disponibles</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service) => (
                  <Controller
                    key={service.key}
                    name={`services.${service.key}`}
                    control={control}
                    render={({ field }) => (
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{service.icon}</span>
                          <div>
                            <Label htmlFor={service.key} className="font-medium text-gray-800 cursor-pointer">
                              {service.name}
                            </Label>
                            <div className="text-xs text-gray-500">{field.value ? "Disponible" : "No disponible"}</div>
                          </div>
                        </div>
                        <Switch id={service.key} checked={field.value} onCheckedChange={field.onChange} />
                      </div>
                    )}
                  />
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Resumen de Servicios</h4>
                <div className="flex flex-wrap gap-2">
                  {services.map(
                    (service) =>
                      watchedServices[service.key] && (
                        <Badge
                          key={service.key}
                          variant="outline"
                          className="bg-green-100 text-green-700 border-green-300"
                        >
                          <CheckCircle className="mr-1 h-3 w-3" />
                          {service.name}
                        </Badge>
                      ),
                  )}
                  {services.filter((service) => watchedServices[service.key]).length === 0 && (
                    <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300">
                      <XCircle className="mr-1 h-3 w-3" />
                      No hay servicios seleccionados
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Horario de Atención */}
          <Card className="shadow-lg border border-gray-200 rounded-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-100 p-5 border-b">
              <div className="flex items-center">
                <div className="p-2.5 bg-blue-100 rounded-lg mr-3 shadow-sm">
                  <Clock3 className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-lg font-semibold text-gray-800">Horario de Atención</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {days.map((day) => (
                <div key={day.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Controller
                      name={`schedule.${day.key}.isOpen`}
                      control={control}
                      render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
                    />
                    <Label className="font-medium text-gray-800 min-w-[80px]">{day.name}</Label>
                  </div>

                  {watchedSchedule[day.key]?.isOpen && (
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <Label className="text-sm text-gray-600">Abre:</Label>
                        <Input type="time" {...register(`schedule.${day.key}.openTime`)} className="w-24 h-8 text-sm" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Label className="text-sm text-gray-600">Cierra:</Label>
                        <Input
                          type="time"
                          {...register(`schedule.${day.key}.closeTime`)}
                          className="w-24 h-8 text-sm"
                        />
                      </div>
                    </div>
                  )}

                  {!watchedSchedule[day.key]?.isOpen && (
                    <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300">
                      Cerrado
                    </Badge>
                  )}
                </div>
              ))}

              <Separator className="my-4" />

              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Resumen de Horarios</h4>
                <div className="space-y-1 text-sm">
                  {days.map((day) => (
                    <div key={day.key} className="flex justify-between">
                      <span className="text-gray-700">{day.name}:</span>
                      <span className={watchedSchedule[day.key]?.isOpen ? "text-green-600" : "text-red-600"}>
                        {watchedSchedule[day.key]?.isOpen
                          ? `${watchedSchedule[day.key].openTime} - ${watchedSchedule[day.key].closeTime}`
                          : "Cerrado"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botón de guardado único */}
          <Card className="shadow-lg border border-gray-200 rounded-xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="border-gray-300 hover:bg-gray-100"
                  disabled={isSubmitting}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" /> Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !isDirty}
                  className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 min-w-[200px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Guardando Cambios...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Guardar Cambios
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </Sidebar>
  )
}
