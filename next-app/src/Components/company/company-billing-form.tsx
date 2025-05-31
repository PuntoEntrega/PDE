"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/Components/ui/button"
import { Input } from "@/Components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/Components/ui/radio-group"
import { Label } from "@/Components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card"
import {
  DollarSign,
  FileSignature,
  Banknote,
  CreditCardIcon,
  Mail,
  Phone,
  Save,
  Loader2,
  Settings2,
} from "lucide-react"
import { z } from "zod"

// Schemas de validación
const billingConfigSchema = z.object({
  billing_type: z.enum(["CONTADO", "CREDITO", "OTRO"], { required_error: "Tipo de facturación requerido" }),
  document_type_id: z.string().min(1, "Tipo de documento para facturación requerido"),
  identification_number: z.string().min(5, "Número de identificación para facturación requerido"),
  receiver_name: z.string().min(3, "Nombre de receptor para facturación requerido"),
  billing_email: z.string().email("Correo para facturación inválido"),
  billing_phone: z
    .string()
    .regex(/^\d{4,15}$/, "Teléfono para facturación inválido")
    .optional()
    .or(z.literal("")),
  // Campos de liquidación (settlement) - opcionales por ahora según UI
  settlement_amount: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().positive("Monto debe ser positivo").optional(),
  ),
  settlement_frequency: z.enum(["DIARIA", "SEMANAL", "QUINCENAL", "MENSUAL", "OTRO"]).optional(),
  // Campos para las opciones de radio de la UI
  billing_distribution_model: z.string().min(1, "Opción de facturación requerida"),
  payment_reception_model: z.string().min(1, "Opción de pago requerida"),
})

const bankAccountSchema = z.object({
  iban: z.string().min(15, "IBAN inválido (mín. 15 caracteres)").max(34, "IBAN inválido (máx. 34 caracteres)"),
  bank_name: z.string().min(3, "Nombre del banco requerido"),
  account_number: z.string().min(5, "Número de cuenta requerido"),
})

interface CompanyBillingFormProps {
  initialBillingData?: any
  initialBankAccountData?: any
  onSave: (data: {
    billing: z.infer<typeof billingConfigSchema>
    bankAccount: z.infer<typeof bankAccountSchema>
  }) => void
  isSaving: boolean
}

