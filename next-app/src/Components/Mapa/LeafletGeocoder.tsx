"use client"

import { useEffect } from "react"
import { useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet-control-geocoder/dist/Control.Geocoder.css"
import * as LControlGeocoder from "leaflet-control-geocoder"

type GeocoderProps = {
  onGeocode?: (lat: number, lng: number) => void
}

export default function LeafletGeocoder({ onGeocode }: GeocoderProps) {
  const map = useMap()

  useEffect(() => {
    const geocoder = L.Control.geocoder({
      defaultMarkGeocode: true,
      geocoder: LControlGeocoder.Geocoder.nominatim()
    })
      .on("markgeocode", (e: any) => {
        const { center } = e.geocode
        map.setView(center, 15)
        if (onGeocode) onGeocode(center.lat, center.lng)
      })
      .addTo(map)

    return () => {
      map.removeControl(geocoder)
    }
  }, [map, onGeocode])

  return null
}
