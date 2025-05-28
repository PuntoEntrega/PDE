"use client"
import { RegisterForm } from "@/Components/register/register"
import { AlertProvider } from "@/Components/alerts/alert-provider"

export default function RegisterPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: "url('/warehouse-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Overlay para difuminar el fondo */}
      <div className="absolute inset-0 bg-white/40 backdrop-blur-sm"></div>

      {/* Contenido principal */}
      <div className="relative z-10">
        <AlertProvider />
        <RegisterForm />
      </div>
    </div>
  )
}