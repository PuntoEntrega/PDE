"use client"

import { useEffect, useState } from "react"
import { AlertCircle, CheckCircle, Info, X, XCircle } from "lucide-react"
import { cn } from "../../../lib/utils"

export type AlertType = "success" | "error" | "warning" | "info"

interface AlertNotificationProps {
  type: AlertType
  title: string
  message?: string
  duration?: number
  onClose?: () => void
}

const alertStyles = {
  success: {
    container: "bg-white",
    iconContainer: "bg-green-100",
    icon: "text-green-600",
    title: "text-green-800",
    message: "text-green-700",
  },
  error: {
    container: "bg-white",
    iconContainer: "bg-red-100",
    icon: "text-red-600",
    title: "text-red-800",
    message: "text-red-700",
  },
  warning: {
    container: "bg-white",
    iconContainer: "bg-yellow-100",
    icon: "text-yellow-600",
    title: "text-yellow-800",
    message: "text-yellow-700",
  },
  info: {
    container: "bg-white",
    iconContainer: "bg-blue-100",
    icon: "text-blue-600",
    title: "text-blue-800",
    message: "text-blue-700",
  },
}

const alertIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
}

export function AlertNotification({ type, title, message, duration = 5000, onClose }: AlertNotificationProps) {
  const [isVisible, setIsVisible] = useState(true)
  const styles = alertStyles[type]
  const Icon = alertIcons[type]

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        onClose?.()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  if (!isVisible) return null

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50 max-w-md w-full animate-in slide-in-from-top-2 fade-in duration-300",
        "rounded-lg border shadow-lg",
        styles.container,
      )}
    >
      <div className="flex items-center p-4">
        <div className={cn("flex-shrink-0 mr-3", "rounded-full p-2", styles.iconContainer)}>
          <Icon className={cn("h-5 w-5", styles.icon)} />
        </div>
        <div className="flex-1">
          <h3 className={cn("font-medium", styles.title)}>{title}</h3>
          {message && <p className={cn("mt-1 text-sm", styles.message)}>{message}</p>}
        </div>
        <button
          onClick={() => {
            setIsVisible(false)
            onClose?.()
          }}
          className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
