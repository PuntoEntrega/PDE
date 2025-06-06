// src/app/configuration/pde/layout.tsx
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { redirect } from "next/navigation";
import { routeAllowedLevels } from "@/lib/routeMinLevels";

export default async function PdELayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1) Leemos el token directamente en el servidor
  const token = cookies().get("token")?.value;
  if (!token) {
    // Si no hay token, redirige antes de enviar HTML
    redirect("/login");
  }

  try {
    // 2) Verificamos el JWT en el servidor
    const JWT_SECRET = process.env.JWT_SECRET!;
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET)
    );

    // 3) Calculamos el nivel numérico del usuario
    const userLevel = (payload as any).level as number;

    // 4) Comparamos contra los niveles permitidos para esta ruta
    //    routeAllowedLevels["/configuration/pde"] puede ser [3, 4], por ejemplo
    const allowed = routeAllowedLevels["/configuration/pde"] ?? [];
    if (!allowed.includes(userLevel)) {
      redirect("/unauthorized");
    }

    // 5) Si todo ok, renderiza children
    return <>{children}</>;
  } catch {
    // Token inválido o expirado → redirige a /login
    console.log('catch');
    
    redirect("/login");
  }
}
