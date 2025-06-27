"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/context/UserContext"
import { useStepProgress } from "@/hooks/useStepProgress"
import { useToast } from "@/Components/ui/use-toast"
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/Components/ui/card"
import { Input } from "@/Components/ui/input"
import { Label } from "@/Components/ui/label"
import { Textarea } from "@/Components/ui/textarea"
import { Switch } from "@/Components/ui/switch"
import { Button } from "@/Components/ui/button"
import {
    ArrowLeft, Send, Info, MapPin, LocateFixed, Clock, Package, CreditCard,
} from "lucide-react"
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

type DayKey = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'

type Schedule = {
    [K in DayKey]: {
        isOpen: boolean
        openTime: string
        closeTime: string
    }
}


export default function PDECreator() {
    const router = useRouter()
    const { user } = useUser()
    const { goToStep } = useStepProgress()
    const { toast } = useToast()
    const mapRef = useRef<MapSelectorRef>(null)

    /* ─────────────────────────────  Datos básicos  ──────────────────────────── */
    const [companies, setCompanies] = useState<CompanyMini[]>([])
    const [companyId, setCompanyId] = useState<string>("")
    const [name, setName] = useState("")
    const [whatsapp, setWhatsapp] = useState("")
    const [email, setEmail] = useState("")

    /* ────────────────────────────  Ubicación  ──────────────────────────────── */
    const [exactAddress, setExactAddress] = useState("")
    const [detail, setDetail] = useState("")
    const [geo, setGeo] = useState<[number, number] | null>(null)
    const [locationJson, setLocationJson] = useState<any>(null)

    /* ─────────────────────────────  Horario  ───────────────────────────────── */
    const [schedule, setSchedule] = useState<Schedule>({
        monday: { isOpen: true, openTime: "05:00", closeTime: "18:00" },
        tuesday: { isOpen: true, openTime: "05:00", closeTime: "18:00" },
        wednesday: { isOpen: true, openTime: "05:00", closeTime: "18:00" },
        thursday: { isOpen: true, openTime: "05:00", closeTime: "18:00" },
        friday: { isOpen: true, openTime: "05:00", closeTime: "18:00" },
        saturday: { isOpen: true, openTime: "08:00", closeTime: "15:00" },
        sunday: { isOpen: false, openTime: "08:00", closeTime: "15:00" },
    })

    /* ────────────────────  Métodos de pago / servicios  ────────────────────── */
    const [paymentMethods, setPaymentMethods] = useState({ cards: false, cash: false, sinpe: false })
    const [additionalServices, setAdditionalServices] = useState({ guidesPrinting: false, parking: false, accessibility: false })

    /* ─────────────────────────────  Paquetería  ────────────────────────────── */
    const [storageArea, setStorageArea] = useState("200")
    const [packageSizes, setPackageSizes] = useState({
        xs: true, s: true, m: true, l: true,
        xl: false, xxl: false, xxxl: false,
    })

    /* ───────────────────────────  Cargar empresas  ─────────────────────────── */
    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("/api/companies/companies_relationed")
                if (!res.ok) throw new Error()
                const list = await res.json()
                setCompanies(list)
                if (list.length === 1) setCompanyId(list[0].id)
            } catch {
                toast({ title: "Error", description: "No fue posible cargar las empresas", variant: "destructive" })
            }
        })()
    }, [])

    /* ─────────────────────────────  Helpers  ───────────────────────────────── */
    const toggleDay = (day: DayKey) =>
        setSchedule(prev => ({ ...prev, [day]: { ...prev[day], isOpen: !prev[day].isOpen } }))

    const updateSchedule = (day: DayKey, f: 'openTime' | 'closeTime', v: string) =>
        setSchedule(prev => ({ ...prev, [day]: { ...prev[day], [f]: v } }))

    const togglePaymentMethod = (m: keyof typeof paymentMethods) =>
        setPaymentMethods(prev => ({ ...prev, [m]: !prev[m] }))

    const toggleAdditionalService = (s: keyof typeof additionalServices) =>
        setAdditionalServices(prev => ({ ...prev, [s]: !prev[s] }))

    const togglePackageSize = (s: keyof typeof packageSizes) =>
        setPackageSizes(prev => ({ ...prev, [s]: !prev[s] }))

    const quickSchedule = (type: "weekdays" | "all" | "none") => {
        const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const
        setSchedule(prev =>
            Object.fromEntries(days.map((d, i) => [
                d,
                type === "none"
                    ? { ...prev[d], isOpen: false }
                    : type === "all"
                        ? { ...prev[d], isOpen: true }
                        : { ...prev[d], isOpen: i < 5, openTime: i < 5 ? "08:00" : prev[d].openTime, closeTime: i < 5 ? "18:00" : prev[d].closeTime },
            ])) as typeof schedule)
    }

    /* ────────────────────────────  Validación  ─────────────────────────────── */
    const validateForm = () => {
        if (!companyId) return "Seleccione una empresa"
        if (!name) return "Ingrese el nombre del PDE"
        if (!whatsapp) return "Ingrese el teléfono/WhatsApp"
        if (!email) return "Ingrese el correo electrónico"
        if (!detail.trim()) return "Ingrese un detalle de referencia"
        if (!geo) return "Seleccione la ubicación en el mapa"
        if (!locationJson) return "Espere a que se determine la ubicación"
        if (!storageArea || isNaN(Number(storageArea)) || Number(storageArea) <= 0) return "Ingrese un área de bodega válida"
        if (!Object.values(packageSizes).some(Boolean)) return "Seleccione al menos un tamaño de paquete"
        return null
    }

    /* ───────────────────────────  Guardar PDE  ─────────────────────────────── */
    const [saving, setSaving] = useState(false)

    const handleSave = async () => {
        const error = validateForm()
        if (error) {
            toast({ title: "Error de validación", description: error, variant: "destructive" })
            return
        }

        setSaving(true)
        try {
            const payload = {
                company_id: companyId,
                name,
                whatsapp_contact: whatsapp,
                business_email: email,
                exact_address: detail,
                postal_code: locationJson.postal_code,
                latitude: geo![0],
                longitude: geo![1],
                location_json: locationJson,
                schedule_json: schedule,
                services_json: { ...paymentMethods, ...additionalServices },
                storage_area_m2: parseFloat(storageArea),
                accepts_xs: packageSizes.xs, accepts_s: packageSizes.s, accepts_m: packageSizes.m,
                accepts_l: packageSizes.l, accepts_xl: packageSizes.xl,
                accepts_xxl: packageSizes.xxl, accepts_xxxl: packageSizes.xxxl,
            }

            const pdeRes = await fetch("/api/pdes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })
            if (!pdeRes.ok) throw new Error("Error al crear el PDE")

            const { id: deliveryPointId } = await pdeRes.json()

            await fetch(`/api/pdes/${deliveryPointId}/submit-review`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ changed_by_id: user?.sub }),
            })

            toast({ title: "¡Éxito!", description: "PDE creado y enviado a revisión." })
            await goToStep(3)
            router.push("/configuration/status-info")
        } catch (err: any) {
            toast({ title: "Error", description: err.message || "Algo salió mal", variant: "destructive" })
        } finally { setSaving(false) }
    }

    const handleLocate = async () => {
        const pos = await mapRef.current?.locateUser()
        if (pos) mapRef.current?.panTo(pos)   // ahora sí existe el mapa seguro
    }

    /* ───────────────────────────────  UI  ──────────────────────────────────── */
    return (
        <div className="space-y-6">
            {/* ───────── Información General ───────── */}
            <Card className="border-gray-200 shadow-sm">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg"><Info className="h-5 w-5 text-blue-600" /></div>
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
                            <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Los Pollos Hermanos" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="whatsapp">Teléfono / WhatsApp</Label>
                            <Input id="whatsapp" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="8888-8888" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Correo comercial</Label>
                            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="empresa@ejemplo.com" />
                        </div>
                        <div className="space-y-2">
                            <Label>Empresa asociada</Label>
                            <CompanyVisualSelector value={companyId} onChange={setCompanyId} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ───────── Dirección y Geolocalización ───────── */}
            <Card className="border-gray-200 shadow-sm">
                <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg"><MapPin className="h-5 w-5 text-green-600" /></div>
                        <div>
                            <CardTitle className="text-lg font-semibold text-gray-800">Dirección y Geolocalización</CardTitle>
                            <CardDescription>Ubicación exacta del PDE</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    {/* preview textual */}
                    {locationJson?.display_name && (
                        <div className="text-sm text-gray-700 bg-gray-50 border rounded-md px-4 py-2">
                            Ubicación detectada:&nbsp;
                            <strong>{locationJson.display_name}</strong>
                            {locationJson.postal_code && (
                                <> &mdash; CP&nbsp;<strong>{locationJson.postal_code}</strong></>
                            )}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="exactAddress">Dirección exacta / Detalle</Label>
                        <Textarea
                            id="exactAddress"
                            value={detail}
                            onChange={(e) => setDetail(e.target.value)}
                            placeholder="Color de la casa, portón gris, etc."
                        />
                    </div>

                    <div className="h-[300px] relative border border-gray-300 rounded-lg overflow-hidden">
                        {/* Map first */}
                        <MapSelector
                            ref={mapRef}
                            onLocationSelect={(loc) => {
                                // loc.lat, loc.lon, loc.display_name ...
                                setGeo([+loc.lat, +loc.lon])
                                setLocationJson(loc)
                            }}
                        />

                        <button
                            type="button"
                            onClick={() =>
                                mapRef.current?.locateUser().then(pos =>
                                    pos && mapRef.current?.panTo(pos)
                                )
                            }
                            className="absolute bottom-5 right-1 z-[800] bg-white shadow-md
             rounded-full text-sm px-3 py-2 flex items-center gap-2
             hover:bg-gray-50">
                            <LocateFixed className="w-5 h-5 text-green-600" />
                            Ubicarme
                        </button>

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
                        <Button variant="outline" size="sm" onClick={() => quickSchedule("weekdays")}>
                            Solo laborales
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => quickSchedule("all")}>
                            Todos los días
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => quickSchedule("none")}>
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
                                        <Switch checked={cfg.isOpen} onCheckedChange={() => toggleDay(key as DayKey)} />
                                    </div>
                                    <h3 className={cfg.isOpen ? "text-purple-900 font-medium" : "text-gray-500"}>{dayName}</h3>
                                    {cfg.isOpen ? (
                                        <div className="mt-3 flex items-center gap-2">
                                            <Input
                                                type="time"
                                                value={cfg.openTime}
                                                onChange={(e) => updateSchedule(key as DayKey, "openTime", e.target.value)}
                                                className="text-sm"
                                            />
                                            <span className="text-gray-500">a</span>
                                            <Input
                                                type="time"
                                                value={cfg.closeTime}
                                                onChange={(e) => updateSchedule(key as DayKey, "closeTime", e.target.value)}
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

            {/* ───────── Botones de acción ───────── */}
            <div className="flex justify-between pt-6 border-t">
                <Button variant="outline" onClick={() => router.push("/configuration/company")} disabled={saving}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Atrás
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                    {saving ? "Enviando…" : "Enviar a Aprobación"}
                    <Send className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}
