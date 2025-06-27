import { useMap } from 'react-leaflet'
import { useEffect } from 'react'

function SetMapRef({ mapRef }: { mapRef: React.MutableRefObject<any> }) {
  const map = useMap()

  useEffect(() => {
    mapRef.current = map
  }, [map])

  return null
}
