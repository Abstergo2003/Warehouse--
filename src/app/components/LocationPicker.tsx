"use client";

import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import styles from "./LocationPicker.module.css";
import { LoaderBusy } from "react-windows-ui";

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
  initialPosition?: { lat: number; lng: number } | null;
}

const LocationPicker = ({ onLocationSelect, initialPosition }: LocationPickerProps) => {
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const [loading, setLoading] = useState(true);
  const hasInitialized = useRef(false);

  // 1. Inicjalizacja pozycji (z propa lub GPS)
  useEffect(() => {
    if (hasInitialized.current) return;

    if (initialPosition) {
      const latLng = new L.LatLng(initialPosition.lat, initialPosition.lng);
      setPosition(latLng);
      setLoading(false);
      hasInitialized.current = true;
    } else if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (hasInitialized.current) return;
          const { latitude, longitude } = pos.coords;
          const latLng = new L.LatLng(latitude, longitude);
          setPosition(latLng);
          onLocationSelect({ lat: latitude, lng: longitude });
          setLoading(false);
          hasInitialized.current = true;
        },
        (err) => {
          console.error("Błąd GPS:", err);
          if (hasInitialized.current) return;
          const fallback = new L.LatLng(52.2297, 21.0122);
          setPosition(fallback);
          onLocationSelect({ lat: 52.2297, lng: 21.0122 });
          setLoading(false);
          hasInitialized.current = true;
        }
      );
    } else {
      setLoading(false);
    }
  }, [initialPosition, onLocationSelect]);

  // 2. KOMPONENT WEWNĘTRZNY: Obsługa kliknięcia w mapę
  function MapClickHandler() {
    useMapEvents({
      click(e) {
        setPosition(e.latlng);
        onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
      },
    });
    return null;
  }

  if (loading) {
    return (
      <div className={styles.loading} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <LoaderBusy isLoading={true} size="default" />
        <p style={{ marginTop: '10px' }}>Searching satellites...</p>
      </div>
    );
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
        
        <MapClickHandler />

        {position && (
          <Marker 
            position={position} 
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const marker = e.target;
                const newPos = marker.getLatLng();
                setPosition(newPos);
                onLocationSelect({ lat: newPos.lat, lng: newPos.lng });
              },
            }}
          >
            <Popup>Your warehouse is here. You can drag me!</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default LocationPicker;