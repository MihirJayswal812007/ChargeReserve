"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useTheme } from "next-themes";

interface Charger {
  id: string;
  type: string;
  powerKw: number;
  pricePerKwh: number;
  status: string;
}

interface Station {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  rating: number | null;
  amenities: string[];
  operatingHours: string;
  totalChargers: number;
  chargers: Charger[];
  availableCount: number;
  distance?: number | null;
}

interface StationMapProps {
  stations: Station[];
  selectedStation: Station | null;
  onSelectStation: (station: Station) => void;
  userLocation?: { lat: number; lng: number } | null;
  radiusKm?: number;
}

function createGeoJSONCircle(center: [number, number], radiusInKm: number, points = 64) {
  const coords = { latitude: center[1], longitude: center[0] };
  const ret = [];
  const distanceX = radiusInKm / (111.32 * Math.cos((coords.latitude * Math.PI) / 180));
  const distanceY = radiusInKm / 110.574;

  let theta, x, y;
  for (let i = 0; i < points; i++) {
    theta = (i / points) * (2 * Math.PI);
    x = distanceX * Math.cos(theta);
    y = distanceY * Math.sin(theta);
    ret.push([coords.longitude + x, coords.latitude + y]);
  }
  ret.push(ret[0]);

  return {
    type: "Feature" as const,
    properties: {},
    geometry: {
      type: "Polygon" as const,
      coordinates: [ret],
    },
  };
}

export default function StationMap({
  stations,
  selectedStation,
  onSelectStation,
  userLocation,
  radiusKm,
}: StationMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<{ [id: string]: maplibregl.Marker }>({});
  const userMarkerRef = useRef<maplibregl.Marker | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (!mapContainer.current) return;

    const isDark = theme === "dark";

    if (!map.current) {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: `https://basemaps.cartocdn.com/gl/${isDark ? "dark-matter" : "positron"}-gl-style/style.json`,
        center: [78.9629, 20.5937], // Default to India center
        zoom: 4,
        attributionControl: false,
      });

      map.current.addControl(new maplibregl.NavigationControl(), "top-right");

      map.current.on("load", () => {
        if (!map.current) return;
        map.current.addSource("radius-source", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });

        map.current.addLayer({
          id: "radius-layer",
          type: "fill",
          source: "radius-source",
          paint: {
            "fill-color": "#3b82f6",
            "fill-opacity": 0.15,
          },
        });

        map.current.addLayer({
          id: "radius-outline",
          type: "line",
          source: "radius-source",
          paint: {
            "line-color": "#3b82f6",
            "line-width": 2,
            "line-opacity": 0.5,
          },
        });
      });
    } else {
      // Update style if theme changes
      map.current.setStyle(`https://basemaps.cartocdn.com/gl/${isDark ? "dark-matter" : "positron"}-gl-style/style.json`);
    }

    return () => {
       // We keep map running, only destroy on unmount
    };
  }, [theme]);

  // Handle station markers
  useEffect(() => {
    if (!map.current) return;

    // Clear old markers that are no longer in the list
    const currentIds = new Set(stations.map(s => s.id));
    Object.keys(markersRef.current).forEach(id => {
      if (!currentIds.has(id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });

    // Add or update markers
    stations.forEach(station => {
      if (!markersRef.current[station.id]) {
        // Create custom marker element
        const el = document.createElement("div");
        el.className = `w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center cursor-pointer transition-transform hover:scale-110`;
        el.style.backgroundColor = station.availableCount > 0 ? "#22c55e" : "#ef4444";
        
        // Inner icon could be a white zap simple shapes etc
        el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`;

        el.addEventListener("click", () => {
          onSelectStation(station);
        });

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([station.longitude, station.latitude])
          .addTo(map.current!);
          
        markersRef.current[station.id] = marker;
      }
    });

    // Fit bounds if we have stations or userLocation
    if (map.current) {
      const bounds = new maplibregl.LngLatBounds();
      let hasBounds = false;

      if (userLocation) {
        bounds.extend([userLocation.lng, userLocation.lat]);
        // Also extend roughly by radius to keep circle in view
        if (radiusKm) {
          const latDiff = radiusKm / 110.574;
          const lngDiff = radiusKm / (111.32 * Math.cos((userLocation.lat * Math.PI) / 180));
          bounds.extend([userLocation.lng - lngDiff, userLocation.lat - latDiff]);
          bounds.extend([userLocation.lng + lngDiff, userLocation.lat + latDiff]);
        }
        hasBounds = true;
      }

      stations.forEach((s) => {
        bounds.extend([s.longitude, s.latitude]);
        hasBounds = true;
      });

      if (hasBounds) {
        map.current.fitBounds(bounds, { padding: 50, maxZoom: 14 });
      }
    }
  }, [stations, onSelectStation, userLocation, radiusKm]);

  // Handle userLocation marker and radius circle
  useEffect(() => {
    if (!map.current) return;

    if (userLocation) {
      if (!userMarkerRef.current) {
        const el = document.createElement("div");
        el.className = `w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg ring-4 ring-blue-500/30 animate-pulse`;
        userMarkerRef.current = new maplibregl.Marker({ element: el })
          .setLngLat([userLocation.lng, userLocation.lat])
          .addTo(map.current);
      } else {
        userMarkerRef.current.setLngLat([userLocation.lng, userLocation.lat]);
      }

      if (radiusKm && map.current.isStyleLoaded() && map.current.getSource("radius-source")) {
        const circle = createGeoJSONCircle([userLocation.lng, userLocation.lat], radiusKm);
        (map.current.getSource("radius-source") as maplibregl.GeoJSONSource).setData({
          type: "FeatureCollection",
          features: [circle],
        });
      }
    } else {
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
      if (map.current.isStyleLoaded() && map.current.getSource("radius-source")) {
        (map.current.getSource("radius-source") as maplibregl.GeoJSONSource).setData({
          type: "FeatureCollection",
          features: [],
        });
      }
    }
  }, [userLocation, radiusKm, theme]);

  // Optional: Center map on selected station
  useEffect(() => {
    if (selectedStation && map.current) {
      map.current.flyTo({
        center: [selectedStation.longitude, selectedStation.latitude],
        zoom: 15,
        speed: 1.2,
      });

      // Highlight selected marker
      Object.entries(markersRef.current).forEach(([id, marker]) => {
        const el = marker.getElement();
        if (id === selectedStation.id) {
          el.classList.add("scale-125", "ring-4", "ring-primary/50");
          el.classList.remove("hover:scale-110");
        } else {
          el.classList.remove("scale-125", "ring-4", "ring-primary/50");
          el.classList.add("hover:scale-110");
        }
      });
    } else {
        Object.entries(markersRef.current).forEach(([id, marker]) => {
            const el = marker.getElement();
            el.classList.remove("scale-125", "ring-4", "ring-primary/50");
            el.classList.add("hover:scale-110");
        });
    }
  }, [selectedStation]);

  return <div ref={mapContainer} className="w-full h-full" />;
}
