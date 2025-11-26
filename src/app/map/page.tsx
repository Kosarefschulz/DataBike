'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Bike,
  MapPin,
  List,
  Star,
  Users,
  Filter
} from 'lucide-react';
import { shops } from '@/lib/shops';
import { cn, getPriorityColor } from '@/lib/utils';

export default function MapPage() {
  const [selectedTyp, setSelectedTyp] = useState<string>('');
  const [selectedPrio, setSelectedPrio] = useState<string>('');

  const filteredShops = useMemo(() => {
    return shops.filter(shop => {
      if (selectedTyp && shop.typ !== selectedTyp) return false;
      if (selectedPrio && shop.prioritaet !== selectedPrio) return false;
      return true;
    });
  }, [selectedTyp, selectedPrio]);

  // Group by Stadtteil
  const shopsByStadtteil = useMemo(() => {
    const grouped: Record<string, typeof shops> = {};
    filteredShops.forEach(shop => {
      if (!grouped[shop.stadtteil]) {
        grouped[shop.stadtteil] = [];
      }
      grouped[shop.stadtteil].push(shop);
    });
    return Object.entries(grouped).sort((a, b) => b[1].length - a[1].length);
  }, [filteredShops]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Kartenansicht</h1>
              <p className="text-slate-500">{filteredShops.length} Läden in {shopsByStadtteil.length} Stadtteilen</p>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
              <select
                value={selectedTyp}
                onChange={(e) => setSelectedTyp(e.target.value)}
                className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Alle Typen</option>
                <option value="Fahrrad">Fahrrad</option>
                <option value="Baby">Baby</option>
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
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-blue-900 font-medium">Interaktive Karte in Entwicklung</p>
              <p className="text-blue-700 text-sm">
                Die volle Karten-Integration mit Google Maps ist in Vorbereitung.
                Hier sehen Sie vorerst eine Übersicht nach Stadtteilen.
              </p>
            </div>
          </div>
        </div>

        {/* Stadtteile Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {shopsByStadtteil.map(([stadtteil, stadtteilShops]) => (
            <div key={stadtteil} className="bg-white rounded-2xl shadow-soft overflow-hidden">
              {/* Stadtteil Header */}
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

              {/* Shops List */}
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
            {Array.from(new Set(shops.map(s => s.route))).sort((a, b) => a - b).map(route => {
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
  );
}
