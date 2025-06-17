import { Badge } from "@/Components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/Components/ui/button";
import { Pencil, Eye, Share2 } from "lucide-react";
import Link from "next/link";
import { Progress } from "@/Components/ui/progress";

interface PDETableProps {
  pdes: {
    id: string;
    name: string;
    created_at: string;
    updated_at: string;
    active: boolean;
    usage: number;
    capacity: number;
    company: {
      trade_name: string;
    };
  }[];
}

export function PDETable({ pdes }: PDETableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border rounded-lg overflow-hidden bg-white text-sm">
        <thead className="bg-gray-50 text-left text-gray-600 font-medium">
          <tr>
            <th className="p-3">Nombre PdE</th>
            <th className="p-3">Empresa matriz</th>
            <th className="p-3">Fecha ingreso</th>
            <th className="p-3">Última actualización</th>
            <th className="p-3">Espacio en uso</th>
            <th className="p-3">Estado</th>
            <th className="p-3 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {pdes.map((pde) => (
            <tr key={pde.id} className="border-t hover:bg-gray-50">
              <td className="p-3">{pde.name}</td>
              <td className="p-3">{pde.company.trade_name}</td>
              <td className="p-3">{format(new Date(pde.created_at), "yyyy/MM/dd", { locale: es })}</td>
              <td className="p-3">{format(new Date(pde.updated_at), "yyyy/MM/dd", { locale: es })}</td>
              <td className="p-3">
                <div className="flex items-center gap-2">
                  <Progress value={(pde.usage / pde.capacity) * 100} className="w-[100px]" />
                  <span>{pde.usage}/{pde.capacity}</span>
                </div>
              </td>
              <td className="p-3">
                <Badge
                  variant={pde.active ? "default" : "destructive"}
                  className={`text-xs ${pde.active
                      ? "bg-green-100 text-green-700 border-green-300"
                      : "bg-red-100 text-red-700 border-red-300"
                    }`}
                >
                  {pde.active ? "Activo" : "Inactivo"}
                </Badge>
              </td>
              <td className="p-3 flex justify-center gap-2">
                <Link href={`/pde/${pde.id}`}>
                  <Button size="icon" variant="outline" className="h-8 w-8">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
                <Button size="icon" variant="outline" className="h-8 w-8">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="outline" className="h-8 w-8">
                  <Share2 className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
