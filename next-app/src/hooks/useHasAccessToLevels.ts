// src/hooks/useHasAccessToLevels.ts
import { useUser } from "@/context/UserContext";

export function useHasAccessToLevels(allowedLevels: number[]) {
  const { user } = useUser();
  if (!user) return false;
  return allowedLevels.includes(user.level);
}
