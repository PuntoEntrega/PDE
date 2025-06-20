"use client"
// src/Components/PDE/PDECreator.tsx

import React, { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/context/UserContext"
import { useStepProgress } from "@/hooks/useStepProgress"
import { useToast } from "@/Components/ui/use-toast"
import {
  Card, CardHeader, CardContent, CardTitle, CardDescription
} from "@/Components/ui/card"
import { Input } from "@/Components/ui/input"
import { Textarea } from "@/Components/ui/textarea"
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem
} from "@/Components/ui/select"
import { Button } from "@/Components/ui/button"
import { Checkbox } from "@/Components/ui/checkbox"
import {
  ArrowLeft, Send, Info, MapPin, Clock, Package
} from "lucide-react"
import CompanyVisualSelector from "@/Components/CompanyVisualSelector"
import MapSelector, { MapSelectorRef } from "@/Components/Mapa/MapSelector.client"

interface CompanyMini {
  id: string
  trade_name: string
  logo_url: string | null
  company_type: string
  active: boolean
}

export default function PDECreator() {
  const router         = useRouter()
  const { user }       = useUser()
  const { goToStep }   = useStepProgress()
  const { toast }      = useToast()

  const mapRef         = useRef<MapSelectorRef>(null)

  // tabs
  const [tab, setTab]  = useState<"general"|"parcel">("general")
  // loading empresas
  const [companies, setCompanies] = useState<CompanyMini[]>([])

  // → Datos generales
  const [companyId, setCompanyId]       = useState<string>("")
  const [name, setName]                 = useState("")
  const [whatsapp, setWhatsapp]         = useState("")
  const [email, setEmail]               = useState("")
  const [province, setProvince]         = useState("")
  const [canton, setCanton]             = useState("")
  const [district, setDistrict]         = useState("")
  const [exactAddress, setExactAddress] = useState("")
  const [postalCode, setPostalCode]     = useState("")
  const [geo, setGeo]                   = useState<[number,number] | null>(null)

  // → Horario (siempre lo rellenamos por defecto)
  const defaultSchedule = {
    monday:   { isOpen:true, openTime:"08:00", closeTime:"18:00" },
    tuesday:  { isOpen:true, openTime:"08:00", closeTime:"18:00" },
    wednesday:{ isOpen:true, openTime:"08:00", closeTime:"18:00" },
    thursday: { isOpen:true, openTime:"08:00", closeTime:"18:00" },
    friday:   { isOpen:true, openTime:"08:00", closeTime:"18:00" },
    saturday: { isOpen:true, openTime:"09:00", closeTime:"13:00" },
    sunday:   { isOpen:false,openTime:"09:00", closeTime:"13:00" },
  } as const
  const [schedule, setSchedule] = useState(defaultSchedule)

  // → Pago / servicios
  const [cards, setCards]           = useState(false)
  const [cash, setCash]             = useState(false)
  const [sinpe, setSinpe]           = useState(false)
  const [guidesPrinting, setGuides] = useState(false)
  const [parking, setParking]       = useState(false)
  const [accessibility, setAccess]  = useState(false)

  // → Paquetería
  const [area, setArea] = useState("200")
  const [sizes, setSizes] = useState({
    xs:true, s:true, m:true, l:true, xl:false, xxl:false, xxxl:false
  })

  const [saving, setSaving] = useState(false)

  // fetch empresas
  useEffect(() => {
    fetch("/api/companies/by-user")
      .then(r => r.json())
      .then(setCompanies)
      .catch(() => {
        toast({ title:"Error", description:"No cargaron las empresas.", variant:"destructive" })
      })
  }, [toast])

  // validaciones
  function validateGeneral() {
    if (!companyId)   return "Elija una empresa."
    if (!name)        return "Ingrese nombre del PDE."
    if (!whatsapp)    return "Ingrese teléfono/WhatsApp."
    if (!email)       return "Ingrese correo válido."
    if (!province)    return "Seleccione provincia."
    if (!canton)      return "Seleccione cantón."
    if (!district)    return "Seleccione distrito."
    if (!exactAddress) return "Ingrese dirección exacta."
    if (!postalCode)  return "Ingrese código postal."
    if (!geo)         return "Seleccione ubicación en el mapa."
    return null
  }
  function validateParcel() {
    if (!area || isNaN(Number(area)) || Number(area)<=0) return "Área de bodega inválida."
    if (!Object.values(sizes).some(Boolean))            return "Seleccione al menos un tamaño."
    return null
  }

  const handleSave = async() => {
    // 1) general
    const gErr = validateGeneral()
    if (gErr) {
      toast({ title:"Datos Generales", description:gErr, variant:"destructive" })
      setTab("general")
      return
    }
    // 2) parcel
    const pErr = validateParcel()
    if (pErr) {
      toast({ title:"Paquetería", description:pErr, variant:"destructive" })
      setTab("parcel")
      return
    }

    setSaving(true)
    try {
      // payload
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
        services_json: { cards, cash, sinpe, guidesPrinting, parking, accessibility },
        storage_area_m2: parseFloat(area),
        accepts_xs: sizes.xs,
        accepts_s: sizes.s,
        accepts_m: sizes.m,
        accepts_l: sizes.l,
        accepts_xl: sizes.xl,
        accepts_xxl: sizes.xxl,
        accepts_xxxl: sizes.xxxl,
      }

      // 1) POST PDE
      const pdeRes = await fetch("/api/pdes", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(payload)
      })
      if (!pdeRes.ok) throw new Error("Falló guardar PDE")

      // 2) PATCH revisión
      await fetch(`/api/users/${user?.sub}/submit-review`, {
        method:"PATCH",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          changed_by_id: user?.sub,
          reason:"Configuración completada, solicita revisión."
        })
      })

      toast({ title:"¡Éxito!", description:"PDE creado y enviado a revisión.", variant:"success" })
      await goToStep(3)
      router.push("/configuration/status-info")

    } catch(err:any) {
      toast({ title:"Error", description:err.message||"Algo salió mal.", variant:"destructive" })
    } finally {
      setSaving(false)
    }
  }

  // pequeños helpers
  const toggleSize = (k: keyof typeof sizes) => setSizes(s=>({ ...s, [k]:!s[k] }))
  const toggleDay  = (d:keyof typeof schedule) =>
    setSchedule(s=>({ ...s, [d]:{ ...s[d], isOpen:!s[d].isOpen }}))

  return (
    <div className="space-y-6">

      {/* Tabs */}
      <nav className="flex border-b">
        {["general","parcel"].map(t => (
          <button
            key={t}
            onClick={()=>setTab(t as any)}
            className={`px-4 py-2 font-medium border-b-2 ${
              tab===t
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t==="general" ? "Datos Generales" : "Paquetería"}
          </button>
        ))}
      </nav>

      {/* General */}
      {tab==="general" && (
        <div className="space-y-6">
          {/* Datos Básicos */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-blue-50 to-white pb-4">
              <div className="flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-600" />
                <CardTitle>Información General</CardTitle>
              </div>
              <CardDescription>Datos básicos del PDE</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm">Empresa</label>
                <CompanyVisualSelector
                  value={companyId}
                  onChange={setCompanyId}
                  companies={companies}
                />
              </div>
              <div>
                <label className="block text-sm">Nombre</label>
                <Input value={name} onChange={e=>setName(e.target.value)} placeholder="Ej: Mi PDE" />
              </div>
              <div>
                <label className="block text-sm">WhatsApp</label>
                <Input value={whatsapp} onChange={e=>setWhatsapp(e.target.value)} placeholder="8888-8888" />
              </div>
              <div>
                <label className="block text-sm">Correo</label>
                <Input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="pde@e.com" />
              </div>
            </CardContent>
          </Card>

          {/* Dirección */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-blue-50 to-white pb-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                <CardTitle>Dirección & Geo</CardTitle>
              </div>
              <CardDescription>Ubicación exacta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm">Provincia</label>
                  <Select value={province} onValueChange={setProvince}>
                    <SelectTrigger><SelectValue placeholder="–" /></SelectTrigger>
                    <SelectContent>
                      {["san_jose","alajuela","cartago","heredia","guanacaste","puntarenas","limon"].map(p=>(
                        <SelectItem key={p} value={p}>{p.replace("_"," ")}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm">Cantón</label>
                  <Select value={canton} onValueChange={setCanton}>
                    <SelectTrigger><SelectValue placeholder="–" /></SelectTrigger>
                    <SelectContent>
                      {["central","escazu","desamparados","puriscal"].map(c=>(
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm">Distrito</label>
                  <Select value={district} onValueChange={setDistrict}>
                    <SelectTrigger><SelectValue placeholder="–" /></SelectTrigger>
                    <SelectContent>
                      {["carmen","merced","hospital","catedral"].map(d=>(
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="block text-sm">Dirección exacta</label>
                <Textarea
                  value={exactAddress}
                  onChange={e=>setExactAddress(e.target.value)}
                  placeholder="Ej: 200m norte de…"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm">Código postal</label>
                  <Input value={postalCode} onChange={e=>setPostalCode(e.target.value)} placeholder="20202" />
                </div>
                <div>
                  <label className="block text-sm">Geo (lat,lng)</label>
                  <Input
                    readOnly
                    value={geo ? `${geo[0].toFixed(6)}, ${geo[1].toFixed(6)}` : ""}
                    placeholder="Clic en el mapa"
                  />
                </div>
              </div>
              <div className="h-60 border rounded overflow-hidden relative">
                <MapSelector ref={mapRef} onLocationSelect={(lat,lng)=>setGeo([lat,lng])}/>
              </div>
            </CardContent>
          </Card>

          {/* Horario */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-blue-50 to-white pb-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <CardTitle>Horario de Atención</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(schedule).map(([d, cfg]) => (
                <div key={d} className="p-3 border rounded cursor-pointer">
                  <div className="flex justify-between">
                    <span className={cfg.isOpen?"text-blue-700":"text-gray-500"}>
                      {d.charAt(0).toUpperCase()+d.slice(1)}
                    </span>
                    <Checkbox
                      checked={cfg.isOpen}
                      onCheckedChange={()=>toggleDay(d as any)}
                    />
                  </div>
                  {cfg.isOpen && (
                    <div className="flex gap-2 mt-2 text-sm">
                      <Input
                        type="time"
                        value={cfg.openTime}
                        onChange={e=>setSchedule(s=>({ ...s, [d]:{...s[d as any], openTime:e.target.value} }))}
                      />
                      <span>a</span>
                      <Input
                        type="time"
                        value={cfg.closeTime}
                        onChange={e=>setSchedule(s=>({ ...s, [d]:{...s[d as any], closeTime:e.target.value} }))}
                      />
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Parcel */}
      {tab==="parcel" && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="bg-gradient-to-r from-orange-50 to-white pb-4">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-orange-600" />
                <CardTitle>Paquetería</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <label className="block text-sm">Área (m²)</label>
                <Input
                  type="number"
                  min="1"
                  value={area}
                  onChange={e=>setArea(e.target.value)}
                  className="max-w-[120px]"
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(sizes).map(([k,v])=>(
                  <div
                    key={k}
                    className={`p-3 border rounded cursor-pointer ${
                      v? "bg-orange-50 border-orange-300":"bg-gray-50 border-gray-200"
                    }`}
                    onClick={()=>toggleSize(k as any)}
                  >
                    <span className="font-medium">{k.toUpperCase()}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Botones */}
      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={()=>router.push("/configuration/company")} disabled={saving}>
          <ArrowLeft className="mr-2 h-4 w-4"/> Atrás
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving? "Enviando..." : "Enviar a Aprobación"}
          <Send className="ml-2 h-4 w-4"/>
        </Button>
      </div>
    </div>
  )
}
