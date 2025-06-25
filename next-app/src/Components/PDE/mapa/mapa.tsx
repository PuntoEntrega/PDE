import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
//mapa.tsx

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
})

function ClickRedirectHandler({ latitude, longitude }: { latitude: number; longitude: number }) {
  useMap().on("click", () => {
    window.open(`https://www.google.com/maps?q=${latitude},${longitude}`, "_blank")
  })
  return null
}
