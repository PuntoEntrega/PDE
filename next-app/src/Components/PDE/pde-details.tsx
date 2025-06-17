// src/Components/PDE/pde-details.tsx

"use client";

import { useEffect, useState } from "react";
import { getPDEById } from "@/Services/pde/pde";
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";
import { Loader2 } from "lucide-react";
import { useToast } from "@/Components/ui/use-toast";
import Image from "next/image";
import { Badge } from "@/Components/ui/badge";

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
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!pde) return null;

  return (
    <div className="max-w-7xl mx-auto mt-8 px-6">
      <Card className="shadow-xl border border-gray-200 rounded-2xl overflow-hidden">
        <CardHeader className="bg-blue-50 p-8">
          <div className="flex items-center gap-6">
            {pde.company?.logo_url && (
              <div className="relative h-20 w-20 rounded-xl overflow-hidden shadow-md border">
                <Image
                  src={pde.company.logo_url}
                  alt={pde.company.trade_name || "Logo de empresa"}
                  fill
                  className="object-contain p-2"
                />
              </div>
            )}
            <div className="flex-1">
              <CardTitle className="text-4xl font-bold text-gray-900">
                {pde.name}
              </CardTitle>
              {pde.trade_name && (
                <p className="text-gray-600 text-lg mt-1">
                  Nombre comercial: {pde.trade_name}
                </p>
              )}
              {pde.company?.trade_name && (
                <p className="text-gray-700 text-sm mt-2">
                  Empresa matriz: <span className="font-medium">{pde.company.trade_name}</span>
                </p>
              )}
            </div>
            <div className="text-right">
              <Badge
                variant={pde.company?.active ? "default" : "destructive"}
                className="text-base p-3"
              >
                {pde.company?.active ? "Empresa Activa" : "Empresa Inactiva"}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="bg-white px-8 py-10 space-y-8">
          <section>
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Información General del Punto de Entrega</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
              <div>
                <p className="font-medium">Correo de negocio:</p>
                <p>{pde.business_email || "-"}</p>
              </div>
              <div>
                <p className="font-medium">Teléfono del encargado:</p>
                <p>{pde.manager_phone || "-"}</p>
              </div>
              <div>
                <p className="font-medium">Nombre del encargado:</p>
                <p>{pde.manager_name || "-"}</p>
              </div>
              <div>
                <p className="font-medium">Cédula jurídica / física:</p>
                <p>{pde.identification_number || "-"}</p>
              </div>
              <div className="md:col-span-2">
                <p className="font-medium">Dirección exacta:</p>
                <p>
                  {pde.exact_address || "-"} <br />
                  {pde.district}, {pde.canton}, {pde.province}
                </p>
              </div>
              <div>
                <p className="font-medium">Código postal:</p>
                <p>{pde.postal_code || "-"}</p>
              </div>
              <div>
                <p className="font-medium">Estado actual del punto:</p>
                <Badge
                  variant={pde.active ? "default" : "destructive"}
                  className="text-sm p-2"
                >
                  {pde.active ? "Activo" : "Inactivo"}
                </Badge>
              </div>
              <div>
                <p className="font-medium">Fecha de creación:</p>
                <p>{new Date(pde.created_at).toLocaleDateString("es-CR")}</p>
              </div>
              <div>
                <p className="font-medium">Última actualización:</p>
                <p>{new Date(pde.updated_at).toLocaleDateString("es-CR")}</p>
              </div>
            </div>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
