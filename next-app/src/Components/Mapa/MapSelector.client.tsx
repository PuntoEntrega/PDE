"use client"
//MapSelector.client.tsx
import dynamic from "next/dynamic"

const MapSelector = dynamic(() => import("./MapSelector"), {
  ssr: false,
})

export default MapSelector
