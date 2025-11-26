'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  Bike,
  MapPin,
  Star,
  Users,
  Building2,
  Mail,
  Phone,
  X,
  List,
  Map as MapIcon,
  Route,
  Play,
  Trash2,
  ChevronDown,
  ChevronUp,
  Navigation,
  Clock,
  Check
} from 'lucide-react';
import { shops } from '@/lib/shops';
import { Shop } from '@/types/shop';
import { cn, getPriorityColor } from '@/lib/utils';

// Dynamic import für Leaflet (kein SSR)
const ShopMap = dynamic(
  () => import('@/components/map/shop-map').then(mod => mod.ShopMap),
  { ssr: false, loading: () => <div className="w-full h-full bg-slate-100 animate-pulse flex items-center justify-center"><p className="text-slate-500">Karte wird geladen...</p></div> }
);

// Haversine distance calculation
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Nearest neighbor algorithm for route optimization
function optimizeRoute(selectedShops: Shop[], startLat: number = 50.9375, startLng: number = 6.9603): Shop[] {
  if (selectedShops.length <= 1) return selectedShops;

  const result: Shop[] = [];
  const remaining = [...selectedShops];
  let currentLat = startLat;
  let currentLng = startLng;

  while (remaining.length > 0) {
    let nearestIndex = 0;
    let nearestDistance = Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const shop = remaining[i];
      if (!shop.lat || !shop.lng) continue;
      const dist = calculateDistance(currentLat, currentLng, shop.lat, shop.lng);
      if (dist < nearestDistance) {
        nearestDistance = dist;
        nearestIndex = i;
      }
    }

    const nearest = remaining.splice(nearestIndex, 1)[0];
    result.push(nearest);
    if (nearest.lat && nearest.lng) {
      currentLat = nearest.lat;
      currentLng = nearest.lng;
    }
  }

  return result;
}

