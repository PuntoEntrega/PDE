"use client";
import { useEffect, useState } from "react";
import { getUsuarios } from "../../Services/Usuarios";

export default function UsuariosClient() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUsuarios().then((data) => {
      setUsuarios(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <p>Cargando…</p>;

  return (
    <ul>
      {usuarios.map((u) => (
        <li key={u.id}>{u.nombre}</li>
      ))}
    </ul>
  );
}
