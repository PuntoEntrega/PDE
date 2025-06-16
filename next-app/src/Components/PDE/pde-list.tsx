"use client";

import { useEffect, useState } from "react";
import { getPDEList } from "@/Services/pde";
import { useUser } from "@/context/UserContext";
import { PDECard } from "./pde-card";
import { Loader2 } from "lucide-react";

export function PDEList() {
  const { user } = useUser();
  const [pdes, setPDEs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPDEs() {
      setLoading(true);
      try {
        const data = await getPDEList(user?.sub!);
        setPDEs(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (user?.sub) {
      fetchPDEs();
    }
  }, [user]);

  if (loading) return <Loader2 className="animate-spin" />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
      {pdes.map((pde) => (
        <PDECard key={pde.id} pde={pde} />
      ))}
    </div>
  );
}
