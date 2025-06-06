// src/hooks/useProtectRouteByLevels.ts
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function useProtectRouteByLevels(allowedLevels: number[]) {
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    const noTienePermiso = !user || !allowedLevels.includes(user.level);
    if (noTienePermiso) {
      router.replace("/unauthorized");
    }
  }, [user]);
}
