"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/Components/ui/button"
import { Input } from "@/Components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/Components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select"
import { useAlert } from "../alerts/use-alert"
import { useEffect, useState } from "react"
import { createCompany } from "@/api/companies" // Declare the createCompany variable

const legalRepresentativeSchema = z.object({
  full_name: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
  document_type_id: z.string().min(1, "Seleccione un tipo de documento."),
  identification_number: z.string().min(5, "El número de identificación es muy corto."),
  email: z.string().email("Por favor, ingrese un email válido."),
  primary_phone: z.string().min(7, "El número de teléfono es muy corto."),
})

const createCompanySchema = z.object({
  legal_name: z.string().min(3, "El nombre legal debe tener al menos 3 caracteres."),
  trade_name: z.string().optional(),
  company_type: z.enum(["PdE", "Transportista"], { required_error: "Debe seleccionar un tipo de empresa." }),
  legal_id: z.string().min(5, "El ID legal (CUIT/RUC) es muy corto."),
  fiscal_address: z.string().optional(),
  contact_email: z.string().email("Email de contacto inválido.").optional().or(z.literal("")),
  contact_phone: z.string().optional(),
  logo_url: z.string().url("Debe ser una URL válida.").optional().or(z.literal("")),
  legalRepresentative: legalRepresentativeSchema,
})

type CreateCompanyFormValues = z.infer<typeof createCompanySchema>

interface DocumentType {
  id: string
  name: string
}

export function CreateCompanyForm({ onSuccess }: { onSuccess: () => void }) {
  const { showAlert } = useAlert()
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([])
  const form = useForm<CreateCompanyFormValues>({
    resolver: zodResolver(createCompanySchema),
    defaultValues: {
      legal_name: "",
      trade_name: "",
      legal_id: "",
      fiscal_address: "",
      contact_email: "",
      contact_phone: "",
      logo_url: "",
      legalRepresentative: {
        full_name: "",
        document_type_id: "",
        identification_number: "",
        email: "",
        primary_phone: "",
      },
    },
  })

  useEffect(() => {
    const fetchDocumentTypes = async () => {
      try {
        const res = await fetch("/api/document-types")
        const data = await res.json()
        setDocumentTypes(data)
      } catch (error) {
        console.error("Failed to fetch document types", error)
      }
    }
    fetchDocumentTypes()
  }, [])

  const onSubmit = async (data: CreateCompanyFormValues) => {
    try {
      await createCompany(data)
      showAlert("Éxito", "Empresa creada correctamente.", "success")
      onSuccess()
      form.reset()
    } catch (error: any) {
      showAlert("Error", error.message || "No se pudo crear la empresa.", "error")
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Datos de la Empresa</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="legal_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre Legal</FormLabel>
                  <FormControl>
                    <Input placeholder="Mi Empresa S.A." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="trade_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre Comercial</FormLabel>
                  <FormControl>
                    <Input placeholder="Mi Empresa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="legal_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID Legal (CUIT/RUC)</FormLabel>
                  <FormControl>
                    <Input placeholder="20-12345678-9" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="company_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Empresa</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PdE">Punto de Entrega (PdE)</SelectItem>
                      <SelectItem value="Transportista">Transportista</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contact_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email de Contacto</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="contacto@miempresa.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contact_phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono de Contacto</FormLabel>
                  <FormControl>
                    <Input placeholder="+54 9 11 1234-5678" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="fiscal_address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dirección Fiscal</FormLabel>
                <FormControl>
                  <Input placeholder="Av. Siempre Viva 742" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="logo_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL del Logo</FormLabel>
                <FormControl>
                  <Input placeholder="https://ejemplo.com/logo.png" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-lg font-medium">Representante Legal</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="legalRepresentative.full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Juan Pérez" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="legalRepresentative.document_type_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Documento</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {documentTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="legalRepresentative.identification_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nro. de Identificación</FormLabel>
                  <FormControl>
                    <Input placeholder="12.345.678" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="legalRepresentative.email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="juan.perez@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="legalRepresentative.primary_phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono Principal</FormLabel>
                  <FormControl>
                    <Input placeholder="+54 9 11 8765-4321" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Creando..." : "Crear Empresa"}
        </Button>
      </form>
    </Form>
  )
}
