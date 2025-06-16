// src/Components/PDE/pde-card.tsx

import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/Components/ui/avatar";
import { Building2, MapPin, Mail } from "lucide-react";

interface PDECardProps {
  pde: {
    id: string;
    name: string;
    trade_name?: string | null;
    business_email?: string | null;
    province?: string | null;
    exact_address?: string | null;
    active: boolean;
    logo_url?: string | null;
  };
}

export function PDECard({ pde }: PDECardProps) {
  return (
    <Link href={`/pde/${pde.id}`} passHref>
      <Card className="cursor-pointer shadow-md hover:shadow-lg transition-shadow duration-300 border rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-br from-blue-50 to-white border-b">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12 border border-gray-200">
              <AvatarImage
                src={pde.logo_url || "/placeholder.svg?query=pde"}
                alt={pde.name}
                className="object-cover"
              />
              <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
                {pde.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-800">
                {pde.name}
              </CardTitle>
              {pde.trade_name && (
                <span className="text-sm text-gray-500">{pde.trade_name}</span>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 space-y-2">
          {pde.business_email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700 truncate">{pde.business_email}</span>
            </div>
          )}

          {pde.province && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">{pde.province}</span>
            </div>
          )}

          <Badge
            variant={pde.active ? "default" : "destructive"}
            className={`text-xs ${
              pde.active
                ? "bg-green-100 text-green-700 border-green-300"
                : "bg-red-100 text-red-700 border-red-300"
            }`}
          >
            {pde.active ? "Activo" : "Inactivo"}
          </Badge>
        </CardContent>
      </Card>
    </Link>
  );
}
