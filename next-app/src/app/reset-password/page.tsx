"use client"

import { ResetPasswordForm } from "@/Components/Login/reset-password"
import { AlertProvider } from "@/Components/alerts/alert-provider"
import "./../login/index.css" // Reutiliza los estilos del login si están ahí

export default function ResetPasswordPage() {
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
      {/* Overlay blanco semitransparente y blur */}
      <div className="absolute inset-0 bg-white/60 backdrop-blur-md" />

      {/* Tarjeta central */}
      <div className="card_Login_Container relative z-10">
        <AlertProvider />
        <ResetPasswordForm />
      </div>
    </div>
  )
}
