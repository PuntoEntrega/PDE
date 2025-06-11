"use client"

import type React from "react"
import './index.css'

import logoApp from '../../../public/logo_sin_texto.png'
import { useState } from "react"
import Link from "next/link"
import Icono from '../../../public/Icono.svg'
import Image from "next/image"
import { cn } from "../../../lib/utils"
import { useRouter } from "next/navigation"
import { jwtDecode } from "jwt-decode"
import { useUser } from "@/context/UserContext"

interface DecodedToken {
  sub: string
  role: string
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
  Package,
  User,
  BarChart2,
  Store,
  Menu,
  HelpCircle,
  Settings,
  ChevronDown,
  LogOut,
  Bell,
  Search,
  Home,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu"

export function Sidebar({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const router = useRouter()
  const { user } = useUser()

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const logout = async () => {
    await fetch("/api/logout", {
      method: "GET",
      credentials: "include", // para asegurarte de enviar las cookies junto con la petición (aunque no sean necesarias aquí)
    });
    localStorage.removeItem("token");
    localStorage.removeItem("relationedCompany");
    console.log('Cookie token removido');
    router.push("/login");
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
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
                  <Image src={logoApp} alt="Logo" className="centrar p-1" />
                </div>
                <span className="ml-3 font-bold text-orange-700 text-lg font-semibold">PuntoEntrega</span>
              </div>
            </Link>
          ) : (
            <Link href="/dashboard">
              <div className="flex justify-center w-full">
                <div className={`${isSidebarOpen ? 'w-0 h-0' : 'w-12 h-12'} rounded-xl bg-white transition-colors flex items-center justify-center `}>
                  <Image src={logoApp} alt={'Logo'} className="centrar p-2" />
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
              <SidebarItem icon={Home} label="Inicio" isOpen={isSidebarOpen} isActive={true} />
              <SidebarItem icon={Package} label="Paquetes" isOpen={isSidebarOpen} />
              <SidebarItem icon={Clock} label="Historial" isOpen={isSidebarOpen} />
              <SidebarItem icon={User} label="Clientes" isOpen={isSidebarOpen} />
            </nav>
          </div>

          <div className="px-3 py-4 border-t border-blue-800/30">
            {isSidebarOpen && (
              <div className="mb-4 px-2">
                <p className="text-xs font-semibold text-blue-200 uppercase tracking-wider">Administración</p>
              </div>
            )}
            <nav className="space-y-1">
              <SidebarItem icon={BarChart2} label="Estadísticas" isOpen={isSidebarOpen} />
              <SidebarItem icon={Store} label="Puntos de Entrega" isOpen={isSidebarOpen} />
              <SidebarItem icon={Settings} label="Configuración" isOpen={isSidebarOpen} />
              <SidebarItem icon={HelpCircle} label="Ayuda" isOpen={isSidebarOpen} />
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

      {/* Main content */}
      <div
        className={cn(
          "flex flex-col flex-1 transition-all duration-300 ease-in-out",
          isSidebarOpen ? "ml-64" : "ml-20",
        )}
      >
        {/* Header */}
        <header className="h-20 bg-white border-b flex items-center justify-end px-6 shadow-sm z-5">


          <div className="flex items-center space-x-4">
            {/* Notificaciones */}
            <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <Bell className="w-6 h-6" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User profile */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center space-x-3 focus:outline-none hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors">
                <span className="text-gray-700 font-medium">{user?.first_name}</span>
                <div className={`w-10 h-10 rounded-full overflow-hidden flex items-center justify-center ${user?.avatar_url ? 'bg-white': 'bg-gradient-to-br from-blue-500 to-blue-700'} 'text-white'`}>
                  {user?.avatar_url ? (
                    /* ✅  Mostrar la foto si existe */
                    <Image
                      src={user.avatar_url}
                      alt="Avatar"
                      width={100}
                      height={100}
                      className="object-cover"
                    />
                  ) : (
                    /* 🔄  Fallback a iniciales */
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
                <DropdownMenuItem className={`select text-red-500`}>
                  <LogOut className="mr-2 h-4 w-4 p-1.2 rounded-xl" />
                  <span onClick={() => logout()}>Cerrar sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}

interface SidebarItemProps {
  icon: React.ElementType
  label: string
  isOpen: boolean
  isActive?: boolean
}

function SidebarItem({ icon: Icon, label, isOpen, isActive = false }: SidebarItemProps) {
  return (
    <Link
      href="#"
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