// src/Services/usuarios.ts
export async function getUsuarios() {
    const res = await fetch("/api/usuarios");
    if (!res.ok) throw new Error("Error al obtener usuarios");
    return res.json();
  }