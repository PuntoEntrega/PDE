// src/Services/collaborators.ts
import { Collaborator, CollaboratorSummary, InvitationFormData } from "../lib/types/collaborator"

import axios from "axios"

export async function getCollaborators(): Promise<Collaborator[]> {
    const res = await fetch("/api/collaborators", {
        cache: "no-store",
    })

    if (!res.ok) throw new Error("Error al cargar colaboradores")

    const data = await res.json()
    return data.collaborators
}

export async function getCollaboratorFilters() {
    const res = await axios.get("/api/collaborators/filters")
    return res.data
}

export async function getCollaboratorById(id: string): Promise<CollaboratorSummary> {
    try {
        const res = await axios.get<CollaboratorSummary>(`/api/collaborators/${id}`)
        return res.data
    } catch (err: any) {
        if (err.response?.status === 404) {
            const error = new Error("Colaborador no encontrado")
                ; (error as any).status = 404
            throw error
        }
        throw err
    }
}

// 1. Activar o desactivar usuario (campo `active`)
export async function toggleCollaboratorActive(id: string) {
    const response = await axios.patch(`/api/collaborators/${id}/toggle-active`)
    return response.data as { success: boolean; active: boolean }
}

// 2. Cambiar status entre 'active' e 'inactive'
export async function toggleCollaboratorStatus(id: string) {
    const response = await axios.patch(`/api/collaborators/${id}/toggle-status`)
    return response.data as { success: boolean; status: "active" | "inactive" }
}

// 3. Reenviar invitación
export async function resendCollaboratorInvitation(id: string) {
    const response = await axios.post(`/api/collaborators/${id}/resend-invitation`)
    return response.data as { success: boolean; message: string }
}

export async function updateCollaborator(
    id: string,
    payload: Partial<InvitationFormData>
) {
    // Prepara los datos que enviará el form sin el email, first_name ni last_name
    const body: any = {
        role_id: payload.role_id,
        company_ids: payload.company_ids,
        delivery_point_ids: payload.delivery_point_ids,
    };

    // Realiza la petición PATCH
    try {
        const response = await axios.patch(
            `/api/collaborators/${id}`, // se incluye el user_id en la URL
            body,
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        return response.data; // { success: true }
    } catch (error: any) {
        // Manejo de errores
        if (error.response) {
            console.error("Error en respuesta:", error.response.data);
            throw new Error(error.response.data.error || "Error al actualizar");
        } else {
            console.error("Error de conexión:", error.message);
            throw new Error(error.message);
        }
    }
}