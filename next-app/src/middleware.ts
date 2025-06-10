// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { routeAllowedLevels } from "@/lib/routeMinLevels";

// ————————————————————————————————————
// 1. Rutas públicas
// ————————————————————————————————————
const PUBLIC_PREFIXES = [
  "/login",
  "/register",
  "/api/login",
  "/api/logout",
  "/api/register",
  "/api/document-types",
  "/unauthorized",
  "/_next",
  "/favicon.ico",
  "/fonts/",
  "/robots.txt",
];

/** Normaliza ruta: quita barra final salvo "/" */
function stripTrailingSlash(path: string) {
  return path !== "/" && path.endsWith("/") ? path.slice(0, -1) : path;
}

/** ¿Es pública?  Coincidencia exacta o empieza por prefijo + "/" */
function isPublic(pathname: string) {
  const clean = stripTrailingSlash(pathname);
  return PUBLIC_PREFIXES.some(
    (prefix) => clean === prefix || clean.startsWith(prefix + "/"),
  );
}

// ————————————————————————————————————
// 2. Comprobación de nivel
// ————————————————————————————————————
function hasAllowedLevel(pathname: string, level: number) {
  const clean = stripTrailingSlash(pathname);
  for (const prefix in routeAllowedLevels) {
    if (clean === prefix || clean.startsWith(prefix + "/")) {
      return routeAllowedLevels[prefix].includes(level);
    }
  }
  return true; // no figura → acceso libre con token válido
}

// ————————————————————————————————————
// 3. Middleware
// ————————————————————————————————————
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isPublic(pathname)) return NextResponse.next();

  const token = req.cookies.get("token")?.value;
  if (!token) {
    console.log(token);

    console.debug("[MW] Sin token → /login");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const JWT_SECRET = process.env.JWT_SECRET!;
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET),
    );

    const level = (payload as any).level ?? 0;
    console.debug(`[MW] level=${level} path=${pathname}`);

    if (!hasAllowedLevel(pathname, level)) {
      console.debug("[MW] Nivel insuficiente → /unauthorized");
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    // OK
    return NextResponse.next();
  } catch (err) {
    console.debug("[MW] Token inválido → /login", err);
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = { matcher: ["/:path*"] };