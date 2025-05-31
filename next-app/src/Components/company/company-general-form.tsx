"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building, UserIcon as UserTie, Mail, Phone, FileText, Briefcase, MapPin, Save, Loader2 } from "lucide-react"
import { z } from "zod"
import { UserIcon } from "lucide-react" // Import UserIcon

// Schemas de validación
const companySchema = z.object({
    legal_name: z.string().min(3, "Denominación fiscal requerida (mín. 3 caracteres)"),
    trade_name: z.string().min(3, "Nombre de comercio requerido (mín. 3 caracteres)"),
    legal_id: z.string().min(5, "NIF requerido (mín. 5 caracteres)"),
    fiscal_address: z.string().min(10, "Domicilio fiscal requerido (mín. 10 caracteres)"),
    contact_email: z.string().email("Correo electrónico de contacto inválido"),
    contact_phone: z.string().regex(/^\d{4,15}$/, "Teléfono de contacto inválido (solo números, 4-15 dígitos)"),
    company_type: z.enum(["PdE", "Transportista"], { required_error: "Tipo de empresa es requerido" }),
})

const legalRepSchema = z.object({
    document_type_id: z.string().min(1, "Tipo de documento requerido"),
    full_name: z.string().min(5, "Nombre completo requerido (mín. 5 caracteres)"),
    identification_number: z.string().min(5, "Número de identificación requerido (mín. 5 caracteres)"),
    email: z.string().email("Correo electrónico inválido"),
    primary_phone: z.string().regex(/^\d{4,15}$/, "Teléfono principal inválido (solo números, 4-15 dígitos)"),
    secondary_phone: z
        .string()
        .regex(/^\d{4,15}$/, "Teléfono secundario inválido")
        .optional()
        .or(z.literal("")),
})

interface CompanyGeneralFormProps {
    initialCompanyData?: any
    initialLegalRepData?: any
    onSave: (data: {
        company: z.infer<typeof companySchema>
        legalRepresentative: z.infer<typeof legalRepSchema>
    }) => void
    isSaving: boolean
}

