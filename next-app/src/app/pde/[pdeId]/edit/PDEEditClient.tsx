"use client";

import { useEffect, useState } from "react";
import { getPDEById } from "@/Services/pde/pde";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import PdeGeneralDataEdit from "@/Components/PDE/edit/PDEGeneralEditSection";
import PdeParcelServiceEdit from "@/Components/PDE/edit/PDEParcelEditSection";
import { Loader2 } from "lucide-react";

interface PDEEditClientProps {
  pdeId: string;
} 

export default function PDEEditClient({ pdeId }: PDEEditClientProps) {
  const [pde, setPde] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPDE() {
      try {
        const data = await getPDEById(pdeId);
        setPde(data);
      } catch (err) {
        console.error("Error al cargar el PDE", err);
      } finally {
        setLoading(false);
      }
    }

    fetchPDE();
  }, [pdeId]);

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!pde) return <div>No se encontró el PDE</div>;

  return (
    <Tabs defaultValue="general">
      <TabsList>
        <TabsTrigger value="general">Datos Generales</TabsTrigger>
        <TabsTrigger value="parcel">Paquetería</TabsTrigger>
      </TabsList>

      <TabsContent value="general">
        <PdeGeneralDataEdit pde={pde} />
      </TabsContent>

      <TabsContent value="parcel">
        <PdeParcelServiceEdit pde={pde} />
      </TabsContent>
    </Tabs>
  );
}
