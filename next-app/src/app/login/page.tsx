"use client"

import { useState } from "react"
import { LoginForm } from "@/Components/Login/login-form"
import { ForgotPassword } from "@/Components/Login/forgot-password"
import { AlertProvider } from "@/Components/alerts/alert-provider"
import './index.css'

export default function LoginPage() {
  const [showForgotPassword, setShowForgotPassword] = useState(false)

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
      <div className="absolute inset-0 bg-white/60 backdrop-blur-md"></div>

      {/* Contenido principal */}
      <div className="card_Login_Container relative z-10">
        <AlertProvider />
        {showForgotPassword ? (
          <ForgotPassword onBack={() => setShowForgotPassword(false)} />
        ) : (
          <LoginForm onForgotPassword={() => setShowForgotPassword(true)} />
        )}
      </div>
    </div>
  )
}
