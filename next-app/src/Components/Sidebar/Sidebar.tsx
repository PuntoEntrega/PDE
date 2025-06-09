"use client"

import type React from "react"
import { Home, Settings, Users, LogOut, Building } from "lucide-react"
import { usePathname } from "next/navigation"

const Sidebar: React.FC = () => {
  const pathname = usePathname()

  return (
    <aside className="w-64" aria-label="Sidebar">
      <div className="overflow-y-auto py-4 px-3 bg-gray-50 rounded dark:bg-gray-800">
        <ul className="space-y-2">
          <li>
            <a
              href="/"
              className={`flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 ${
                pathname === "/" ? "bg-gray-200 dark:bg-gray-700" : ""
              }`}
            >
              <Home className="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
              <span className="ml-3">Dashboard</span>
            </a>
          </li>
          <li>
            <a
              href="/companies"
              className={`flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 ${
                pathname === "/companies" ? "bg-gray-200 dark:bg-gray-700" : ""
              }`}
            >
              <Building className="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
              <span className="ml-3">Empresas</span>
            </a>
          </li>
          <li>
            <a
              href="/settings"
              className={`flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 ${
                pathname === "/settings" ? "bg-gray-200 dark:bg-gray-700" : ""
              }`}
            >
              <Settings className="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
              <span className="ml-3">Configuración</span>
            </a>
          </li>
          <li>
            <a
              href="/users"
              className={`flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 ${
                pathname === "/users" ? "bg-gray-200 dark:bg-gray-700" : ""
              }`}
            >
              <Users className="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
              <span className="ml-3">Usuarios</span>
            </a>
          </li>
          <li>
            <a
              href="/logout"
              className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <LogOut className="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
              <span className="ml-3">Cerrar Sesión</span>
            </a>
          </li>
        </ul>
      </div>
    </aside>
  )
}

export default Sidebar
