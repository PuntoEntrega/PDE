// src/lib/routeAllowedLevels.ts
export const RoleLevels = {
  OwnerAplicativo: 7,
  SuperAdminAplicativo: 6,
  SoporteAplicativo: 5,
  SuperAdminEmpresa: 4,
  AdministradorEmpresa: 3,
  AdminPdE: 2,
  OperadorPdE: 1,
} as const;

// routeMinLevels.ts
export const routeAllowedLevels: Record<string, number[]> = {
  "/dashboard": [4, 5, 6, 7],
  "/configuration/profile": [3, 4, 5, 7],
  "/configuration/company": [3, 4, 5, 6, 7],
  "/configuration/pde": [3, 4, 5, 6, 7],
  "/configuration/status-info": [3, 4, 5, 6, 7],
  "/admin-panel": [4, 5, 6, 7],
  "/": [1, 2, 3, 4, 5, 6, 7],
};
