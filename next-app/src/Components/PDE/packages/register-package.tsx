"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card"
import { Button } from "@/Components/ui/button"
import { Badge } from "@/Components/ui/badge"
import { Package, ArrowLeft, QrCode, Camera, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/Components/ui/use-toast"
import { Toaster } from "@/Components/ui/toaster"

export function RegistrarPaqueteClient() {
    const [isScanning, setIsScanning] = useState(false)
    const [scannedPackage, setScannedPackage] = useState<any>(null)
    const [verificationStatus, setVerificationStatus] = useState<"pending" | "success" | "error" | null>(null)
    const { toast } = useToast()

    // Mock data del paquete esperado
    const mockExpectedPackage = {
        id: "pkg_incoming_001",
        packageNumber: "AMZ123456789",
        courier: "Amazon Logistics",
        courierLogo: "/placeholder.svg?width=30&height=30",
        recipientName: "Juan Carlos Rodríguez",
        merchant: "Amazon",
        expectedDate: "2024-01-20",
        status: "En Tránsito hacia PdE",
        trackingNumber: "AMZ123456789",
        weight: "1.2 kg",
        dimensions: "25x15x10 cm",
    }

    const handleScan = () => {
        setIsScanning(true)
        setVerificationStatus("pending")

        setTimeout(() => {
            setIsScanning(false)

            // Simular verificación - 80% éxito, 20% error
            const isSuccess = Math.random() > 0.2

            if (isSuccess) {
                setScannedPackage(mockExpectedPackage)
                setVerificationStatus("success")
                toast({
                    title: "Paquete verificado",
                    description: `Paquete ${mockExpectedPackage.packageNumber} encontrado en el sistema.`,
                    variant: "default",
                })
            } else {
                setVerificationStatus("error")
                toast({
                    title: "Paquete no encontrado",
                    description: "Este paquete no está en la lista de paquetes esperados para este PdE.",
                    variant: "destructive",
                })
            }
        }, 2000)
    }

    const handleReceivePackage = () => {
        toast({
            title: "Paquete recibido",
            description: `El paquete ${scannedPackage.packageNumber} ha sido registrado exitosamente en el PdE.`,
            variant: "default",
        })

        // Reset form
        setScannedPackage(null)
        setVerificationStatus(null)
    }

    const handleRetry = () => {
        setScannedPackage(null)
        setVerificationStatus(null)
    }

    return (
        <div className="p-6 bg-gray-50 min-h-full">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="bg-blue-100 p-3 rounded-lg">
                            <Package className="h-8 w-8 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Registrar Paquete en el Punto</h1>
                            <p className="text-gray-600">Escanea el código para verificar y recibir paquetes</p>
                        </div>
                    </div>

                    {/* Área de escaneo */}
                    <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        {isScanning ? (
                            <div className="flex flex-col items-center gap-4">
                                <div className="animate-pulse">
                                    <Camera className="h-16 w-16 text-blue-600" />
                                </div>
                                <p className="text-blue-600 font-medium">Escaneando y verificando paquete...</p>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>Verificando contra paquetes esperados</span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-4">
                                <QrCode className="h-16 w-16 text-gray-400" />
                                <div>
                                    <p className="text-gray-600 font-medium mb-2">Escanea el código QR o código de barras del paquete</p>
                                    <p className="text-sm text-gray-500 mb-4">
                                        Se verificará automáticamente si el paquete debe ser recibido en este PdE
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

                {/* Resultado de la verificación */}
                {verificationStatus === "success" && scannedPackage && (
                    <Card className="border-green-200 bg-green-50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-green-800">
                                <CheckCircle className="h-6 w-6" />
                                Paquete Verificado Exitosamente
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="bg-white p-4 rounded-lg border border-green-200">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-bold text-gray-900">#{scannedPackage.packageNumber}</h3>
                                    <Badge className="bg-green-100 text-green-800 border-green-300">Paquete Esperado</Badge>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <div>
                                            <span className="text-sm text-gray-600">Destinatario:</span>
                                            <p className="font-medium text-gray-900">{scannedPackage.recipientName}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-600">Remitente:</span>
                                            <p className="font-medium text-gray-900">{scannedPackage.merchant}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-600">Courier:</span>
                                            <p className="font-medium text-gray-900">{scannedPackage.courier}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <span className="text-sm text-gray-600">Fecha Esperada:</span>
                                            <p className="font-medium text-gray-900">{scannedPackage.expectedDate}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-600">Peso:</span>
                                            <p className="font-medium text-gray-900">{scannedPackage.weight}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-600">Dimensiones:</span>
                                            <p className="font-medium text-gray-900">{scannedPackage.dimensions}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button onClick={handleReceivePackage} className="flex-1 bg-green-600 hover:bg-green-700" size="lg">
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Confirmar Recepción del Paquete
                                </Button>
                                <Button onClick={handleRetry} variant="outline" size="lg">
                                    Escanear Otro
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {verificationStatus === "error" && (
                    <Card className="border-red-200 bg-red-50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-red-800">
                                <XCircle className="h-6 w-6" />
                                Paquete No Encontrado
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="bg-white p-4 rounded-lg border border-red-200">
                                <h3 className="font-semibold text-red-900 mb-2">El paquete escaneado no está en el sistema</h3>
                                <p className="text-red-800 mb-4">
                                    Este paquete no se encuentra en la lista de paquetes esperados para este Punto de Entrega.
                                </p>

                                <div className="bg-red-100 p-3 rounded-lg">
                                    <h4 className="font-medium text-red-900 mb-2">Posibles causas:</h4>
                                    <ul className="text-sm text-red-800 space-y-1">
                                        <li>• El paquete está destinado a otro PdE</li>
                                        <li>• El código escaneado es incorrecto</li>
                                        <li>• El paquete aún no ha sido registrado en el sistema</li>
                                        <li>• El paquete ya fue recibido anteriormente</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button onClick={handleRetry} className="flex-1 bg-blue-600 hover:bg-blue-700" size="lg">
                                    <QrCode className="h-4 w-4 mr-2" />
                                    Intentar Nuevamente
                                </Button>
                                <Button variant="outline" size="lg" asChild>
                                    <Link href="/pde/paquetes">Cancelar</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Información adicional */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-blue-600" />
                            Información Importante
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 text-sm text-gray-600">
                            <p>• Solo se pueden recibir paquetes que estén registrados para este Punto de Entrega</p>
                            <p>• El sistema verificará automáticamente si el paquete debe ser recibido aquí</p>
                            <p>• Si un paquete no aparece en el sistema, contacta al administrador</p>
                            <p>• Todos los paquetes recibidos quedarán registrados con fecha y hora</p>
                        </div>
                    </CardContent>
                </Card>

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
