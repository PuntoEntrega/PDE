// src/Services/invitation.ts

import { CompanyOptionForInvitation } from '@/lib/types/collaborator';
export async function getValidRoles() {
    const res = await fetch("/api/roles-validos", { cache: "no-store" });
    if (!res.ok) throw new Error("No pude cargar los roles");
    return (await res.json()).roles as { id: string; key: any, name: string; level: number, description?: string , create_at : string, update_at : string}[];
}

export async function getAssignableCompanies() {
    const res = await fetch("/api/empresas-asignables", { cache: "no-store" });
    if (!res.ok) throw new Error("No pude cargar las empresas");
    return (await res.json()).companies as { id: string; trade_name: string }[];
}

export async function getAssignablePdes(companyId: string) {
    const res = await fetch(`/api/pdes-asignables?company_id=${companyId}`, { cache: "no-store" });
    if (!res.ok) throw new Error("No pude cargar los PDVs");
    return (await res.json()).pdvs as CompanyOptionForInvitation;
}

export async function inviteCollaborator(data: {
    email: string;
    role_id: string;
    company_id?: string;
    pde_id?: string;
    first_name?: string;
    last_name?: string;
    message?: string;
}) {
    const res = await fetch("/api/collaborators", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al invitar colaborador");
    }
}
