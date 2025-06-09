"use client"

import { useEffect, useState } from "react"
import { useForm, useFieldArray, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { companySchema, type CompanyFormData } from "@/lib/validations/company"
import { createCompany, getDocumentTypes as fetchDocumentTypesAction } from "@/actions/company"
import { Button } from "@/Components/ui/button"
import { Input } from "@/Components/ui/input"
import { Label } from "@/Components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card"
import { toast } from "sonner"
import { PlusCircle, Trash2 } from "lucide-react"

interface DocumentType {
  id: string
  name: string
}

export function CreateCompanyForm() {
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      legal_name: "",
      trade_name: "",
      company_type: undefined,
      legal_id: "",
      fiscal_address: "",
      contact_email: "",
      contact_phone: "",
      logo_url: "",
      legalRepresentatives: [
        { full_name: "", document_type_id: "", identification_number: "", email: "", primary_phone: "" },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "legalRepresentatives",
  })

  useEffect(() => {
    async function loadDocumentTypes() {
      const types = await fetchDocumentTypesAction()
      setDocumentTypes(types)
    }
    loadDocumentTypes()
  }, [])

  const onSubmit = async (data: CompanyFormData) => {
    setIsSubmitting(true)
    toast.loading("Creando empresa...")
    const result = await createCompany(data)
    toast.dismiss()
    if (result.success) {
      toast.success(result.message)
      form.reset()
    } else {
      toast.error(result.message || "Ocurrió un error.")
      if (result.errors) {
        // Handle specific field errors if needed, e.g. by setting form errors
        console.error("Validation errors:", result.errors)
      }
    }
    setIsSubmitting(false)
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Crear Nueva Empresa</CardTitle>
        <CardDescription>Complete los datos para registrar una nueva empresa.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="legal_name">Razón Social</Label>
              <Input id="legal_name" {...form.register("legal_name")} />
              {form.formState.errors.legal_name && (
                <p className="text-red-500 text-sm">{form.formState.errors.legal_name.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="trade_name">Nombre Comercial (Opcional)</Label>
              <Input id="trade_name" {...form.register("trade_name")} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company_type">Tipo de Empresa</Label>
              <Controller
                control={form.control}
                name="company_type"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PdE">Punto de Entrega (PdE)</SelectItem>
                      <SelectItem value="Transportista">Transportista</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.company_type && (
                <p className="text-red-500 text-sm">{form.formState.errors.company_type.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="legal_id">ID Legal (CUIT/RUC)</Label>
              <Input id="legal_id" {...form.register("legal_id")} />
              {form.formState.errors.legal_id && (
                <p className="text-red-500 text-sm">{form.formState.errors.legal_id.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="fiscal_address">Dirección Fiscal (Opcional)</Label>
            <Input id="fiscal_address" {...form.register("fiscal_address")} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contact_email">Email de Contacto (Opcional)</Label>
              <Input type="email" id="contact_email" {...form.register("contact_email")} />
              {form.formState.errors.contact_email && (
                <p className="text-red-500 text-sm">{form.formState.errors.contact_email.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="contact_phone">Teléfono de Contacto (Opcional)</Label>
              <Input id="contact_phone" {...form.register("contact_phone")} />
            </div>
          </div>
          <div>
            <Label htmlFor="logo_url">URL del Logo (Opcional)</Label>
            <Input id="logo_url" {...form.register("logo_url")} />
            {form.formState.errors.logo_url && (
              <p className="text-red-500 text-sm">{form.formState.errors.logo_url.message}</p>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Representantes Legales</h3>
            {fields.map((item, index) => (
              <Card key={item.id} className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold">Representante Legal {index + 1}</h4>
                  {fields.length > 1 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>
                <div>
                  <Label htmlFor={`legalRepresentatives.${index}.full_name`}>Nombre Completo</Label>
                  <Input {...form.register(`legalRepresentatives.${index}.full_name`)} />
                  {form.formState.errors.legalRepresentatives?.[index]?.full_name && (
                    <p className="text-red-500 text-sm">
                      {form.formState.errors.legalRepresentatives?.[index]?.full_name?.message}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`legalRepresentatives.${index}.document_type_id`}>Tipo de Documento</Label>
                    <Controller
                      control={form.control}
                      name={`legalRepresentatives.${index}.document_type_id`}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            {documentTypes.map((docType) => (
                              <SelectItem key={docType.id} value={docType.id}>
                                {docType.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {form.formState.errors.legalRepresentatives?.[index]?.document_type_id && (
                      <p className="text-red-500 text-sm">
                        {form.formState.errors.legalRepresentatives?.[index]?.document_type_id?.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor={`legalRepresentatives.${index}.identification_number`}>
                      Número de Identificación
                    </Label>
                    <Input {...form.register(`legalRepresentatives.${index}.identification_number`)} />
                    {form.formState.errors.legalRepresentatives?.[index]?.identification_number && (
                      <p className="text-red-500 text-sm">
                        {form.formState.errors.legalRepresentatives?.[index]?.identification_number?.message}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor={`legalRepresentatives.${index}.email`}>Email (Opcional)</Label>
                  <Input type="email" {...form.register(`legalRepresentatives.${index}.email`)} />
                  {form.formState.errors.legalRepresentatives?.[index]?.email && (
                    <p className="text-red-500 text-sm">
                      {form.formState.errors.legalRepresentatives?.[index]?.email?.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor={`legalRepresentatives.${index}.primary_phone`}>Teléfono Principal (Opcional)</Label>
                  <Input {...form.register(`legalRepresentatives.${index}.primary_phone`)} />
                </div>
              </Card>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                append({ full_name: "", document_type_id: "", identification_number: "", email: "", primary_phone: "" })
              }
              className="mt-2"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Agregar Representante Legal
            </Button>
            {form.formState.errors.legalRepresentatives &&
              typeof form.formState.errors.legalRepresentatives === "object" &&
              !Array.isArray(form.formState.errors.legalRepresentatives) && (
                <p className="text-red-500 text-sm">{form.formState.errors.legalRepresentatives.message}</p>
              )}
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
            {isSubmitting ? "Creando..." : "Crear Empresa"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
