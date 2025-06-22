export async function getCoordinates(address) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data[0]) return { lat: null, lon: null };
  return {
    lat: data[0].lat,
    lon: data[0].lon,
    full_address: data[0].display_name
  };
}

