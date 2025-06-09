"use server"
import { prisma } from "@/lib/prisma" // Assuming prisma client is exported from here
import { auth } from "@/lib/auth" // Assuming auth() gives session/user
import { companySchema, type CompanyFormData } from "@/lib/validations/company"
import { revalidatePath } from "next/cache"

interface DocumentType {
  id: string
  name: string
}

export async function getDocumentTypes(): Promise<DocumentType[]> {
  try {
    const documentTypes = await prisma.documentTypes.findMany({
      select: { id: true, name: true },
    })
    return documentTypes
  } catch (error) {
    console.error("Error fetching document types:", error)
    return []
  }
}

export async function createCompany(data: CompanyFormData) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, message: "Usuario no autenticado." }
  }
  const ownerUserId = session.user.id

  const validation = companySchema.safeParse(data)
  if (!validation.success) {
    return { success: false, message: "Datos inválidos.", errors: validation.error.flatten().fieldErrors }
  }

  const { legalRepresentatives, ...companyData } = validation.data

  try {
    const newCompany = await prisma.companies.create({
      data: {
        ...companyData,
        owner_user_id: ownerUserId,
        CompanyStatusHistory: {
          create: {
            status: "PENDING_APPROVAL", // Or an initial status
            changed_by_user_id: ownerUserId,
          },
        },
        LegalRepresentatives: {
          create: legalRepresentatives.map((rep) => ({
            full_name: rep.full_name,
            document_type_id: rep.document_type_id,
            identification_number: rep.identification_number,
            email: rep.email,
            primary_phone: rep.primary_phone,
            secondary_phone: rep.secondary_phone,
          })),
        },
      },
      include: {
        LegalRepresentatives: true,
      },
    })
    revalidatePath("/companies") // Revalidate the page showing all companies
    return { success: true, message: "Empresa creada exitosamente.", company: newCompany }
  } catch (error) {
    console.error("Error creating company:", error)
    // Check for unique constraint violation for legal_id if necessary
    // if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
    //   return { success: false, message: "Ya existe una empresa con ese ID Legal." };
    // }
    return { success: false, message: "Error al crear la empresa." }
  }
}

export async function getMyCompanies() {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, message: "Usuario no autenticado.", companies: [] }
  }
  const ownerUserId = session.user.id

  try {
    const companies = await prisma.companies.findMany({
      where: { owner_user_id: ownerUserId },
      orderBy: { created_at: "desc" },
      include: {
        LegalRepresentatives: {
          include: {
            DocumentTypes: {
              // Include DocumentType name
              select: { name: true },
            },
          },
        },
        // _count: { select: { DeliveryPoints: true } } // Example: if you want to show count of delivery points
      },
    })
    return { success: true, companies }
  } catch (error) {
    console.error("Error fetching companies:", error)
    return { success: false, message: "Error al obtener las empresas.", companies: [] }
  }
}
