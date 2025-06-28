"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card"
import { Button } from "@/Components/ui/button"
import { Input } from "@/Components/ui/input"
import { Badge } from "@/Components/ui/badge"
import { Send, ArrowLeft, QrCode, Camera, User, DollarSign, CheckCircle, CreditCard } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/Components/ui/use-toast"
import { Toaster } from "@/Components/ui/toaster"

export function EnviarPaqueteClient() {
    const [isScanning, setIsScanning] = useState(false)
    const [scannedData, setScannedData] = useState<any>(null)
    const [paymentAmount, setPaymentAmount] = useState("")
    const [paymentCompleted, setPaymentCompleted] = useState(false)
    const { toast } = useToast()

    // Mock data del usuario escaneado
    const mockUserData = {
        id: "user_001",
        name: "María González Pérez",
        email: "maria.gonzalez@email.com",
        phone: "8888-9999",
        identification: "1-1234-5678",
        serviceType: "Envío Express",
        destination: "San José Centro",
        estimatedCost: 2500,
        requiresPayment: true,
    }

    const handleScan = () => {
        setIsScanning(true)
        setTimeout(() => {
            setIsScanning(false)
            setScannedData(mockUserData)
            toast({
                title: "Usuario verificado",
                description: `Datos de ${mockUserData.name} cargados exitosamente.`,
                variant: "default",
            })
        }, 2000)
    }

    const handlePayment = () => {
        if (!paymentAmount || Number.parseFloat(paymentAmount) < scannedData.estimatedCost) {
            toast({
                title: "Monto incorrecto",
                description: `El monto debe ser de ₡${scannedData.estimatedCost.toLocaleString()}`,
                variant: "destructive",
            })
            return
        }

        setPaymentCompleted(true)
        toast({
            title: "Pago recibido",
            description: "El pago ha sido procesado exitosamente.",
            variant: "default",
        })
    }

    const handleCreateShipment = () => {
        if (scannedData.requiresPayment && !paymentCompleted) {
            toast({
                title: "Pago requerido",
                description: "Debes procesar el pago antes de crear el envío.",
                variant: "destructive",
            })
            return
        }

        toast({
            title: "Envío creado",
            description: "El envío ha sido registrado exitosamente. Se generará la guía de envío.",
            variant: "default",
        })

        // Reset form
        setScannedData(null)
        setPaymentAmount("")
        setPaymentCompleted(false)
    }

    return (
        <div className="p-6 bg-gray-50 min-h-full">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="bg-blue-100 p-3 rounded-lg">
                            <Send className="h-8 w-8 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Enviar Paquete desde PdE</h1>
                            <p className="text-gray-600">Escanea el código QR del usuario para procesar el envío</p>
                        </div>
                    </div>

                    {/* Área de escaneo */}
                    <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        {isScanning ? (
                            <div className="flex flex-col items-center gap-4">
                                <div className="animate-pulse">
                                    <Camera className="h-16 w-16 text-blue-600" />
                                </div>
                                <p className="text-blue-600 font-medium">Escaneando código QR del usuario...</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-4">
                                <QrCode className="h-16 w-16 text-gray-400" />
                                <div>
                                    <p className="text-gray-600 font-medium mb-2">Escanea el código QR del usuario</p>
                                    <p className="text-sm text-gray-500 mb-4">
                                        El código contiene los datos del envío y información de pago
                                    </p>
                                    <Button onClick={handleScan} className="bg-blue-600 hover:bg-blue-700">
                                        <QrCode className="h-4 w-4 mr-2" />
                                        Iniciar Escaneo
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Información del usuario y envío */}
                {scannedData && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Datos del usuario */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5 text-blue-600" />
                                    Información del Usuario
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <h3 className="font-bold text-lg text-blue-900 mb-2">{scannedData.name}</h3>
                                    <Badge className="bg-green-100 text-green-800">Usuario Verificado</Badge>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Identificación:</span>
                                        <span className="font-medium">{scannedData.identification}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Email:</span>
                                        <span className="font-medium">{scannedData.email}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Teléfono:</span>
                                        <span className="font-medium">{scannedData.phone}</span>
                                    </div>
                                </div>

                                <div className="pt-3 border-t">
                                    <h4 className="font-semibold text-gray-900 mb-2">Detalles del Envío</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Servicio:</span>
                                            <span className="font-medium">{scannedData.serviceType}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Destino:</span>
                                            <span className="font-medium">{scannedData.destination}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Costo estimado:</span>
                                            <span className="font-bold text-green-600">₡{scannedData.estimatedCost.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Procesamiento de pago */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5 text-blue-600" />
                                    Procesamiento de Pago
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {scannedData.requiresPayment ? (
                                    <>
                                        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                                            <h4 className="font-semibold text-yellow-900 mb-2">Pago Requerido</h4>
                                            <p className="text-yellow-800">
                                                El usuario debe pagar ₡{scannedData.estimatedCost.toLocaleString()} por el servicio de envío.
                                            </p>
                                        </div>

                                        {!paymentCompleted ? (
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Monto Recibido (₡)</label>
                                                    <div className="relative">
                                                        <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                        <Input
                                                            type="number"
                                                            placeholder={scannedData.estimatedCost.toString()}
                                                            value={paymentAmount}
                                                            onChange={(e) => setPaymentAmount(e.target.value)}
                                                            className="pl-10"
                                                        />
                                                    </div>
                                                </div>

                                                <Button onClick={handlePayment} className="w-full bg-green-600 hover:bg-green-700">
                                                    <DollarSign className="h-4 w-4 mr-2" />
                                                    Procesar Pago
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                                    <h4 className="font-semibold text-green-900">Pago Completado</h4>
                                                </div>
                                                <p className="text-green-800">
                                                    Pago de ₡{scannedData.estimatedCost.toLocaleString()} recibido exitosamente.
                                                </p>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                        <div className="flex items-center gap-2 mb-2">
                                            <CheckCircle className="h-5 w-5 text-blue-600" />
                                            <h4 className="font-semibold text-blue-900">Envío Prepagado</h4>
                                        </div>
                                        <p className="text-blue-800">Este envío ya ha sido pagado. No se requiere pago adicional.</p>
                                    </div>
                                )}

                                <div className="pt-4 border-t">
                                    <Button
                                        onClick={handleCreateShipment}
                                        disabled={scannedData.requiresPayment && !paymentCompleted}
                                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300"
                                        size="lg"
                                    >
                                        <Send className="h-4 w-4 mr-2" />
                                        {scannedData.requiresPayment && !paymentCompleted ? "Procesar pago primero" : "Crear Envío"}
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
