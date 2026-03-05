"use client";

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
// Upewnij się, że ten plik CSS istnieje (z poprzedniego kroku)
import styles from "./LocationPicker.module.css";

// --- Fix ikon Leaflet ---
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- GŁÓWNY KOMPONENT ---
interface LocationPickerProps {
  onLocationSelect: (coords: { lat: number; lng: number }) => void;
}

const LocationPicker = ({ onLocationSelect }: LocationPickerProps) => {
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. Pobieranie lokalizacji GPS na start
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const latLng = new L.LatLng(latitude, longitude);
          setPosition(latLng);
          onLocationSelect({ lat: latitude, lng: longitude });
          setLoading(false);
        },
        (err) => {
          console.error("Błąd GPS:", err);
          // Fallback: Warszawa
          const fallback = new L.LatLng(52.2297, 21.0122);
          setPosition(fallback);
          onLocationSelect({ lat: 52.2297, lng: 21.0122 });
          setLoading(false);
        }
      );
    } else {
      setLoading(false);
    }
  }, []);

  // 2. KOMPONENT WEWNĘTRZNY: Obsługa kliknięcia w mapę
  // Musi być wewnątrz MapContainer, żeby mieć dostęp do kontekstu mapy
  function MapClickHandler() {
    useMapEvents({
      click(e) {
        setPosition(e.latlng); // Ustaw pinezkę tam gdzie kliknięto
        onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng }); // Wyślij dane wyżej
      },
    });
    return null; // Ten komponent nic nie wyświetla, tylko słucha zdarzeń
  }

  if (loading) {
    return <div className={styles.loading}>Szukanie satelitów...</div>;
  }

  return (
    <div className={styles.container}>
      <MapContainer 
        center={position || [52.2297, 21.0122]} 
        zoom={16} 
        scrollWheelZoom={true} 
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Tu dodajemy nasłuchiwanie kliknięć */}
        <MapClickHandler />

        {/* Wyświetlamy marker tylko jeśli mamy pozycję */}
        {position && (
          <Marker position={position}>
            <Popup>Tu jest Twój magazyn.</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default LocationPicker;