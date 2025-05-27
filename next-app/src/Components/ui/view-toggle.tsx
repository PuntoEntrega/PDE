"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { cn } from "../../../lib/utils"

export type ToggleOption = {
  id: string
  label: string
  icon: React.ReactNode
}

type ViewToggleProps = {
  options: ToggleOption[]
  defaultValue?: string
  storageKey: string
  orientation?: "horizontal" | "vertical"
  className?: string
  iconOnly?: boolean | "responsive" // true, false, or "responsive" for responsive behavior
  onChange?: (value: string) => void
  activeColor?: string
  inactiveColor?: string
}

export function ViewToggle({
  options,
  defaultValue,
  storageKey,
  orientation = "horizontal",
  className,
  iconOnly = "responsive",
  onChange,
  activeColor = "#0Cb7AF",
  inactiveColor = "#4B5563",
}: ViewToggleProps) {
  // Initialize state from localStorage or default
  const [activeOption, setActiveOption] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(storageKey)
      // Check if saved value is valid (exists in options)
      if (saved && options.some((option) => option.id === saved)) {
        return saved
      }
    }
    return defaultValue || options[0]?.id || ""
  })

  // Sync with localStorage when state changes
  useEffect(() => {
    if (activeOption) {
      localStorage.setItem(storageKey, activeOption)
    }
  }, [activeOption, storageKey])

  // Handle option selection
  const handleSelect = (optionId: string) => {
    setActiveOption(optionId)
    onChange?.(optionId)
  }

  return (
    <div className={cn("flex gap-2", orientation === "horizontal" ? "flex-row" : "flex-col", className)}>
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => handleSelect(option.id)}
          className={cn(
            "flex items-center gap-2 transition-all rounded-md focus:outline-none",
            orientation === "horizontal"
              ? "px-4 py-2 border-b-2 hover:bg-gray-50"
              : "p-4 border hover:border-[#0Cb7AF] hover:text-[#0Cb7AF]",
            activeOption === option.id
              ? orientation === "horizontal"
                ? "border-b-[#0Cb7AF]"
                : "border-2 border-[#0Cb7AF] text-[#0Cb7AF]"
              : orientation === "horizontal"
                ? "border-b-transparent"
                : "border-gray-200 text-gray-600",
          )}
        >
          <div
            className="transition-colors"
            style={{ color: activeOption === option.id ? activeColor : inactiveColor }}
          >
            {option.icon}
          </div>

          {/* Show label based on iconOnly prop */}
          {(iconOnly === false || (iconOnly === "responsive" && orientation === "horizontal")) && (
            <span
              className={cn(
                "transition-colors font-medium",
                orientation === "horizontal" ? "text-base" : "text-sm",
                iconOnly === "responsive" && "hidden sm:inline",
              )}
              style={{ color: activeOption === option.id ? activeColor : inactiveColor }}
            >
              {option.label}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
