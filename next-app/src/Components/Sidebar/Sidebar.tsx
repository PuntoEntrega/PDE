"use client"

// SIDEBAR RESPONSIVO 100% NO FAKE
import type React from "react"
import "./index.css"
import logoApp from "../../../public/logo_sin_texto.png"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { cn } from "../../../lib/utils"
import { useRouter, usePathname } from "next/navigation"
import { useUser } from "@/context/UserContext"
import { useIsMobile } from "@/hooks/use-mobile"

interface DecodedToken {
  sub: string
  role: string
  status: string
  first_name: string
  last_name: string
  email: string
  active: boolean
  exp: number
  iat: number
  [key: string]: any
}

import {
  Clock,
  User,
  BarChart2,
  Store,
  Menu,
  HelpCircle,
  Settings,
  ChevronDown,
  LogOut,
  Bell,
  Home,
  Building,
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu"
import { Button } from "../ui/button"

interface SidebarProps {
  children: React.ReactNode
  userName?: string
}

export function Sidebar({ children, userName }: SidebarProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useUser()
  const isMobile = useIsMobile()

  const navItems = [
    // sección Principal
    { label: "Inicio", icon: Home, path: "/dashboard", section: "main" },
    { label: "Empresas", icon: Building, path: "/companies", section: "main" },
    { label: "Colaboradores", icon: User, path: "/collaborators", section: "main" },
    { label: "Clientes", icon: Clock, path: "/clients", section: "main" },
    // sección Administración
    { label: "Estadísticas", icon: BarChart2, path: "/stats", section: "admin" },
    { label: "Puntos de Entrega", icon: Store, path: "/pde", section: "admin" },
    { label: "Configuración", icon: Settings, path: "/settings", section: "admin" },
    { label: "Ayuda", icon: HelpCircle, path: "/help", section: "admin" },
  ]

  // Obtén el rol y el estado actual del user
  const { role, status } = user ?? { role: "", status: "" }

  // Lógica de filtro
  const visibleItems = navItems.filter((item) => {
    // Caso especial: SuperAdminEmpresa en estado draf/under_review
    if (role === "SuperAdminEmpresa" && (status === "draft" || status === "under_review")) {
      return item.label === "Inicio"
    }
    // Para cualquier otro usuario, mostrar todo
    return true
  })

  const mainItems = visibleItems.filter((i) => i.section === "main")
  const adminItems = visibleItems.filter((i) => i.section === "admin")

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const logout = async () => {
    await fetch("/api/logout", {
      method: "GET",
      credentials: "include",
    })
    localStorage.removeItem("token")
    localStorage.removeItem("relationedCompany")
    console.log("Cookie token removido")
    router.push("/login")
  }

  // En mobile, renderizamos un layout diferente
  if (isMobile) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        {/* Header Mobile */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-4 shadow-sm z-10">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center">
            <div className="w-8 h-8 rounded-lg bg-white">
              <Image src={logoApp || "/placeholder.svg"} alt="Logo" className="p-1" />
            </div>
            <span className="ml-2 font-bold text-orange-700 text-lg">PuntoEntrega</span>
          </Link>

          {/* User profile y notificaciones */}
          <div className="flex items-center space-x-3">
            {/* Notificaciones */}
            <Button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button> 

            {/* User profile */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center focus:outline-none">
                <div
                  className={`w-8 h-8 rounded-full overflow-hidden flex items-center justify-center ${user?.avatar_url ? "bg-white" : "bg-gradient-to-br from-blue-500 to-blue-700"} text-white`}
                >
                  {user?.avatar_url ? (
                    <Image
                      src={user.avatar_url || "/placeholder.svg"}
                      alt="Avatar"
                      width={32}
                      height={32}
                      className="object-cover"
                    />
                  ) : (
                    <span className="text-xs font-semibold">
                      {(user?.first_name ?? "")
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </span>
                  )}
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white p-2.5">
                <DropdownMenuItem className="select">
                  <User className="mr-2 h-4 w-4" />
                  <span>Mi perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="select">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configuración</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="select text-red-500">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span onClick={() => logout()}>Cerrar sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto pb-20">{children}</main>

        {/* Bottom Navigation */}
        <MobileBottomNav items={visibleItems} currentPath={pathname} />
      </div>
    )
  }

  // Desktop layout (tu código original)
  return (
    <div className="flex bg-gray-50 overflow-hidden">
      {/* Sidebar Desktop */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-10 flex flex-col bg-gradient-to-b from-[#1a2b57] to-[#2a3b67] text-white transition-all duration-300 ease-in-out shadow-xl",
          isSidebarOpen ? "w-64" : "w-20",
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-center h-20 border-b border-blue-800/30 flex-shrink-0">
          {isSidebarOpen ? (
            <Link href="/dashboard">
              <div className="flex items-center bg-white rounded-xl px-6 py-0.5">
                <div className="w-12 h-15 rounded-lg bg-white">
                  <Image src={logoApp || "/placeholder.svg"} alt="Logo" className="centrar p-1" />
                </div>
                <span className="ml-3 font-bold text-orange-700 text-lg font-semibold">PuntoEntrega</span>
              </div>
            </Link>
          ) : (
            <Link href="/dashboard">
              <div className="flex justify-center w-full">
                <div
                  className={`${isSidebarOpen ? "w-0 h-0" : "w-12 h-12"} rounded-xl bg-white transition-colors flex items-center justify-center `}
                >
                  <Image src={logoApp || "/placeholder.svg"} alt={"Logo"} className="centrar p-2" />
                </div>
              </div>
            </Link>
          )}
        </div>

        {/* Navigation - Scrollable area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-blue-800 scrollbar-track-transparent">
          <div className="px-3 py-4">
            {isSidebarOpen && (
              <div className="mb-4 px-2">
                <p className="text-xs font-semibold text-blue-200 uppercase tracking-wider">Principal</p>
              </div>
            )}
            <nav className="space-y-1">
              {mainItems.map((item) => (
                <SidebarItem
                  key={item.label}
                  icon={item.icon}
                  label={item.label}
                  isOpen={isSidebarOpen}
                  isActive={pathname === item.path}
                  href={item.path}
                />
              ))}
            </nav>
          </div>

          <div className="px-3 py-4 border-t border-blue-800/30">
            {isSidebarOpen && (
              <div className="mb-4 px-2">
                <p className="text-xs font-semibold text-blue-200 uppercase tracking-wider">Administración</p>
              </div>
            )}
            <nav className="space-y-1">
              {adminItems.map((item) => (
                <SidebarItem
                  key={item.label}
                  icon={item.icon}
                  label={item.label}
                  isOpen={isSidebarOpen}
                  isActive={pathname === item.path}
                  href={item.path}
                />
              ))}
            </nav>
          </div>
        </div>

        {/* Toggle button */}
        <button
          onClick={toggleSidebar}
          className="absolute top-5 -right-3 bg-white text-blue-700 rounded-full p-1.5 shadow-lg hover:bg-gray-100 z-20 transition-colors"
          aria-label={isSidebarOpen ? "Cerrar menú" : "Abrir menú"}
        >
          <Menu size={14} />
        </button>
      </aside>

      {/* Main content Desktop */}
      <div
        className={cn(
          "flex flex-col flex-1 transition-all duration-300 ease-in-out",
          isSidebarOpen ? "ml-64" : "ml-20",
        )}
      >
        {/* Header Desktop */}
        <header className="h-20 bg-white border-b flex items-center justify-end px-6 shadow-sm z-5">
          <div className="flex items-center space-x-4">
            {/* Notificaciones */}
            <Button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <Bell className="w-6 h-6" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>

            {/* User profile */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center space-x-3 focus:outline-none hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors">
                <span className="text-gray-700 font-medium">{user?.first_name}</span>
                <div
                  className={`w-10 h-10 rounded-full overflow-hidden flex items-center justify-center ${user?.avatar_url ? "bg-white" : "bg-gradient-to-br from-blue-500 to-blue-700"} text-white`}
                >
                  {user?.avatar_url ? (
                    <Image
                      src={user.avatar_url || "/placeholder.svg"}
                      alt="Avatar"
                      width={100}
                      height={100}
                      className="object-cover"
                    />
                  ) : (
                    <span className="text-sm font-semibold">
                      {(user?.first_name ?? "")
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </span>
                  )}
                </div>
                <ChevronDown size={16} className="text-gray-500" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-56 bg-white p-2.5">
                <DropdownMenuItem className="select">
                  <User className="mr-2 h-4 w-4 p-1.2" />
                  <span>Mi perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="select">
                  <Settings className="mr-2 h-4 w-4 p-1.2 rounded-xl" />
                  <span>Configuración</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="select text-red-500">
                  <LogOut className="mr-2 h-4 w-4 p-1.2 rounded-xl" />
                  <span onClick={() => logout()}>Cerrar sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content Desktop */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}

// Componente para la navegación inferior en mobile
interface MobileBottomNavProps {
  items: Array<{
    label: string
    icon: React.ElementType
    path: string
    section: string
  }>
  currentPath: string
}

function MobileBottomNav({ items, currentPath }: MobileBottomNavProps) {
  // Calculamos el tamaño de los íconos basado en la cantidad de items
  const getIconSize = (itemCount: number) => {
    if (itemCount <= 4) return "w-6 h-6"
    if (itemCount <= 6) return "w-5 h-5"
    return "w-4 h-4"
  }

  // Calculamos el tamaño del texto basado en la cantidad de items
  const getTextSize = (itemCount: number) => {
    if (itemCount <= 4) return "text-xs"
    if (itemCount <= 6) return "text-[10px]"
    return "text-[9px]"
  }

  const iconSize = getIconSize(items.length)
  const textSize = getTextSize(items.length)

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 z-20">
      <div className="flex justify-around items-center max-w-screen-xl mx-auto">
        {items.map((item) => {
          const isActive = currentPath === item.path
          const Icon = item.icon

          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "flex flex-col items-center justify-center py-1 px-1 rounded-lg transition-all duration-200 min-w-0 flex-1",
                isActive ? "text-blue-600 bg-blue-50" : "text-gray-600 hover:text-blue-600 hover:bg-gray-50",
              )}
            >
              <Icon className={cn(iconSize, "mb-1 flex-shrink-0")} />
              <span
                className={cn(
                  textSize,
                  "font-medium truncate w-full text-center leading-tight",
                  isActive && "font-semibold",
                )}
              >
                {item.label}
              </span>
              {isActive && <div className="w-1 h-1 rounded-full bg-blue-600 mt-0.5"></div>}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

// Componente SidebarItem para desktop (sin cambios)
interface SidebarItemProps {
  icon: React.ElementType
  label: string
  isOpen: boolean
  isActive?: boolean
  href?: string
}

function SidebarItem({ icon: Icon, label, isOpen, isActive, href }: SidebarItemProps) {
  return (
    <Link
      href={href || "#"}
      className={cn(
        "flex items-center py-3 px-3 rounded-xl transition-all duration-200 group",
        isActive ? "bg-blue-700/50 text-white" : "text-gray-300 hover:bg-blue-700/30 hover:text-white",
        !isOpen && "justify-center",
      )}
      title={label}
    >
      <div className={cn("flex items-center justify-center", !isOpen && "w-full")}>
        <Icon className={cn("h-5 w-5 flex-shrink-0 transition-transform", isActive && "text-white")} />
      </div>
      {isOpen && <span className={cn("ml-3 truncate font-medium", isActive && "font-semibold")}>{label}</span>}
      {isOpen && isActive && <div className="w-1.5 h-1.5 rounded-full bg-blue-300 ml-auto"></div>}
    </Link>
  )
}
