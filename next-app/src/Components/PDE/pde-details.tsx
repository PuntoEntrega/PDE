"use client";

import { useEffect, useState } from "react";
import { getPDEById } from "@/Services/pde";
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";
import { Loader2 } from "lucide-react";
import { useToast } from "@/Components/ui/use-toast";

interface PDEDetailsProps {
  pdeId: string;
}

export function PDEDetails({ pdeId }: PDEDetailsProps) {
  const { toast } = useToast();
  const [pde, setPde] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPDE() {
      try {
        const data = await getPDEById(pdeId);
        setPde(data);
      } catch (err: any) {
        console.error(err);
        toast({
          title: "Error al cargar el PDE",
          description: err?.response?.data?.error || "Ocurrió un error inesperado.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchPDE();
  }, [pdeId, toast]);

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!pde) return null;

  return (
    <Card className="shadow-lg border rounded-xl overflow-hidden max-w-3xl mx-auto mt-6">
      <CardHeader className="bg-blue-50 border-b p-6">
        <CardTitle className="text-2xl">{pde.name}</CardTitle>
        {pde.trade_name && (
          <p className="text-gray-600 text-sm mt-1">Nombre comercial: {pde.trade_name}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4 p-6 text-sm text-gray-700">
        <p><strong>Empresa:</strong> {pde.company?.trade_name || "Sin nombre comercial"}</p>
        <p><strong>Correo de negocio:</strong> {pde.business_email || "N/A"}</p>
        <p><strong>Provincia:</strong> {pde.province}</p>
        <p><strong>Dirección exacta:</strong> {pde.exact_address}</p>
        <p><strong>Teléfono del encargado:</strong> {pde.manager_phone || "N/A"}</p>
        <p><strong>Estado:</strong> {pde.status}</p>
        {/* Puedes agregar más campos aquí como servicios, horarios, coordenadas, etc. */}
      </CardContent>
    </Card>
  );
}
