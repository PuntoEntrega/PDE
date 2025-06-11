"use client"

import dynamic from "next/dynamic"

const MapSelector = dynamic(() => import("./MapSelector"), {
  ssr: false,
})

export default MapSelector