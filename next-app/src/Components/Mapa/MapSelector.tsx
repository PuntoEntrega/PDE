"use client"

import { MapContainer, TileLayer, Marker } from "react-leaflet"
import { useState, useEffect, forwardRef, useImperativeHandle } from "react"
import L from "leaflet"
import LeafletGeocoder from "./LeafletGeocoder"
import './index.css'

// Corrige los iconos de Leaflet
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

    // Exponemos el método locateUser() al padre
    useImperativeHandle(ref, () => ({
      locateUser: () => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            ({ coords }) => {
              const { latitude, longitude } = coords
              setPosition([latitude, longitude])
              onLocationSelect(latitude, longitude)
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

    // Autolocaliza al cargar el mapa (solo una vez)
    useEffect(() => {
      if (!navigator.geolocation) return
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          const { latitude, longitude } = coords
          setPosition([latitude, longitude])
          onLocationSelect(latitude, longitude)
        },
        (err) => {
          // No bloquea el render si no hay ubicación
          console.warn("Ubicación no disponible:", err.message)
        },
        { enableHighAccuracy: true }
      )
    }, []) // Solo al montar

    return (
      <MapContainer
        center={position}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={position} />
        {/* LeafletGeocoder notifica si se hace una búsqueda */}
        <LeafletGeocoder
          onGeocode={(lat, lng) => {
            setPosition([lat, lng])
            onLocationSelect(lat, lng)
          }}
        />
        {/* Puedes agregar más controles hijos aquí si necesitas */}
      </MapContainer>
    )
  }
)

export default MapSelector
