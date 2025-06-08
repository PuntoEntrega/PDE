"use client"

import { useFormState, useFormStatus } from "react-dom"
import { createCompany, type CompanyFormState } from "@/app/actions/company-actions"
import { Button } from "@/Components/ui/button"
import { Input } from "@/Components/ui/input"
import { Label } from "@/Components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/Components/ui/card"
import { Companies_company_type } from "@prisma/client" // For enum values
import { useEffect } from "react"
import { useToast } from "@/hooks/use-toast" // Assuming you have this hook
import Link from "next/link"

const initialState: CompanyFormState = {
  message: "",
  success: false,
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? "Creating..." : "Create Company"}
    </Button>
  )
}

export function CreateCompanyForm() {
  const [state, formAction] = useFormState(createCompany, initialState)
  const { toast } = useToast()

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.success ? "Success" : "Error",
        description: state.message,
        variant: state.success ? "default" : "destructive",
      })
    }
  }, [state, toast])

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Company</CardTitle>
        <CardDescription>Fill in the details below to register a new company.</CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="legal_name">Legal Name *</Label>
              <Input id="legal_name" name="legal_name" required />
              {state.errors?.legal_name && <p className="text-sm text-red-500">{state.errors.legal_name[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="trade_name">Trade Name</Label>
              <Input id="trade_name" name="trade_name" />
              {state.errors?.trade_name && <p className="text-sm text-red-500">{state.errors.trade_name[0]}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="company_type">Company Type *</Label>
              <Select name="company_type" required>
                <SelectTrigger id="company_type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Companies_company_type.PdE}>PdE (Punto de Entrega)</SelectItem>
                  <SelectItem value={Companies_company_type.Transportista}>Transportista</SelectItem>
                </SelectContent>
              </Select>
              {state.errors?.company_type && <p className="text-sm text-red-500">{state.errors.company_type[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="legal_id">Legal ID (e.g., CUIT, RUC) *</Label>
              <Input id="legal_id" name="legal_id" required />
              {state.errors?.legal_id && <p className="text-sm text-red-500">{state.errors.legal_id[0]}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fiscal_address">Fiscal Address</Label>
            <Input id="fiscal_address" name="fiscal_address" />
            {state.errors?.fiscal_address && <p className="text-sm text-red-500">{state.errors.fiscal_address[0]}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="contact_email">Contact Email</Label>
              <Input id="contact_email" name="contact_email" type="email" />
              {state.errors?.contact_email && <p className="text-sm text-red-500">{state.errors.contact_email[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_phone">Contact Phone</Label>
              <Input id="contact_phone" name="contact_phone" type="tel" />
              {state.errors?.contact_phone && <p className="text-sm text-red-500">{state.errors.contact_phone[0]}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo_url">Logo URL</Label>
            <Input id="logo_url" name="logo_url" type="url" placeholder="https://example.com/logo.png" />
            {state.errors?.logo_url && <p className="text-sm text-red-500">{state.errors.logo_url[0]}</p>}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6">
          <Link href="/companies/list" legacyBehavior>
            <Button variant="outline" className="w-full sm:w-auto">
              Cancel
            </Button>
          </Link>
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  )
}
