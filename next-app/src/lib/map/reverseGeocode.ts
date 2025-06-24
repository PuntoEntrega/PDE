// lib/map/reverseGeocode.ts
export async function reverseGeocode(lat: number, lon: number) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`,
    { headers: { "User-Agent": "puntoentrega-app" } }
  );
  if (!res.ok) throw new Error("No se pudo obtener ubicación");

  const data = await res.json();
  const a = data.address ?? {};

  return {
    /* coordenadas */
    lat: +lat,
    lon: +lon,

    /* partes de la dirección — mismas llaves que tu BD  */
    country: a.country ?? null,
    country_code: a.country_code ?? null,
    province: a.state ?? null,
    canton: a.county ?? a.city ?? null,
    district: a.village ?? a.town ?? a.suburb ?? a.neighbourhood ?? null,
    postal_code: a.postcode ?? null,

    /* texto completo para mostrar al usuario */
    display_name: data.display_name ?? null,

    /* -- SI quieres tener todo el address “crudo” por cualquier cosa -- */
    address: a           // ✔️  ahora sí existe address.postcode
  };
}
