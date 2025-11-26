'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Shop } from '@/types/shop';

interface ShopMapProps {
  shops: Shop[];
  selectedShop?: Shop | null;
  onShopSelect?: (shop: Shop) => void;
  routeShops?: Shop[];
}

export function ShopMap({ shops, selectedShop, onShopSelect, routeShops = [] }: ShopMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !containerRef.current) return;

    // Initialize map centered on Cologne
    if (!mapRef.current) {
      mapRef.current = L.map(containerRef.current, {
        center: [50.9375, 6.9603],
        zoom: 12,
        scrollWheelZoom: true,
      });

      // Add tile layer (OpenStreetMap)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(mapRef.current);

      markersRef.current = L.layerGroup().addTo(mapRef.current);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [isClient]);

  // Update markers when shops change
  useEffect(() => {
    if (!mapRef.current || !markersRef.current || !isClient) return;

    // Clear existing markers
    markersRef.current.clearLayers();

    // Remove existing route line
    if (routeLineRef.current) {
      routeLineRef.current.remove();
      routeLineRef.current = null;
    }

    // Draw route line if there are route shops
    if (routeShops.length >= 2) {
      const routeCoords: [number, number][] = routeShops
        .filter(s => s.lat && s.lng)
        .map(s => [s.lat, s.lng]);

      if (routeCoords.length >= 2) {
        routeLineRef.current = L.polyline(routeCoords, {
          color: '#2563eb',
          weight: 4,
          opacity: 0.8,
          dashArray: '10, 10',
        }).addTo(mapRef.current);
      }
    }

    // Add markers for each shop
    shops.forEach(shop => {
      if (!shop.lat || !shop.lng) return;

      const isInRoute = routeShops.some(rs => rs.id === shop.id);
      const routeIndex = routeShops.findIndex(rs => rs.id === shop.id);

      // Create custom icon based on priority and type
      let color = shop.prioritaet === 'A' ? '#ef4444' :
                  shop.prioritaet === 'B' ? '#f59e0b' : '#64748b';

      // Override color if in route
      if (isInRoute) {
        color = '#2563eb';
      }

      const icon = shop.typ === 'Baby' ? '👶' : '🚲';

      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            background: ${color};
            width: ${isInRoute ? '44px' : '36px'};
            height: ${isInRoute ? '44px' : '36px'};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${isInRoute ? '14px' : '18px'};
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            border: ${isInRoute ? '4px' : '3px'} solid white;
            cursor: pointer;
            transition: transform 0.2s;
            position: relative;
            ${isInRoute ? 'box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.3), 0 2px 8px rgba(0,0,0,0.3);' : ''}
          " class="marker-inner">
            ${isInRoute ? `<span style="font-weight: bold; color: white; font-size: 16px;">${routeIndex + 1}</span>` : icon}
          </div>
        `,
        iconSize: [isInRoute ? 44 : 36, isInRoute ? 44 : 36],
        iconAnchor: [isInRoute ? 22 : 18, isInRoute ? 22 : 18],
      });

      const marker = L.marker([shop.lat, shop.lng], { icon: customIcon });

      // Create popup content
      const popupContent = `
        <div style="min-width: 200px; font-family: system-ui, sans-serif;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            ${isInRoute ? `
              <span style="
                background: #2563eb;
                color: white;
                padding: 2px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: 600;
              ">
                Route #${routeIndex + 1}
              </span>
            ` : ''}
            <span style="
              background: ${shop.prioritaet === 'A' ? '#fef2f2' : shop.prioritaet === 'B' ? '#fffbeb' : '#f8fafc'};
              color: ${shop.prioritaet === 'A' ? '#dc2626' : shop.prioritaet === 'B' ? '#d97706' : '#475569'};
              padding: 2px 8px;
              border-radius: 4px;
              font-size: 12px;
              font-weight: 600;
            ">
              Prio ${shop.prioritaet}
            </span>
            <span style="font-size: 12px; color: #64748b;">Route ${shop.route}</span>
          </div>
          <h3 style="margin: 0 0 4px; font-size: 14px; font-weight: 600; color: #1e293b;">
            ${shop.name}
          </h3>
          ${shop.geschaeftsfuehrer && shop.geschaeftsfuehrer !== '-' ? `
            <p style="margin: 0 0 4px; font-size: 12px; color: #7c3aed;">
              👤 ${shop.geschaeftsfuehrer}
            </p>
          ` : ''}
          <p style="margin: 0 0 8px; font-size: 12px; color: #64748b;">
            📍 ${shop.adresse}
          </p>
          ${shop.email && shop.email !== '-' ? `
            <p style="margin: 0 0 4px; font-size: 12px; color: #059669;">
              ✉️ ${shop.email}
            </p>
          ` : ''}
          ${shop.telefon && shop.telefon !== '-' ? `
            <p style="margin: 0 0 8px; font-size: 12px; color: #64748b;">
              📞 ${shop.telefon}
            </p>
          ` : ''}
          ${shop.bewertung > 0 ? `
            <p style="margin: 0 0 8px; font-size: 12px; color: #f59e0b;">
              ⭐ ${shop.bewertung} (${shop.anzahlBewertungen} Bewertungen)
            </p>
          ` : ''}
          <a href="/shop/${shop.slug}" style="
            display: inline-block;
            background: #2563eb;
            color: white;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 500;
            text-decoration: none;
            margin-top: 4px;
          ">
            Details anzeigen →
          </a>
        </div>
      `;

      marker.bindPopup(popupContent, {
        maxWidth: 300,
        className: 'shop-popup',
      });

      marker.on('click', () => {
        if (onShopSelect) {
          onShopSelect(shop);
        }
      });

      markersRef.current?.addLayer(marker);
    });

    // Fit bounds to show all markers
    if (shops.length > 0) {
      const validShops = shops.filter(s => s.lat && s.lng);
      if (validShops.length > 0) {
        const bounds = L.latLngBounds(validShops.map(s => [s.lat, s.lng]));
        mapRef.current.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [shops, routeShops, isClient, onShopSelect]);

  // Center on selected shop
  useEffect(() => {
    if (!mapRef.current || !selectedShop || !isClient) return;

    if (selectedShop.lat && selectedShop.lng) {
      mapRef.current.setView([selectedShop.lat, selectedShop.lng], 15);
    }
  }, [selectedShop, isClient]);

  if (!isClient) {
    return (
      <div className="w-full h-full bg-slate-100 animate-pulse flex items-center justify-center">
        <p className="text-slate-500">Karte wird geladen...</p>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        .custom-marker .marker-inner:hover {
          transform: scale(1.1);
        }
        .shop-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }
        .shop-popup .leaflet-popup-tip {
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }
        .leaflet-container {
          z-index: 1 !important;
        }
        .leaflet-pane {
          z-index: 1 !important;
        }
        .leaflet-top, .leaflet-bottom {
          z-index: 500 !important;
        }
      `}</style>
      <div ref={containerRef} className="w-full h-full rounded-xl overflow-hidden relative z-0" />
    </>
  );
}
