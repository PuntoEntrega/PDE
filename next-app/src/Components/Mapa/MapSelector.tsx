"use client"

import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvent,
  useMap,
} from "react-leaflet"
import L from "leaflet"
import {
  forwardRef,
  useImperativeHandle,
  useEffect,
  useRef,
  useState,
} from "react"
import LeafletGeocoder from "./LeafletGeocoder"
import { reverseGeocode } from "@/lib/map/reverseGeocode"
import "leaflet/dist/leaflet.css"
import "./index.css"
import { AnyARecord } from "node:dns"

/* ------------------ fix iconos ------------------ */
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

/* ------------------- tipos ---------------------- */
export type MapSelectorRef = {
  locateUser: () => Promise<[number, number] | null>
  panTo: (coords: [number, number], zoom?: number) => void
}

type MapSelectorProps = {
  onLocationSelect?: (json: any) => void
  initialCenter?: [number, number]
  initialZoom?: number
}

/* Handler para clicks en el mapa */
function MapClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvent("click", (e) => onClick(e.latlng.lat, e.latlng.lng))
  return null
}

const MapSelector = forwardRef<MapSelectorRef, MapSelectorProps>(
  (
    {
      onLocationSelect,
      initialCenter = [9.7489, -83.7534], // centro CR
      initialZoom = 14,
    },
    ref,
  ) => {
    const [position, setPosition] = useState<[number, number] | null>(null)
    const mapRef = useRef<L.Map | null>(null)

    /* -------- función única para mover marker + centrar + notificar -------- */
    const moveMarker = async (lat: number, lng: number, zoom = 17) => {
      setPosition([lat, lng])
      mapRef.current?.setView([lat, lng], zoom)      // 👈 centra SIEMPRE
      if (onLocationSelect) {
        const json = await reverseGeocode(lat, lng)
        onLocationSelect(json)
      }
    }

    const locateUser = (): Promise<[number, number] | null> =>
      new Promise((resolve) => {
        if (!navigator.geolocation) return resolve(null)

        navigator.geolocation.getCurrentPosition(
          async ({ coords }) => {
            const pos: [number, number] = [coords.latitude, coords.longitude]
            await moveMarker(...pos)
            resolve(pos)
          },
          () => resolve(null),
          { enableHighAccuracy: true },
        )
      })


    /* Exponer API al padre */
    useImperativeHandle(ref, () => ({
      locateUser,
      panTo: (coords, z = 17) => mapRef.current?.setView(coords, z),
    }))

    function SetMapRef({ mapRef }: { mapRef: React.MutableRefObject<any> }) {
      const map = useMap()

      useEffect(() => {
        mapRef.current = map
      }, [map])

      return null
    }
    /* Autolocalizar al montar */
    useEffect(() => {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => moveMarker(coords.latitude, coords.longitude, initialZoom),
        () => moveMarker(initialCenter[0], initialCenter[1], initialZoom),
      )
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    if (!position) {
      return <div className="h-[400px] bg-muted/30 animate-pulse rounded-lg w-full" />
    }

    return (
      <MapContainer
        center={position}
        zoom={13}
        scrollWheelZoom
        className="h-full w-full"
      >
        <SetMapRef mapRef={mapRef} />
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      </MapContainer>
    )
  },
)

MapSelector.displayName = "MapSelector"
export default MapSelector
