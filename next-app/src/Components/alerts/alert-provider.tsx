"use client"

import { AlertNotification } from "./alert-notification"
import { useAlert } from "./use-alert"

export function AlertProvider() {
  const { alerts, removeAlert } = useAlert()

  return (
    <>
      {alerts.map((alert, index) => (
        <div
          key={alert.id}
          style={{
            position: "fixed",
            top: `${(index + 1) * 16 + index * 80}px`,
            right: "16px",
            zIndex: 50,
          }}
        >
          <AlertNotification
            type={alert.type}
            title={alert.title}
            message={alert.message}
            duration={alert.duration}
            onClose={() => removeAlert(alert.id)}
          />
        </div>
      ))}
    </>
  )
}
