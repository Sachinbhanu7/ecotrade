import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

/** Approximate geographic center of India — sensible default for scrap pickup listings */
const DEFAULT_CENTER = [22.5937, 78.9629];
const DEFAULT_ZOOM = 5;
const DETAIL_ZOOM = 14;

function MapEvents({ readOnly, onPick }) {
  useMapEvents({
    click(e) {
      if (!readOnly) onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function Recenter({ lat, lng, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (lat != null && lng != null) map.setView([lat, lng], zoom ?? map.getZoom());
  }, [lat, lng, zoom, map]);
  return null;
}

/**
 * OpenStreetMap tiles (free). Click to set pickup point when not read-only.
 */
export default function PickupLocationMap({
  lat,
  lng,
  onPick = () => {},
  readOnly = false,
  height = 220,
  className = '',
}) {
  const position = useMemo(() => {
    if (lat != null && lng != null) return [lat, lng];
    return null;
  }, [lat, lng]);

  const center = position ?? DEFAULT_CENTER;
  const zoom = position ? DETAIL_ZOOM : DEFAULT_ZOOM;

  return (
    <div
      className={`rounded-xl overflow-hidden border border-slate-200 shadow-inner ${className}`}
      style={{ height }}
    >
      <MapContainer
        center={center}
        zoom={zoom}
        className="h-full w-full z-0"
        scrollWheelZoom={!readOnly}
        dragging
        doubleClickZoom={!readOnly}
        attributionControl
        whenReady={(e) => {
          setTimeout(() => e.target.invalidateSize(), 100);
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEvents readOnly={readOnly} onPick={onPick} />
        {position && <Marker position={position} />}
        {position && <Recenter lat={lat} lng={lng} zoom={DETAIL_ZOOM} />}
      </MapContainer>
    </div>
  );
}

/** Reverse geocode via OpenStreetMap Nominatim (free; please use responsibly). */
export async function reverseGeocodePick(lat, lng) {
  const url = new URL('https://nominatim.openstreetmap.org/reverse');
  url.searchParams.set('lat', String(lat));
  url.searchParams.set('lon', String(lng));
  url.searchParams.set('format', 'json');
  const res = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
      'Accept-Language': 'en',
    },
  });
  if (!res.ok) return '';
  const data = await res.json();
  return data.display_name || '';
}
