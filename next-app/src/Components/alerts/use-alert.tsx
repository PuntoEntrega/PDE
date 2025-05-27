"use client"

import { create } from "zustand"
import type { AlertType } from "./alert-notification"

interface AlertState {
  alerts: Array<{
    id: string
    type: AlertType
    title: string
    message?: string
    duration?: number
  }>
  showAlert: (type: AlertType, title: string, message?: string, duration?: number) => void
  removeAlert: (id: string) => void
}

export const useAlert = create<AlertState>((set) => ({
  alerts: [],
  showAlert: (type, title, message, duration = 5000) => {
    const id = Date.now().toString()
    set((state) => ({
      alerts: [...state.alerts, { id, type, title, message, duration }],
    }))
  },
  removeAlert: (id) => {
    set((state) => ({
      alerts: state.alerts.filter((alert) => alert.id !== id),
    }))
  },
}))
