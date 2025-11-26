'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Bike,
  MapPin,
  Star,
  Users,
  Building2,
  Mail,
  Phone,
  X,
  Route,
  Play,
  Trash2,
  Navigation,
  Clock,
  Check,
  Plus,
  Search,
  Filter,
  ExternalLink,
  GripVertical
} from 'lucide-react';
import { shops } from '@/lib/shops';
import { Shop } from '@/types/shop';
import { cn, getPriorityColor } from '@/lib/utils';

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

export default function RoutenplanerPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTyp, setSelectedTyp] = useState<string>('');
  const [selectedPrio, setSelectedPrio] = useState<string>('');
  const [selectedStadtteil, setSelectedStadtteil] = useState<string>('');
  const [routeShops, setRouteShops] = useState<Shop[]>([]);

  // Get unique stadtteile
  const stadtteile = useMemo(() => {
    const unique = new Set<string>();
    shops.forEach(s => unique.add(s.stadtteil));
    return Array.from(unique).sort();
  }, []);

  // Filter available shops (not in route)
  const availableShops = useMemo(() => {
    return shops.filter(shop => {
      // Exclude shops already in route
      if (routeShops.find(rs => rs.id === shop.id)) return false;

      // Apply filters
      if (selectedTyp && shop.typ !== selectedTyp) return false;
      if (selectedPrio && shop.prioritaet !== selectedPrio) return false;
      if (selectedStadtteil && shop.stadtteil !== selectedStadtteil) return false;

      // Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          shop.name.toLowerCase().includes(q) ||
          shop.adresse.toLowerCase().includes(q) ||
          shop.geschaeftsfuehrer.toLowerCase().includes(q) ||
          shop.stadtteil.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [searchQuery, selectedTyp, selectedPrio, selectedStadtteil, routeShops]);

  // Calculate total distance
  const totalDistance = useMemo(() => {
    if (routeShops.length < 1) return 0;
    let total = 0;
    let prevLat = 50.9375; // Start from Cologne center
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

  // Estimated time
  const estimatedTime = useMemo(() => {
    const travelTime = totalDistance / 20; // 20 km/h average (car in city)
    const stopTime = routeShops.length * 0.25; // 15min per stop
    return travelTime + stopTime;
  }, [totalDistance, routeShops.length]);

  const addToRoute = useCallback((shop: Shop) => {
    setRouteShops(prev => [...prev, shop]);
  }, []);

  const removeFromRoute = useCallback((shopId: number) => {
    setRouteShops(prev => prev.filter(s => s.id !== shopId));
  }, []);

  const moveInRoute = useCallback((fromIndex: number, toIndex: number) => {
    setRouteShops(prev => {
      const newRoute = [...prev];
      const [removed] = newRoute.splice(fromIndex, 1);
      newRoute.splice(toIndex, 0, removed);
      return newRoute;
    });
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

  const loadPredefinedRoute = useCallback((routeNumber: number) => {
    const routeShopsToLoad = shops.filter(s => s.route === routeNumber);
    setRouteShops(routeShopsToLoad);
  }, []);

  // Get predefined routes
  const predefinedRoutes = useMemo(() => {
    const routeNumbers = new Set<number>();
    shops.forEach(s => s.route && routeNumbers.add(s.route));
    return Array.from(routeNumbers).sort((a, b) => a - b);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Route className="w-6 h-6 text-white" />
                </div>
                Routenplaner
              </h1>
              <p className="text-slate-500 mt-1">Stellen Sie Ihre optimale Vertriebsroute zusammen</p>
            </div>

            {routeShops.length > 0 && (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm text-slate-500">Geschätzte Route</div>
                  <div className="font-bold text-slate-900">
                    {totalDistance.toFixed(1)} km • {Math.floor(estimatedTime)}h {Math.round((estimatedTime % 1) * 60)}min
                  </div>
                </div>
                <button
                  onClick={openInGoogleMaps}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors flex items-center gap-2 shadow-lg"
                >
                  <ExternalLink className="w-5 h-5" />
                  In Google Maps öffnen
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">

          {/* Left Column - Shop Selection */}
          <div>
            <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Läden auswählen</h2>

                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Suche nach Name, Adresse, Stadtteil..."
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3">
                  <select
                    value={selectedTyp}
                    onChange={(e) => setSelectedTyp(e.target.value)}
                    className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Alle Typen</option>
                    <option value="Fahrrad">Fahrrad</option>
                    <option value="Baby">Baby</option>
                  </select>

                  <select
                    value={selectedPrio}
                    onChange={(e) => setSelectedPrio(e.target.value)}
                    className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Alle Prioritäten</option>
                    <option value="A">Priorität A</option>
                    <option value="B">Priorität B</option>
                    <option value="C">Priorität C</option>
                  </select>

                  <select
                    value={selectedStadtteil}
                    onChange={(e) => setSelectedStadtteil(e.target.value)}
                    className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Alle Stadtteile</option>
                    {stadtteile.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Shop List */}
              <div className="max-h-[500px] overflow-y-auto">
                {availableShops.length === 0 ? (
                  <div className="p-8 text-center">
                    <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">Keine Läden gefunden</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {availableShops.slice(0, 50).map((shop) => (
                      <div
                        key={shop.id}
                        className="p-4 hover:bg-slate-50 transition-colors flex items-center gap-4"
                      >
                        <button
                          onClick={() => addToRoute(shop)}
                          className="w-10 h-10 bg-blue-100 hover:bg-blue-600 text-blue-600 hover:text-white rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
                        >
                          <Plus className="w-5 h-5" />
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-slate-900 truncate">{shop.name}</h3>
                            <span className={cn(
                              "text-xs font-bold px-2 py-0.5 rounded flex-shrink-0",
                              getPriorityColor(shop.prioritaet)
                            )}>
                              {shop.prioritaet}
                            </span>
                          </div>
                          <p className="text-sm text-slate-500 truncate">{shop.adresse}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                            <span>{shop.stadtteil}</span>
                            {shop.geschaeftsfuehrer !== '-' && (
                              <span className="text-violet-600">👤 {shop.geschaeftsfuehrer}</span>
                            )}
                            {shop.bewertung > 0 && (
                              <span className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                {shop.bewertung}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                          shop.typ === 'Baby' ? "bg-pink-100" : "bg-blue-100"
                        )}>
                          {shop.typ === 'Baby' ? (
                            <Users className="w-5 h-5 text-pink-600" />
                          ) : (
                            <Bike className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                      </div>
                    ))}
                    {availableShops.length > 50 && (
                      <div className="p-4 text-center text-slate-500 text-sm">
                        + {availableShops.length - 50} weitere Läden (Filter verwenden)
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Predefined Routes */}
            <div className="mt-6 bg-white rounded-2xl shadow-soft p-6">
              <h3 className="font-bold text-slate-900 mb-4">Vorgefertigte Routen laden</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {predefinedRoutes.map(routeNum => {
                  const count = shops.filter(s => s.route === routeNum).length;
                  return (
                    <button
                      key={routeNum}
                      onClick={() => loadPredefinedRoute(routeNum)}
                      className="bg-slate-100 hover:bg-blue-100 hover:text-blue-700 text-slate-700 p-3 rounded-xl text-center transition-colors"
                    >
                      <div className="font-bold">Route {routeNum}</div>
                      <div className="text-xs text-slate-500">{count} Läden</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column - Route */}
          <div>
            <div className="bg-white rounded-2xl shadow-soft overflow-hidden sticky top-36">
              <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-blue-600 to-blue-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Route className="w-6 h-6" />
                    Ihre Route
                  </h2>
                  <span className="bg-white/20 px-3 py-1 rounded-full text-white text-sm font-medium">
                    {routeShops.length} Stops
                  </span>
                </div>
              </div>

              {/* Route Stats */}
              {routeShops.length > 0 && (
                <div className="p-4 bg-slate-50 border-b border-slate-100">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl p-4">
                      <div className="flex items-center gap-2 text-blue-600 mb-1">
                        <Navigation className="w-4 h-4" />
                        <span className="text-sm font-medium">Gesamtdistanz</span>
                      </div>
                      <div className="text-2xl font-bold text-slate-900">
                        {totalDistance.toFixed(1)} km
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-4">
                      <div className="flex items-center gap-2 text-emerald-600 mb-1">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium">Geschätzte Zeit</span>
                      </div>
                      <div className="text-2xl font-bold text-slate-900">
                        {Math.floor(estimatedTime)}h {Math.round((estimatedTime % 1) * 60)}min
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={optimizeCurrentRoute}
                      disabled={routeShops.length < 2}
                      className={cn(
                        "flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2",
                        routeShops.length >= 2
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-slate-200 text-slate-400 cursor-not-allowed"
                      )}
                    >
                      <Play className="w-4 h-4" />
                      Route optimieren
                    </button>
                    <button
                      onClick={() => setRouteShops([])}
                      className="py-3 px-4 rounded-xl text-sm font-semibold bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Route List */}
              <div className="max-h-[400px] overflow-y-auto">
                {routeShops.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Route className="w-10 h-10 text-slate-300" />
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-2">Route ist leer</h3>
                    <p className="text-sm text-slate-500 max-w-xs mx-auto">
                      Wählen Sie Läden aus der Liste links aus, um Ihre Route zu erstellen
                    </p>
                  </div>
                ) : (
                  <div className="p-4 space-y-2">
                    {routeShops.map((shop, index) => (
                      <div
                        key={shop.id}
                        className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl group hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => index > 0 && moveInRoute(index, index - 1)}
                            disabled={index === 0}
                            className={cn(
                              "w-6 h-6 rounded flex items-center justify-center transition-colors",
                              index === 0
                                ? "text-slate-300 cursor-not-allowed"
                                : "text-slate-400 hover:text-slate-600 hover:bg-slate-200"
                            )}
                          >
                            ▲
                          </button>
                          <button
                            onClick={() => index < routeShops.length - 1 && moveInRoute(index, index + 1)}
                            disabled={index === routeShops.length - 1}
                            className={cn(
                              "w-6 h-6 rounded flex items-center justify-center transition-colors",
                              index === routeShops.length - 1
                                ? "text-slate-300 cursor-not-allowed"
                                : "text-slate-400 hover:text-slate-600 hover:bg-slate-200"
                            )}
                          >
                            ▼
                          </button>
                        </div>

                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                          {index + 1}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 truncate">{shop.name}</p>
                          <p className="text-xs text-slate-500 truncate">{shop.adresse}</p>
                        </div>

                        <span className={cn(
                          "text-xs font-bold px-2 py-0.5 rounded",
                          getPriorityColor(shop.prioritaet)
                        )}>
                          {shop.prioritaet}
                        </span>

                        <button
                          onClick={() => removeFromRoute(shop.id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Export Button */}
              {routeShops.length > 0 && (
                <div className="p-4 border-t border-slate-100">
                  <button
                    onClick={openInGoogleMaps}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 shadow-lg"
                  >
                    <ExternalLink className="w-5 h-5" />
                    Route in Google Maps öffnen
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
