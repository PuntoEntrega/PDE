"use client"

import { useEffect } from "react"
import { useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet-control-geocoder" // ⬅️ este es el importante
import "leaflet-control-geocoder/dist/Control.Geocoder.css"

type GeocoderProps = {
  onGeocode?: (lat: number, lng: number) => void
}

export default function LeafletGeocoder({ onGeocode }: GeocoderProps) {
  const map = useMap()
  

  useEffect(() => {
    // @ts-ignore: Geocoder no tiene tipos correctos
    const geocoder = L.Control.geocoder({
      defaultMarkGeocode: true,
      // @ts-ignore: nominatim tampoco está tipado
      geocoder: L.Control.Geocoder.nominatim(),
    })
      .on("markgeocode", (e: any) => {
        const { center } = e.geocode
        map.setView(center, 15)
        if (onGeocode) onGeocode(center.lat, center.lng)
      })
      .addTo(map)

    setTimeout(() => {
      const el = document.querySelector(".leaflet-control-geocoder") as HTMLElement
      if (el) el.classList.add("custom-geocoder")
    }, 100)

    return () => {
      map.removeControl(geocoder)
    }
  }, [map, onGeocode])  

  return null
}
