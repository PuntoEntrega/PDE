"use client"

import Image from "next/image"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/Components/ui/card"
import { Badge } from "@/Components/ui/badge"
import type { Companies, LegalRepresentatives as PrismaLegalRepresentative } from "@prisma/client" // Assuming Prisma types
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/Components/ui/accordion"

// Extend PrismaLegalRepresentative to include DocumentTypes for direct access
interface LegalRepresentativeWithDocType extends PrismaLegalRepresentative {
  DocumentTypes: { name: string } | null
}
export interface CompanyWithDetails extends Companies {
  LegalRepresentatives: LegalRepresentativeWithDocType[]
  // _count?: { DeliveryPoints?: number }; // If you decide to include counts
}

interface CompanyCardProps {
  company: CompanyWithDetails
}

export function CompanyCard({ company }: CompanyCardProps) {
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-start gap-4">
        {company.logo_url && (
          <Image
            src={company.logo_url || "/placeholder.svg"}
            alt={`${company.legal_name} logo`}
            width={64}
            height={64}
            className="rounded-md object-contain"
            onError={(e) => (e.currentTarget.style.display = "none")} // Hide if image fails to load
          />
        )}
        <div className="flex-1">
          <CardTitle>{company.legal_name}</CardTitle>
          {company.trade_name && <CardDescription>{company.trade_name}</CardDescription>}
          <div className="mt-2">
            <Badge variant="outline">{company.company_type}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-muted-foreground">
          <strong>ID Legal:</strong> {company.legal_id}
        </p>
        {company.fiscal_address && (
          <p className="text-sm text-muted-foreground">
            <strong>Dirección Fiscal:</strong> {company.fiscal_address}
          </p>
        )}
        {company.contact_email && (
          <p className="text-sm text-muted-foreground">
            <strong>Email:</strong> {company.contact_email}
          </p>
        )}
        {company.contact_phone && (
          <p className="text-sm text-muted-foreground">
            <strong>Teléfono:</strong> {company.contact_phone}
          </p>
        )}
        {company.LegalRepresentatives && company.LegalRepresentatives.length > 0 && (
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="legal-representatives">
              <AccordionTrigger>Representantes Legales ({company.LegalRepresentatives.length})</AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 pl-4">
                  {company.LegalRepresentatives.map((rep) => (
                    <li key={rep.id} className="text-sm">
                      <strong>{rep.full_name}</strong>
                      <br />
                      {rep.DocumentTypes?.name}: {rep.identification_number}
                      {rep.email && (
                        <>
                          <br />
                          Email: {rep.email}
                        </>
                      )}
                      {rep.primary_phone && (
                        <>
                          <br />
                          Tel: {rep.primary_phone}
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">
          Registrada el: {new Date(company.created_at || Date.now()).toLocaleDateString()}
        </p>
      </CardFooter>
    </Card>
  )
}
