"use server"

import { z } from "zod"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth" // Assuming this is your auth utility
import { Companies_company_type } from "@prisma/client"
import { revalidatePath } from "next/cache"

const companySchema = z.object({
  legal_name: z.string().min(1, "Legal name is required").max(100),
  trade_name: z.string().max(100).optional().nullable(),
  company_type: z.nativeEnum(Companies_company_type),
  legal_id: z.string().min(1, "Legal ID is required").max(40),
  fiscal_address: z.string().max(256).optional().nullable(),
  contact_email: z.string().email("Invalid email address").max(120).optional().nullable(),
  contact_phone: z.string().max(30).optional().nullable(),
  logo_url: z.string().url("Invalid URL format").max(255).optional().nullable(),
  // parent_company_id: z.string().uuid().optional().nullable(), // Assuming UUID if you implement this
})

export type CompanyFormState = {
  message: string
  errors?: {
    legal_name?: string[]
    trade_name?: string[]
    company_type?: string[]
    legal_id?: string[]
    fiscal_address?: string[]
    contact_email?: string[]
    contact_phone?: string[]
    logo_url?: string[]
    // parent_company_id?: string[];
  }
  success: boolean
}

export async function createCompany(prevState: CompanyFormState, formData: FormData): Promise<CompanyFormState> {
  const session = await auth()
  if (!session?.user?.id) {
    return {
      message: "User not authenticated.",
      success: false,
    }
  }

  const validatedFields = companySchema.safeParse({
    legal_name: formData.get("legal_name"),
    trade_name: formData.get("trade_name") || null,
    company_type: formData.get("company_type"),
    legal_id: formData.get("legal_id"),
    fiscal_address: formData.get("fiscal_address") || null,
    contact_email: formData.get("contact_email") || null,
    contact_phone: formData.get("contact_phone") || null,
    logo_url: formData.get("logo_url") || null,
    // parent_company_id: formData.get("parent_company_id") || null,
  })

  if (!validatedFields.success) {
    return {
      message: "Validation failed.",
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    }
  }

  try {
    await prisma.companies.create({
      data: {
        id: crypto.randomUUID(), // Prisma needs an ID to be provided
        ...validatedFields.data,
        owner_user_id: session.user.id,
        active: true, // Default as per schema
      },
    })
    revalidatePath("/companies/list") // Revalidate the list page
    return { message: "Company created successfully.", success: true }
  } catch (error) {
    console.error("Failed to create company:", error)
    return { message: "Failed to create company. Please try again.", success: false }
  }
}

export async function getUserCompanies() {
  const session = await auth()
  if (!session?.user?.id) {
    // throw new Error("User not authenticated."); // Or return empty array
    return []
  }

  try {
    const companies = await prisma.companies.findMany({
      where: {
        owner_user_id: session.user.id,
      },
      orderBy: {
        created_at: "desc",
      },
    })
    return companies
  } catch (error) {
    console.error("Failed to fetch companies:", error)
    return [] // Return empty array on error
  }
}
