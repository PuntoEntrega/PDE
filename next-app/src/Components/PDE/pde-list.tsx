"use client";

import { useEffect, useState } from "react";
import { getPDEList } from "@/Services/pde/pde";
import { useUser } from "@/context/UserContext";
import { PDETable } from "./pde-table";
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
    <div className="p-6">
      <PDETable pdes={pdes} />
    </div>
  );
}
