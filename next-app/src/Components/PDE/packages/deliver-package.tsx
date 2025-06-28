"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card"
import { Button } from "@/Components/ui/button"
import { Input } from "@/Components/ui/input"
import { Badge } from "@/Components/ui/badge"
import {
    PackageCheck,
    ArrowLeft,
    Search,
    User,
    Building,
    Truck,
    Calendar,
    DollarSign,
    CheckCircle,
    QrCode,
    Camera,
    CreditCard,
    FileSignature,
    Eye,
    Key,
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/Components/ui/use-toast"
import { Toaster } from "@/Components/ui/toaster"
import Image from "next/image"

interface DeliveryTask {
    id: string
    type: "photo_id" | "signature" | "payment" | "secret_word"
    title: string
    description: string
    required: boolean
    completed: boolean
    data?: any
}

export function EntregarPaqueteClient() {
    const [searchMode, setSearchMode] = useState<"scan" | "manual">("scan")
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedPackage, setSelectedPackage] = useState<any>(null)
    const [isScanning, setIsScanning] = useState(false)
    const [deliveryTasks, setDeliveryTasks] = useState<DeliveryTask[]>([])
    const { toast } = useToast()

    // Mock data - en producción vendría de la API
    const mockPackage = {
        id: "pkg_000001",
        packageNumber: "000001",
        recipientName: "Esteban Artavia Rodríguez",
        recipientPhone: "8888-1234",
        recipientId: "1-2345-6789",
        merchant: "Tiendamia",
        courier: "Moovin",
        courierLogo: "/placeholder.svg?width=30&height=30",
        chargeAmount: 3500,
        receivedAt: "2024-01-15",
        additionalInfo: "Entregar en horario de oficina",
        deliveryTasks: [
            {
                id: "task_1",
                type: "photo_id" as const,
                title: "Foto de Cédula",
                description: "Tomar foto de la cédula del destinatario",
                required: true,
                completed: false,
            },
            {
                id: "task_2",
                type: "signature" as const,
                title: "Firma Digital",
                description: "Obtener firma del destinatario",
                required: true,
                completed: false,
            },
            {
                id: "task_3",
                type: "payment" as const,
                title: "Cobro del Producto",
                description: "Cobrar ₡3,500 al destinatario",
                required: true,
                completed: false,
            },
            {
                id: "task_4",
                type: "secret_word" as const,
                title: "Palabra Secreta",
                description: "Verificar palabra secreta: 'AZUL123'",
                required: false,
                completed: false,
            },
        ],
    }

    const handleScan = () => {
        setIsScanning(true)
        setTimeout(() => {
            setIsScanning(false)
            setSelectedPackage(mockPackage)
            setDeliveryTasks(mockPackage.deliveryTasks)
            toast({
                title: "Paquete encontrado",
                description: `Paquete ${mockPackage.packageNumber} cargado exitosamente.`,
                variant: "default",
            })
        }, 2000)
    }

    const handleManualSearch = () => {
        if (!searchTerm.trim()) return

        // Simular búsqueda
        setSelectedPackage(mockPackage)
        setDeliveryTasks(mockPackage.deliveryTasks)
        toast({
            title: "Paquete encontrado",
            description: `Paquete encontrado para: ${searchTerm}`,
            variant: "default",
        })
    }

    const completeTask = (taskId: string) => {
        setDeliveryTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, completed: true } : task)))
        toast({
            title: "Tarea completada",
            description: "La tarea ha sido marcada como completada.",
            variant: "default",
        })
    }

    const canCompleteDelivery = () => {
        return deliveryTasks.filter((task) => task.required).every((task) => task.completed)
    }

    const handleDelivery = () => {
        if (!canCompleteDelivery()) {
            toast({
                title: "Tareas pendientes",
                description: "Debes completar todas las tareas requeridas antes de entregar.",
                variant: "destructive",
            })
            return
        }

        toast({
            title: "Paquete entregado",
            description: `El paquete ${selectedPackage.packageNumber} ha sido entregado exitosamente.`,
            variant: "default",
        })

        setSelectedPackage(null)
        setDeliveryTasks([])
        setSearchTerm("")
    }

    const getTaskIcon = (type: string) => {
        switch (type) {
            case "photo_id":
                return CreditCard
            case "signature":
                return FileSignature
            case "payment":
                return DollarSign
            case "secret_word":
                return Key
            default:
                return CheckCircle
        }
    }

    return (
        <div className="p-6 bg-gray-50 min-h-full">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="bg-blue-100 p-3 rounded-lg">
                            <PackageCheck className="h-8 w-8 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Entregar Paquete a Cliente</h1>
                            <p className="text-gray-600">Escanea o busca el paquete para proceder con la entrega</p>
                        </div>
                    </div>

                    {/* Método de búsqueda */}
                    <div className="flex gap-3 mb-6">
                        <Button
                            variant={searchMode === "scan" ? "default" : "outline"}
                            onClick={() => setSearchMode("scan")}
                            className="flex items-center gap-2"
                        >
                            <QrCode className="h-4 w-4" />
                            Escanear QR/Código
                        </Button>
                        <Button
                            variant={searchMode === "manual" ? "default" : "outline"}
                            onClick={() => setSearchMode("manual")}
                            className="flex items-center gap-2"
                        >
                            <Search className="h-4 w-4" />
                            Búsqueda Manual
                        </Button>
                    </div>

                    {/* Área de escaneo */}
                    {searchMode === "scan" && (
                        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                            {isScanning ? (
                                <div className="flex flex-col items-center gap-4">
                                    <div className="animate-pulse">
                                        <Camera className="h-16 w-16 text-blue-600" />
                                    </div>
                                    <p className="text-blue-600 font-medium">Escaneando código...</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-4">
                                    <QrCode className="h-16 w-16 text-gray-400" />
                                    <div>
                                        <p className="text-gray-600 font-medium mb-2">
                                            Escanea el código QR o código de barras del paquete
                                        </p>
                                        <Button onClick={handleScan} className="bg-blue-600 hover:bg-blue-700">
                                            Iniciar Escaneo
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Búsqueda manual */}
                    {searchMode === "manual" && (
                        <div className="flex gap-3">
                            <div className="flex-1">
                                <Input
                                    placeholder="Buscar por ID de paquete, nombre o cédula del destinatario..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyPress={(e) => e.key === "Enter" && handleManualSearch()}
                                />
                            </div>
                            <Button onClick={handleManualSearch} className="bg-blue-600 hover:bg-blue-700">
                                <Search className="h-4 w-4 mr-2" />
                                Buscar
                            </Button>
                        </div>
                    )}
                </div>

                {/* Información del paquete y tareas */}
                {selectedPackage && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Información del paquete */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Eye className="h-5 w-5 text-blue-600" />
                                    Información del Paquete
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <h3 className="font-bold text-xl text-blue-900 mb-2">#{selectedPackage.packageNumber}</h3>
                                    <Badge className="bg-amber-100 text-amber-800">Pendiente de Entrega</Badge>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <User className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium text-gray-900">{selectedPackage.recipientName}</p>
                                            <p className="text-sm text-gray-600">Cédula: {selectedPackage.recipientId}</p>
                                            <p className="text-sm text-gray-600">Tel: {selectedPackage.recipientPhone}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <Building className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium text-gray-900">{selectedPackage.merchant}</p>
                                            <p className="text-sm text-gray-600">Remitente</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <Truck className="h-5 w-5 text-blue-600" />
                                        <div className="flex items-center gap-2">
                                            <Image
                                                src={selectedPackage.courierLogo || "/placeholder.svg"}
                                                alt={selectedPackage.courier}
                                                width={24}
                                                height={24}
                                                className="rounded-sm"
                                            />
                                            <div>
                                                <p className="font-medium text-gray-900">{selectedPackage.courier}</p>
                                                <p className="text-sm text-gray-600">Courier</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <Calendar className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium text-gray-900">{selectedPackage.receivedAt}</p>
                                            <p className="text-sm text-gray-600">Fecha de recepción</p>
                                        </div>
                                    </div>

                                    {selectedPackage.chargeAmount > 0 && (
                                        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                                            <DollarSign className="h-5 w-5 text-green-600" />
                                            <div>
                                                <p className="font-bold text-green-900">₡{selectedPackage.chargeAmount.toLocaleString()}</p>
                                                <p className="text-sm text-green-700">Monto a cobrar</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {selectedPackage.additionalInfo && (
                                    <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                        <p className="text-sm text-yellow-800">
                                            <strong>Nota:</strong> {selectedPackage.additionalInfo}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Tareas de entrega */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5 text-blue-600" />
                                    Tareas de Entrega
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {deliveryTasks.map((task) => {
                                    const TaskIcon = getTaskIcon(task.type)
                                    return (
                                        <div
                                            key={task.id}
                                            className={`p-4 rounded-lg border-2 transition-all ${task.completed
                                                    ? "bg-green-50 border-green-200"
                                                    : task.required
                                                        ? "bg-red-50 border-red-200"
                                                        : "bg-gray-50 border-gray-200"
                                                }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start gap-3">
                                                    <div className={`p-2 rounded-lg ${task.completed ? "bg-green-100" : "bg-gray-100"}`}>
                                                        <TaskIcon className={`h-5 w-5 ${task.completed ? "text-green-600" : "text-gray-600"}`} />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-gray-900 flex items-center gap-2">
                                                            {task.title}
                                                            {task.required && (
                                                                <Badge variant="destructive" className="text-xs">
                                                                    Requerido
                                                                </Badge>
                                                            )}
                                                        </h4>
                                                        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                                                    </div>
                                                </div>

                                                {!task.completed && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => completeTask(task.id)}
                                                        className="bg-blue-600 hover:bg-blue-700"
                                                    >
                                                        {task.type === "photo_id" && <Camera className="h-4 w-4 mr-1" />}
                                                        {task.type === "signature" && <FileSignature className="h-4 w-4 mr-1" />}
                                                        {task.type === "payment" && <DollarSign className="h-4 w-4 mr-1" />}
                                                        {task.type === "secret_word" && <Key className="h-4 w-4 mr-1" />}
                                                        Completar
                                                    </Button>
                                                )}

                                                {task.completed && (
                                                    <Badge className="bg-green-100 text-green-800">
                                                        <CheckCircle className="h-3 w-3 mr-1" />
                                                        Completado
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}

                                <div className="pt-4 border-t">
                                    <Button
                                        onClick={handleDelivery}
                                        disabled={!canCompleteDelivery()}
                                        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300"
                                        size="lg"
                                    >
                                        <CheckCircle className="mr-2 h-5 w-5" />
                                        {canCompleteDelivery() ? "Confirmar Entrega" : "Completar tareas requeridas"}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Botón de regreso */}
                <div className="flex justify-start">
                    <Button variant="outline" asChild>
                        <Link href="/pde/paquetes">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver a Funciones PdE
                        </Link>
                    </Button>
                </div>
            </div>
            <Toaster />
        </div>
    )
}