export function CompanyGeneralForm({
    initialCompanyData,
    initialLegalRepData,
    onSave,
    isSaving,
}: CompanyGeneralFormProps) {
    const [companyFormData, setCompanyFormData] = useState(
        initialCompanyData || {
            legal_name: "",
            trade_name: "",
            legal_id: "",
            fiscal_address: "",
            contact_email: "",
            contact_phone: "",
            company_type: "PdE",
        },
    )
    const [legalRepFormData, setLegalRepFormData] = useState(
        initialLegalRepData || {
            document_type_id: "",
            full_name: "",
            identification_number: "",
            email: "",
            primary_phone: "",
            secondary_phone: "",
        },
    )

    const [companyErrors, setCompanyErrors] = useState<Record<string, string>>({})
    const [legalRepErrors, setLegalRepErrors] = useState<Record<string, string>>({})

    useEffect(() => {
        if (initialCompanyData) setCompanyFormData(initialCompanyData)
        if (initialLegalRepData) setLegalRepFormData(initialLegalRepData)
    }, [initialCompanyData, initialLegalRepData])

    const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setCompanyFormData((prev: any) => ({ ...prev, [name]: value }))
        if (companyErrors[name]) setCompanyErrors((prev) => ({ ...prev, [name]: "" }))
    }

    const handleCompanySelectChange = (name: string, value: string) => {
        setCompanyFormData((prev: any) => ({ ...prev, [name]: value }))
        if (companyErrors[name]) setCompanyErrors((prev) => ({ ...prev, [name]: "" }))
    }

    const handleLegalRepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setLegalRepFormData((prev: any) => ({ ...prev, [name]: value }))
        if (legalRepErrors[name]) setLegalRepErrors((prev) => ({ ...prev, [name]: "" }))
    }

    const handleLegalRepSelectChange = (name: string, value: string) => {
        setLegalRepFormData((prev: any) => ({ ...prev, [name]: value }))
        if (legalRepErrors[name]) setLegalRepErrors((prev) => ({ ...prev, [name]: "" }))
    }

    const validateForms = () => {
        const companyValidation = companySchema.safeParse(companyFormData)
        const legalRepValidation = legalRepSchema.safeParse(legalRepFormData)

        let isValid = true
        if (!companyValidation.success) {
            const errors: Record<string, string> = {}
            companyValidation.error.errors.forEach((err) => (errors[err.path[0] as string] = err.message))
            setCompanyErrors(errors)
            isValid = false
        } else {
            setCompanyErrors({})
        }

        if (!legalRepValidation.success) {
            const errors: Record<string, string> = {}
            legalRepValidation.error.errors.forEach((err) => (errors[err.path[0] as string] = err.message))
            setLegalRepErrors(errors)
            isValid = false
        } else {
            setLegalRepErrors({})
        }
        return isValid
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (validateForms()) {
            onSave({ company: companyFormData, legalRepresentative: legalRepFormData })
        }
    }

    const documentTypes = [
        { value: "cedula-fisica", label: "Cédula Física Nacional" },
        { value: "cedula-juridica", label: "Cédula Jurídica" },
        { value: "pasaporte", label: "Pasaporte" },
        { value: "dimex", label: "DIMEX (Residencia)" },
    ]

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Datos de la Empresa */}
            <Card className="border-gray-200 shadow-sm">
                <CardHeader className="bg-gray-50 p-4 rounded-t-lg border-b">
                    <CardTitle className="text-lg font-semibold text-gray-700 flex items-center">
                        <Building className="mr-2 h-5 w-5 text-blue-600" />
                        Datos de la Empresa
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField
                            label="Denominación Fiscal"
                            name="legal_name"
                            value={companyFormData.legal_name}
                            onChange={handleCompanyChange}
                            error={companyErrors.legal_name}
                            icon={FileText}
                            required
                        />
                        <InputField
                            label="Nombre de Comercio"
                            name="trade_name"
                            value={companyFormData.trade_name}
                            onChange={handleCompanyChange}
                            error={companyErrors.trade_name}
                            icon={Briefcase}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField
                            label="Número de Identificación Fiscal (NIF)"
                            name="legal_id"
                            value={companyFormData.legal_id}
                            onChange={handleCompanyChange}
                            error={companyErrors.legal_id}
                            icon={FileText}
                            required
                        />
                        <SelectField
                            label="Tipo de Empresa"
                            name="company_type"
                            value={companyFormData.company_type}
                            onValueChange={(value) => handleCompanySelectChange("company_type", value)}
                            options={[
                                { value: "PdE", label: "Punto de Entrega (PdE)" },
                                { value: "Transportista", label: "Transportista" },
                            ]}
                            error={companyErrors.company_type}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="fiscal_address" className="block text-sm font-medium text-gray-700 mb-1">
                            Domicilio Fiscal <span className="text-red-500">*</span>
                        </label>
                        <Textarea
                            id="fiscal_address"
                            name="fiscal_address"
                            value={companyFormData.fiscal_address}
                            onChange={handleCompanyChange}
                            placeholder="Ej: Calle Principal 123, San José, Costa Rica"
                            className={`min-h-[80px] ${companyErrors.fiscal_address ? "border-red-500" : "border-gray-300"}`}
                        />

                        {companyErrors.fiscal_address && (
                            <p className="text-xs text-red-500 mt-1">{companyErrors.fiscal_address}</p>
                        )}
                    </div>
                    <p className="text-sm font-medium text-gray-700 mt-4 mb-2">Datos de Contacto (Empresa)</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField
                            label="Correo Electrónico de Contacto"
                            name="contact_email"
                            type="email"
                            value={companyFormData.contact_email}
                            onChange={handleCompanyChange}
                            error={companyErrors.contact_email}
                            icon={Mail}
                            required
                        />
                        <InputField
                            label="Teléfono de Contacto"
                            name="contact_phone"
                            type="tel"
                            value={companyFormData.contact_phone}
                            onChange={handleCompanyChange}
                            error={companyErrors.contact_phone}
                            icon={Phone}
                            placeholder="Ej: 22334455"
                            required
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Datos del Representante Legal */}
            <Card className="border-gray-200 shadow-sm">
                <CardHeader className="bg-gray-50 p-4 rounded-t-lg border-b">
                    <CardTitle className="text-lg font-semibold text-gray-700 flex items-center">
                        <UserTie className="mr-2 h-5 w-5 text-blue-600" />
                        Datos del Representante Legal
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <SelectField
                            label="Tipo de Identificación"
                            name="document_type_id"
                            value={legalRepFormData.document_type_id}
                            onValueChange={(value) => handleLegalRepSelectChange("document_type_id", value)}
                            options={documentTypes}
                            error={legalRepErrors.document_type_id}
                            required
                        />
                        <InputField
                            label="Número de Identificación"
                            name="identification_number"
                            value={legalRepFormData.identification_number}
                            onChange={handleLegalRepChange}
                            error={legalRepErrors.identification_number}
                            icon={FileText}
                            required
                        />
                        <InputField
                            label="Nombre Completo"
                            name="full_name"
                            value={legalRepFormData.full_name}
                            onChange={handleLegalRepChange}
                            error={legalRepErrors.full_name}
                            icon={UserIcon} // Use UserIcon instead of User
                            required
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <InputField
                            label="Correo Electrónico"
                            name="email"
                            type="email"
                            value={legalRepFormData.email}
                            onChange={handleLegalRepChange}
                            error={legalRepErrors.email}
                            icon={Mail}
                            required
                        />
                        <InputField
                            label="Teléfono Principal"
                            name="primary_phone"
                            type="tel"
                            value={legalRepFormData.primary_phone}
                            onChange={handleLegalRepChange}
                            error={legalRepErrors.primary_phone}
                            icon={Phone}
                            placeholder="Ej: 88776655"
                            required
                        />
                        <InputField
                            label="Teléfono Secundario (Opcional)"
                            name="secondary_phone"
                            type="tel"
                            value={legalRepFormData.secondary_phone}
                            onChange={handleLegalRepChange}
                            error={legalRepErrors.secondary_phone}
                            icon={Phone}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Sección "Cuántos Puntos de Entrega desea habilitar" - UI simple por ahora */}
            <Card className="border-gray-200 shadow-sm">
                <CardHeader className="bg-gray-50 p-4 rounded-t-lg border-b">
                    <CardTitle className="text-lg font-semibold text-gray-700 flex items-center">
                        <MapPin className="mr-2 h-5 w-5 text-blue-600" />
                        Puntos de Entrega
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                    <p className="text-sm text-gray-600 mb-2">¿Cuántos Puntos de Entrega (PdE) desea habilitar inicialmente?</p>
                    <div className="flex space-x-3">
                        <Button type="button" variant="outline" className="flex-1">
                            1 Punto de Entrega
                        </Button>
                        <Button type="button" variant="outline" className="flex-1">
                            Más de 1 Punto de Entrega
                        </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Podrá agregar más PdEs más adelante.</p>
                </CardContent>
            </Card>

            <div className="flex justify-end pt-4">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Guardar Datos Generales
                </Button>
            </div>
        </form>
    )
}

// Componente reutilizable para InputField
const InputField = ({ label, name, type = "text", value, onChange, error, icon: Icon, placeholder, required }: any) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
            {Icon && <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />}
            <Input
                id={name}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder || `Ingrese ${label.toLowerCase()}`}
                className={`${Icon ? "pl-10" : ""} ${error ? "border-red-500" : "border-gray-300"}`}
            />
        </div>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
)


// Componente reutilizable para SelectField
const SelectField = ({ label, name, value, onValueChange, options, error, required }: any) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <Select name={name} value={value} onValueChange={onValueChange}>
            <SelectTrigger className={`${error ? "border-red-500" : "border-gray-300"}`}>
                <SelectValue placeholder={`Seleccione ${label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
                {options.map((option: any) => (
                    <SelectItem key={option.value} value={option.value}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
)