export function CompanyBillingForm({
  initialBillingData,
  initialBankAccountData,
  onSave,
  isSaving,
}: CompanyBillingFormProps) {
  const [billingFormData, setBillingFormData] = useState(
    initialBillingData || {
      billing_type: "CONTADO",
      document_type_id: "",
      identification_number: "",
      receiver_name: "",
      billing_email: "",
      billing_phone: "",
      settlement_amount: "",
      settlement_frequency: "DIARIA",
      billing_distribution_model: "consolidada", // Valor por defecto para radio
      payment_reception_model: "unica-cuenta", // Valor por defecto para radio
    },
  )
  const [bankAccountFormData, setBankAccountFormData] = useState(
    initialBankAccountData || {
      iban: "",
      bank_name: "",
      account_number: "",
    },
  )

  const [billingErrors, setBillingErrors] = useState<Record<string, string>>({})
  const [bankAccountErrors, setBankAccountErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (initialBillingData) setBillingFormData(initialBillingData)
    if (initialBankAccountData) setBankAccountFormData(initialBankAccountData)
  }, [initialBillingData, initialBankAccountData])

  const handleBillingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setBillingFormData((prev: any) => ({ ...prev, [name]: value }))
    if (billingErrors[name]) setBillingErrors((prev) => ({ ...prev, [name]: "" }))
  }

  const handleBillingSelectChange = (name: string, value: string) => {
    setBillingFormData((prev: any) => ({ ...prev, [name]: value }))
    if (billingErrors[name]) setBillingErrors((prev) => ({ ...prev, [name]: "" }))
  }

  const handleBillingRadioChange = (name: string, value: string) => {
    setBillingFormData((prev: any) => ({ ...prev, [name]: value }))
    if (billingErrors[name]) setBillingErrors((prev) => ({ ...prev, [name]: "" }))
  }

  const handleBankAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setBankAccountFormData((prev: any) => ({ ...prev, [name]: value }))
    if (bankAccountErrors[name]) setBankAccountErrors((prev) => ({ ...prev, [name]: "" }))
  }

  const validateForms = () => {
    const billingValidation = billingConfigSchema.safeParse(billingFormData)
    const bankAccountValidation = bankAccountSchema.safeParse(bankAccountFormData)

    let isValid = true
    if (!billingValidation.success) {
      const errors: Record<string, string> = {}
      billingValidation.error.errors.forEach((err) => (errors[err.path[0] as string] = err.message))
      setBillingErrors(errors)
      isValid = false
    } else {
      setBillingErrors({})
    }

    if (!bankAccountValidation.success) {
      const errors: Record<string, string> = {}
      bankAccountValidation.error.errors.forEach((err) => (errors[err.path[0] as string] = err.message))
      setBankAccountErrors(errors)
      isValid = false
    } else {
      setBankAccountErrors({})
    }
    return isValid
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForms()) {
      onSave({ billing: billingFormData, bankAccount: bankAccountFormData })
    }
  }

  const documentTypes = [
    { value: "cedula-fisica", label: "Cédula Física Nacional" },
    { value: "cedula-juridica", label: "Cédula Jurídica" },
    // ... otros tipos si son necesarios
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Opciones de Facturación */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="bg-gray-50 p-4 rounded-t-lg border-b">
          <CardTitle className="text-lg font-semibold text-gray-700 flex items-center">
            <Settings2 className="mr-2 h-5 w-5 text-blue-600" />
            Opciones de Facturación
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <RadioGroupField
            label="Selecciona la opción para facturación que mejor se ajuste a su empresa:"
            name="billing_distribution_model"
            value={billingFormData.billing_distribution_model}
            onValueChange={(value) => handleBillingRadioChange("billing_distribution_model", value)}
            options={[
              {
                value: "consolidada",
                label: "Facturación consolidada",
                description: "Recibirás una única factura en cada periodo de facturación.",
              },
              {
                value: "distribuida-misma-cuenta",
                label: "Facturación distribuida en una misma cuenta de facturación electrónica",
                description: "Recibirás en una única cuenta una factura por cada PdE.",
              },
              {
                value: "distribuida-diferentes-cuentas",
                label: "Facturación distribuida con diferentes cuentas de facturación electrónica por cada PdE",
                description: "Recibirás una factura por cada PdE en su respectiva cuenta de facturación.",
              },
            ]}
            error={billingErrors.billing_distribution_model}
          />
        </CardContent>
      </Card>

      {/* Datos de Facturación */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="bg-gray-50 p-4 rounded-t-lg border-b">
          <CardTitle className="text-lg font-semibold text-gray-700 flex items-center">
            <FileSignature className="mr-2 h-5 w-5 text-blue-600" />
            Datos para Facturación
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SelectField
              label="Tipo de Identificación"
              name="document_type_id"
              value={billingFormData.document_type_id}
              onValueChange={(value) => handleBillingSelectChange("document_type_id", value)}
              options={documentTypes}
              error={billingErrors.document_type_id}
              required
            />
            <InputField
              label="Número de Identificación"
              name="identification_number"
              value={billingFormData.identification_number}
              onChange={handleBillingChange}
              error={billingErrors.identification_number}
              required
            />
            <InputField
              label="Nombre Receptor"
              name="receiver_name"
              value={billingFormData.receiver_name}
              onChange={handleBillingChange}
              error={billingErrors.receiver_name}
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Correo para Facturación"
              name="billing_email"
              type="email"
              value={billingFormData.billing_email}
              onChange={handleBillingChange}
              error={billingErrors.billing_email}
              icon={Mail}
              required
            />
            <InputField
              label="Teléfono para Facturación (Opcional)"
              name="billing_phone"
              type="tel"
              value={billingFormData.billing_phone}
              onChange={handleBillingChange}
              error={billingErrors.billing_phone}
              icon={Phone}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField
              label="Tipo de Facturación (Contado/Crédito)"
              name="billing_type"
              value={billingFormData.billing_type}
              onValueChange={(value) => handleBillingSelectChange("billing_type", value)}
              options={[
                { value: "CONTADO", label: "Contado" },
                { value: "CREDITO", label: "Crédito" },
                { value: "OTRO", label: "Otro" },
              ]}
              error={billingErrors.billing_type}
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Opciones de Pago y Cuenta Bancaria */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="bg-gray-50 p-4 rounded-t-lg border-b">
          <CardTitle className="text-lg font-semibold text-gray-700 flex items-center">
            <DollarSign className="mr-2 h-5 w-5 text-blue-600" />
            Configuración de Pagos
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <RadioGroupField
            label="Selecciona la opción de pago que mejor se ajuste a su empresa:"
            name="payment_reception_model"
            value={billingFormData.payment_reception_model}
            onValueChange={(value) => handleBillingRadioChange("payment_reception_model", value)}
            options={[
              {
                value: "unica-cuenta",
                label: "Quiero recibir los pagos de todos los PdE en una única cuenta.",
              },
              {
                value: "multiples-cuentas",
                label: "Quiero recibir los pagos en cuentas diferentes por cada PdE.",
                description: "(Podrá configurar las cuentas por PdE más adelante)",
              },
            ]}
            error={billingErrors.payment_reception_model}
          />

          {billingFormData.payment_reception_model === "unica-cuenta" && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="text-md font-medium text-gray-700 mb-3">Cuenta Bancaria Principal para Pagos</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InputField
                  label="Cuenta IBAN"
                  name="iban"
                  value={bankAccountFormData.iban}
                  onChange={handleBankAccountChange}
                  error={bankAccountErrors.iban}
                  icon={CreditCardIcon}
                  placeholder="CR..."
                  required
                />
                <InputField
                  label="Banco"
                  name="bank_name"
                  value={bankAccountFormData.bank_name}
                  onChange={handleBankAccountChange}
                  error={bankAccountErrors.bank_name}
                  icon={Banknote}
                  required
                />
                <InputField
                  label="Número de Cuenta"
                  name="account_number"
                  value={bankAccountFormData.account_number}
                  onChange={handleBankAccountChange}
                  error={bankAccountErrors.account_number}
                  required
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end pt-4">
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={isSaving}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Guardar Configuración de Dinero
        </Button>
      </div>
    </form>
  )
}

// Componentes reutilizables (puedes moverlos a un archivo utils si se usan en más sitios)
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


const RadioGroupField = ({ label, name, value, onValueChange, options, error }: any) => (
  <div>
    <Label className="text-sm font-medium text-gray-700 mb-2 block">{label}</Label>
    <RadioGroup name={name} value={value} onValueChange={onValueChange} className="space-y-2">
      {options.map((option: any) => (
        <div
          key={option.value}
          className="flex items-start space-x-2 p-3 border rounded-md hover:border-blue-300 transition-colors"
        >
          <RadioGroupItem value={option.value} id={`${name}-${option.value}`} className="mt-1" />
          <div className="grid gap-1.5 leading-normal">
            <Label htmlFor={`${name}-${option.value}`} className="font-normal text-gray-800 cursor-pointer">
              {option.label}
            </Label>
            {option.description && <p className="text-xs text-gray-500">{option.description}</p>}
          </div>
        </div>
      ))}
    </RadioGroup>
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
)