export default function MapPage() {
  const [selectedTyp, setSelectedTyp] = useState<string>('');
  const [selectedPrio, setSelectedPrio] = useState<string>('');
  const [selectedRoute, setSelectedRoute] = useState<string>('');
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list' | 'planner'>('map');
  const [routeShops, setRouteShops] = useState<Shop[]>([]);
  const [showRoutePlanner, setShowRoutePlanner] = useState(false);

  const filteredShops = useMemo(() => {
    return shops.filter(shop => {
      if (selectedTyp && shop.typ !== selectedTyp) return false;
      if (selectedPrio && shop.prioritaet !== selectedPrio) return false;
      if (selectedRoute && shop.route !== parseInt(selectedRoute)) return false;
      return true;
    });
  }, [selectedTyp, selectedPrio, selectedRoute]);

  // Routen für Filter
  const routen = useMemo(() => {
    const unique = new Set<number>();
    shops.forEach(s => s.route && unique.add(s.route));
    return Array.from(unique).sort((a, b) => a - b);
  }, []);

  // Group by Stadtteil for list view
  const shopsByStadtteil = useMemo(() => {
    const grouped: Record<string, Shop[]> = {};
    filteredShops.forEach(shop => {
      if (!grouped[shop.stadtteil]) {
        grouped[shop.stadtteil] = [];
      }
      grouped[shop.stadtteil].push(shop);
    });
    return Object.entries(grouped).sort((a, b) => b[1].length - a[1].length);
  }, [filteredShops]);

  // Total route distance
  const totalDistance = useMemo(() => {
    if (routeShops.length < 2) return 0;
    let total = 0;
    // Start from Cologne center
    let prevLat = 50.9375;
    let prevLng = 6.9603;
    for (const shop of routeShops) {
      if (shop.lat && shop.lng) {
        total += calculateDistance(prevLat, prevLng, shop.lat, shop.lng);
        prevLat = shop.lat;
        prevLng = shop.lng;
      }
    }
    return total;
  }, [routeShops]);

  // Estimated time (assuming 15km/h average speed with stops)
  const estimatedTime = useMemo(() => {
    const travelTime = totalDistance / 15; // hours
    const stopTime = routeShops.length * 0.25; // 15min per stop
    return travelTime + stopTime;
  }, [totalDistance, routeShops.length]);

  const addToRoute = useCallback((shop: Shop) => {
    if (!routeShops.find(s => s.id === shop.id)) {
      setRouteShops(prev => [...prev, shop]);
    }
  }, [routeShops]);

  const removeFromRoute = useCallback((shopId: number) => {
    setRouteShops(prev => prev.filter(s => s.id !== shopId));
  }, []);

  const optimizeCurrentRoute = useCallback(() => {
    if (routeShops.length > 1) {
      setRouteShops(optimizeRoute(routeShops));
    }
  }, [routeShops]);

  const openInGoogleMaps = useCallback(() => {
    if (routeShops.length === 0) return;

    const waypoints = routeShops
      .filter(s => s.lat && s.lng)
      .map(s => `${s.lat},${s.lng}`)
      .join('/');

    const url = `https://www.google.com/maps/dir/${waypoints}`;
    window.open(url, '_blank');
  }, [routeShops]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-40">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Kartenansicht</h1>
              <p className="text-slate-500">{filteredShops.length} Läden auf der Karte</p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={selectedTyp}
                onChange={(e) => setSelectedTyp(e.target.value)}
                className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Alle Typen</option>
                <option value="Fahrrad">Fahrrad ({shops.filter(s => s.typ === 'Fahrrad').length})</option>
                <option value="Baby">Baby ({shops.filter(s => s.typ === 'Baby').length})</option>
              </select>

              <select
                value={selectedRoute}
                onChange={(e) => setSelectedRoute(e.target.value)}
                className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Alle Routen</option>
                {routen.map(r => (
                  <option key={r} value={r}>Route {r} ({shops.filter(s => s.route === r).length})</option>
                ))}
              </select>

              <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                {['', 'A', 'B', 'C'].map((prio) => (
                  <button
                    key={prio}
                    onClick={() => setSelectedPrio(prio)}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                      selectedPrio === prio
                        ? "bg-white shadow-sm text-slate-900"
                        : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    {prio || 'Alle'}
                  </button>
                ))}
              </div>

              {/* View Toggle */}
              <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                <button
                  onClick={() => setViewMode('map')}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1",
                    viewMode === 'map'
                      ? "bg-white shadow-sm text-slate-900"
                      : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  <MapIcon className="w-4 h-4" />
                  Karte
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1",
                    viewMode === 'list'
                      ? "bg-white shadow-sm text-slate-900"
                      : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  <List className="w-4 h-4" />
                  Liste
                </button>
              </div>

              {/* Route Planner Toggle */}
              <button
                onClick={() => setShowRoutePlanner(!showRoutePlanner)}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2",
                  showRoutePlanner || routeShops.length > 0
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                )}
              >
                <Route className="w-4 h-4" />
                Routenplaner
                {routeShops.length > 0 && (
                  <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                    {routeShops.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {viewMode === 'map' ? (
          <>
            {/* Map */}
            <div className="flex-1 relative">
              <ShopMap
                shops={filteredShops}
                selectedShop={selectedShop}
                onShopSelect={setSelectedShop}
                routeShops={routeShops}
              />

              {/* Legende */}
              <div className="absolute bottom-4 left-4 bg-white rounded-xl shadow-lg p-4 z-10">
                <h3 className="font-semibold text-sm text-slate-900 mb-2">Legende</h3>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-red-500"></div>
                    <span>Priorität A ({shops.filter(s => s.prioritaet === 'A').length})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-amber-500"></div>
                    <span>Priorität B ({shops.filter(s => s.prioritaet === 'B').length})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-slate-500"></div>
                    <span>Priorität C ({shops.filter(s => s.prioritaet === 'C').length})</span>
                  </div>
                  {routeShops.length > 0 && (
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100 mt-2">
                      <div className="w-4 h-4 rounded-full bg-blue-600 ring-2 ring-blue-300"></div>
                      <span>In Route ({routeShops.length})</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Route Planner Sidebar */}
            {showRoutePlanner && (
              <div className="w-96 bg-white border-l border-slate-200 flex flex-col">
                <div className="p-4 border-b border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                      <Route className="w-5 h-5 text-blue-600" />
                      Routenplaner
                    </h2>
                    <button
                      onClick={() => setShowRoutePlanner(false)}
                      className="p-1 hover:bg-slate-100 rounded"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {routeShops.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-blue-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-blue-600 mb-1">
                          <Navigation className="w-4 h-4" />
                          <span className="text-xs font-medium">Distanz</span>
                        </div>
                        <div className="text-xl font-bold text-blue-700">
                          {totalDistance.toFixed(1)} km
                        </div>
                      </div>
                      <div className="bg-emerald-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-emerald-600 mb-1">
                          <Clock className="w-4 h-4" />
                          <span className="text-xs font-medium">Geschätzte Zeit</span>
                        </div>
                        <div className="text-xl font-bold text-emerald-700">
                          {Math.floor(estimatedTime)}h {Math.round((estimatedTime % 1) * 60)}min
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={optimizeCurrentRoute}
                      disabled={routeShops.length < 2}
                      className={cn(
                        "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2",
                        routeShops.length >= 2
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-slate-100 text-slate-400 cursor-not-allowed"
                      )}
                    >
                      <Play className="w-4 h-4" />
                      Route optimieren
                    </button>
                    <button
                      onClick={openInGoogleMaps}
                      disabled={routeShops.length === 0}
                      className={cn(
                        "py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-2",
                        routeShops.length > 0
                          ? "bg-emerald-600 text-white hover:bg-emerald-700"
                          : "bg-slate-100 text-slate-400 cursor-not-allowed"
                      )}
                    >
                      <MapIcon className="w-4 h-4" />
                      Google Maps
                    </button>
                  </div>
                </div>

                {/* Route List */}
                <div className="flex-1 overflow-y-auto p-4">
                  {routeShops.length === 0 ? (
                    <div className="text-center py-12">
                      <Route className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <h3 className="font-medium text-slate-900 mb-2">Keine Läden ausgewählt</h3>
                      <p className="text-sm text-slate-500">
                        Klicken Sie auf einen Laden in der Karte und wählen Sie "Zur Route hinzufügen"
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {routeShops.map((shop, index) => (
                        <div
                          key={shop.id}
                          className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl group"
                        >
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-900 truncate">{shop.name}</p>
                            <p className="text-xs text-slate-500 truncate">{shop.adresse}</p>
                          </div>
                          <button
                            onClick={() => removeFromRoute(shop.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {routeShops.length > 0 && (
                  <div className="p-4 border-t border-slate-200">
                    <button
                      onClick={() => setRouteShops([])}
                      className="w-full py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
                    >
                      Route leeren
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Selected Shop Sidebar */}
            {selectedShop && !showRoutePlanner && (
              <div className="w-80 bg-white border-l border-slate-200 p-5 overflow-y-auto">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      selectedShop.typ === 'Baby' ? "bg-pink-100" : "bg-blue-100"
                    )}>
                      {selectedShop.typ === 'Baby' ? (
                        <Users className="w-6 h-6 text-pink-600" />
                      ) : (
                        <Bike className="w-6 h-6 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <h2 className="font-semibold text-slate-900">{selectedShop.name}</h2>
                      <span className={cn(
                        "text-xs font-bold px-2 py-0.5 rounded",
                        getPriorityColor(selectedShop.prioritaet)
                      )}>
                        Prio {selectedShop.prioritaet}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedShop(null)}
                    className="p-1 hover:bg-slate-100 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {selectedShop.geschaeftsfuehrer && selectedShop.geschaeftsfuehrer !== '-' && (
                  <div className="flex items-center gap-2 mb-3 p-3 bg-violet-50 rounded-lg">
                    <Building2 className="w-4 h-4 text-violet-600" />
                    <span className="text-sm font-medium text-violet-900">{selectedShop.geschaeftsfuehrer}</span>
                  </div>
                )}

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>{selectedShop.adresse}</span>
                  </div>
                  {selectedShop.email && selectedShop.email !== '-' && (
                    <a href={`mailto:${selectedShop.email}`} className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700">
                      <Mail className="w-4 h-4" />
                      <span>{selectedShop.email}</span>
                    </a>
                  )}
                  {selectedShop.telefon && selectedShop.telefon !== '-' && (
                    <a href={`tel:${selectedShop.telefon}`} className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
                      <Phone className="w-4 h-4" />
                      <span>{selectedShop.telefon}</span>
                    </a>
                  )}
                </div>

                {selectedShop.bewertung > 0 && (
                  <div className="flex items-center gap-2 mb-4 p-3 bg-amber-50 rounded-lg">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="text-sm font-medium">{selectedShop.bewertung}</span>
                    <span className="text-sm text-slate-500">({selectedShop.anzahlBewertungen} Bewertungen)</span>
                  </div>
                )}

                <div className="space-y-2">
                  {routeShops.find(s => s.id === selectedShop.id) ? (
                    <button
                      onClick={() => removeFromRoute(selectedShop.id)}
                      className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 py-2.5 rounded-xl font-medium transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      Aus Route entfernen
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        addToRoute(selectedShop);
                        setShowRoutePlanner(true);
                      }}
                      className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-medium transition-colors"
                    >
                      <Route className="w-4 h-4" />
                      Zur Route hinzufügen
                    </button>
                  )}

                  <Link
                    href={`/shop/${selectedShop.slug}`}
                    className="block w-full text-center bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl font-medium transition-colors"
                  >
                    Details anzeigen
                  </Link>
                </div>
              </div>
            )}
          </>
        ) : (
          /* List View */
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-7xl mx-auto">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {shopsByStadtteil.map(([stadtteil, stadtteilShops]) => (
                  <div key={stadtteil} className="bg-white rounded-2xl shadow-soft overflow-hidden">
                    <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-5 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-white">
                          <MapPin className="w-5 h-5" />
                          <h2 className="font-semibold">{stadtteil}</h2>
                        </div>
                        <span className="bg-white/20 px-2 py-1 rounded text-white text-sm">
                          {stadtteilShops.length} Läden
                        </span>
                      </div>
                    </div>

                    <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
                      {stadtteilShops.map((shop) => (
                        <div
                          key={shop.id}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          <button
                            onClick={() => {
                              if (routeShops.find(s => s.id === shop.id)) {
                                removeFromRoute(shop.id);
                              } else {
                                addToRoute(shop);
                              }
                            }}
                            className={cn(
                              "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors",
                              routeShops.find(s => s.id === shop.id)
                                ? "bg-blue-600 text-white"
                                : "bg-slate-100 text-slate-400 hover:bg-blue-100 hover:text-blue-600"
                            )}
                          >
                            {routeShops.find(s => s.id === shop.id) ? (
                              <Check className="w-3 h-3" />
                            ) : (
                              <span className="text-xs font-bold">+</span>
                            )}
                          </button>
                          <Link
                            href={`/shop/${shop.slug}`}
                            className="flex-1 flex items-center gap-3 min-w-0"
                          >
                            <div className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                              shop.typ === 'Baby' ? "bg-pink-100" : "bg-blue-100"
                            )}>
                              {shop.typ === 'Baby' ? (
                                <Users className="w-4 h-4 text-pink-600" />
                              ) : (
                                <Bike className="w-4 h-4 text-blue-600" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-slate-900 truncate text-sm">{shop.name}</p>
                              {shop.bewertung > 0 && (
                                <div className="flex items-center gap-1">
                                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                  <span className="text-xs text-slate-500">{shop.bewertung}</span>
                                </div>
                              )}
                            </div>
                            <span className={cn(
                              "text-xs font-bold px-2 py-0.5 rounded",
                              getPriorityColor(shop.prioritaet)
                            )}>
                              {shop.prioritaet}
                            </span>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Route Overview */}
              <div className="mt-8">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Vertriebsrouten</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {routen.map(route => {
                    const routeShopsFiltered = shops.filter(s => s.route === route);
                    return (
                      <button
                        key={route}
                        onClick={() => {
                          setRouteShops(routeShopsFiltered);
                          setShowRoutePlanner(true);
                          setViewMode('map');
                        }}
                        className="bg-white rounded-xl p-4 shadow-soft hover:shadow-md transition-shadow text-center"
                      >
                        <div className="text-2xl font-bold text-blue-600 mb-1">Route {route}</div>
                        <div className="text-sm text-slate-500">{routeShopsFiltered.length} Läden</div>
                        <div className="mt-2 text-xs text-blue-600 font-medium">
                          Als Route laden →
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Route Summary (when route has items but planner is closed) */}
      {routeShops.length > 0 && !showRoutePlanner && viewMode === 'map' && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-2xl p-4 z-50 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Route className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-semibold text-slate-900">{routeShops.length} Läden in Route</div>
              <div className="text-xs text-slate-500">{totalDistance.toFixed(1)} km • ca. {Math.floor(estimatedTime)}h {Math.round((estimatedTime % 1) * 60)}min</div>
            </div>
          </div>
          <button
            onClick={() => setShowRoutePlanner(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-colors"
          >
            Route anzeigen
          </button>
          <button
            onClick={openInGoogleMaps}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-medium transition-colors"
          >
            Google Maps
          </button>
        </div>
      )}
    </div>
  );
}
