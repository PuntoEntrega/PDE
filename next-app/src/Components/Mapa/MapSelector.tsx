"use client"

import { MapContainer, TileLayer, Marker } from "react-leaflet"
import { useState, useEffect, forwardRef, useImperativeHandle } from "react"
import L from "leaflet"

// Corrige los iconos
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
})

export type MapSelectorRef = {
  locateUser: () => void
}

type MapSelectorProps = {
  onLocationSelect: (lat: number, lng: number) => void
  initialLat?: number
  initialLng?: number
}

const MapSelector = forwardRef<MapSelectorRef, MapSelectorProps>(
  ({ onLocationSelect, initialLat = 9.934739, initialLng = -84.087502 }, ref) => {
    const [position, setPosition] = useState<[number, number]>([initialLat, initialLng])
    const [map, setMap] = useState<L.Map | null>(null)  

    // Exponemos el método locateUser() al padre
    useImperativeHandle(ref, () => ({
      locateUser: () => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            ({ coords }) => {
              const { latitude, longitude } = coords
              setPosition([latitude, longitude])
              onLocationSelect(latitude, longitude)
              if (map) map.setView([latitude, longitude], 15)
            },
            (err) => {
              alert("No se pudo obtener tu ubicación: " + err.message)
            },
            { enableHighAccuracy: true },
          )
        } else {
          alert("Tu navegador no soporta geolocalización.")
        }
      },
    }))

    // Maneja clics manuales en el mapa
    useEffect(() => {
      if (!map) return

      function handleClick(e: L.LeafletMouseEvent) {
        const { lat, lng } = e.latlng
        setPosition([lat, lng])
        onLocationSelect(lat, lng)
      }

      map.on("click", handleClick)
      return () => {
        map.off("click", handleClick)
      }
    }, [map, onLocationSelect])

    return (
      <MapContainer
        center={position}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        whenCreated={setMap}
        scrollWheelZoom
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={position} />
      </MapContainer>
    )
  },
)

export default MapSelector
