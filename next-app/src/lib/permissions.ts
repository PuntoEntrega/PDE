// src/lib/permissions.ts

// Para entender qué representa cada nivel
export const RoleLevels = {
  OwnerAplicativo: 7,
  SuperAdminAplicativo: 6,
  SoporteAplicativo: 5,
  SuperAdminEmpresa: 4,
  AdministradorEmpresa: 3,
  AdminPdE: 2,
  AsistentePdE: 1,
} as const;

// Páginas protegidas por nivel mínimo de acceso
export const routePermissions: { [path: string]: number[] } = {
  "/admin-app": [7, 6], // Solo Owner y SuperAdmin del aplicativo
  "/configuracion-empresa": [4, 3],
  "/punto-entrega": [2],
  "/dashboard": [7, 6, 5, 4, 3], // casi todos menos PdE
};
