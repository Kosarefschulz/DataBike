'use client';

import { useState, useMemo } from 'react';
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
  Map as MapIcon
} from 'lucide-react';
import { shops } from '@/lib/shops';
import { Shop } from '@/types/shop';
import { cn, getPriorityColor } from '@/lib/utils';

// Dynamic import für Leaflet (kein SSR)
const ShopMap = dynamic(
  () => import('@/components/map/shop-map').then(mod => mod.ShopMap),
  { ssr: false, loading: () => <div className="w-full h-full bg-slate-100 animate-pulse flex items-center justify-center"><p className="text-slate-500">Karte wird geladen...</p></div> }
);

export default function MapPage() {
  const [selectedTyp, setSelectedTyp] = useState<string>('');
  const [selectedPrio, setSelectedPrio] = useState<string>('');
  const [selectedRoute, setSelectedRoute] = useState<string>('');
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

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
                <option value="Fahrrad">🚲 Fahrrad ({shops.filter(s => s.typ === 'Fahrrad').length})</option>
                <option value="Baby">👶 Baby ({shops.filter(s => s.typ === 'Baby').length})</option>
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
                </div>
              </div>
            </div>

            {/* Selected Shop Sidebar */}
            {selectedShop && (
              <div className="w-80 bg-white border-l border-slate-200 p-5 overflow-y-auto">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      selectedShop.typ === 'Baby' ? "bg-pink-100" : "bg-blue-100"
                    )}>
                      {selectedShop.typ === 'Baby' ? '👶' : '🚲'}
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

                <Link
                  href={`/shop/${selectedShop.slug}`}
                  className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-medium transition-colors"
                >
                  Details anzeigen
                </Link>
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
                        <Link
                          key={shop.id}
                          href={`/shop/${shop.slug}`}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors"
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
                    const routeShops = shops.filter(s => s.route === route);
                    return (
                      <Link
                        key={route}
                        href={`/shops?route=${route}`}
                        className="bg-white rounded-xl p-4 shadow-soft hover:shadow-md transition-shadow text-center"
                      >
                        <div className="text-2xl font-bold text-blue-600 mb-1">Route {route}</div>
                        <div className="text-sm text-slate-500">{routeShops.length} Läden</div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
