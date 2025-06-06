// src/hooks/useHasAccessToRoute.ts
import { useUser } from "@/context/UserContext";
import { routePermissions } from "@/lib/permissions";
import { usePathname } from "next/navigation";

export function useHasAccessToRoute(): boolean {
  const { user } = useUser();
  const pathname = usePathname();

  if (!user) return false;

  const allowedLevels = routePermissions[pathname];
  if (!allowedLevels) return true; // acceso libre si no está definido

  return allowedLevels.includes(user.level);
}
