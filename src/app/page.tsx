'use client';

import Link from 'next/link';
import { useState } from 'react';
import { getStats, shops } from '@/lib/shops';
import { Shop } from '@/types/shop';
import {
  Bike,
  Mail,
  Star,
  ArrowRight,
  Plus,
  Search,
  MapPin,
  Baby
} from 'lucide-react';
import { cn, getPriorityColor } from '@/lib/utils';

export default function Home() {
  const stats = getStats();
  const [searchQuery, setSearchQuery] = useState('');

  // Berechne Statistiken
  const avgBewertung = shops.filter(s => s.bewertung > 0).length > 0
    ? (shops.filter(s => s.bewertung > 0).reduce((sum, s) => sum + s.bewertung, 0) / shops.filter(s => s.bewertung > 0).length).toFixed(1)
    : '0';

  // Top Priorität A Läden
  const topShops = shops
    .filter(s => s.prioritaet === 'A')
    .sort((a, b) => b.bewertung - a.bewertung)
    .slice(0, 8);

  // Läden ohne E-Mail
  const ohneEmail = shops
    .filter(s => !s.email || s.email === '-')
    .slice(0, 5);

  // KPI Cards
  const kpis = [
    { label: 'Läden gesamt', value: stats.total },
    { label: 'Mit E-Mail', value: stats.mitEmail },
    { label: 'GF bekannt', value: stats.mitGF },
    { label: 'Ø Bewertung', value: avgBewertung },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Laden suchen..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
              />
            </div>

            {/* Actions */}
            <Link
              href="/admin"
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              Neuer Laden
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="bg-white rounded-xl p-5 border border-slate-200">
              <div className="text-3xl font-bold text-slate-900 mb-1">{kpi.value}</div>
              <div className="text-sm text-slate-500">{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Top Priorität A - Main Section */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Top Priorität A Läden</h2>
              <Link
                href="/shops?prioritaet=A"
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
              >
                Alle anzeigen
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {topShops.map((shop) => (
                <ShopRow key={shop.id} shop={shop} />
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Ohne E-Mail */}
            <div className="bg-white rounded-xl border border-slate-200">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <h2 className="font-semibold text-slate-900">Ohne E-Mail</h2>
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                  {shops.filter(s => !s.email || s.email === '-').length}
                </span>
              </div>
              <div className="divide-y divide-slate-100">
                {ohneEmail.map((shop) => (
                  <Link
                    key={shop.id}
                    href={`/shop/${shop.slug}`}
                    className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                        {shop.typ === 'Baby' ? (
                          <Baby className="w-4 h-4 text-slate-500" />
                        ) : (
                          <Bike className="w-4 h-4 text-slate-500" />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-900 truncate max-w-[180px]">
                          {shop.name}
                        </div>
                        <div className="text-xs text-slate-500">{shop.stadtteil}</div>
                      </div>
                    </div>
                    <span className={cn(
                      "text-xs font-bold px-2 py-0.5 rounded border",
                      getPriorityColor(shop.prioritaet)
                    )}>
                      {shop.prioritaet}
                    </span>
                  </Link>
                ))}
              </div>
              <Link
                href="/shops?email=false"
                className="block px-5 py-3 text-center text-sm text-blue-600 hover:text-blue-700 border-t border-slate-100"
              >
                Alle ohne E-Mail anzeigen
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="font-semibold text-slate-900 mb-4">Nach Priorität</h2>
              <div className="space-y-3">
                <Link
                  href="/shops?prioritaet=A"
                  className="flex items-center justify-between hover:bg-slate-50 -mx-2 px-2 py-1 rounded transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                    <span className="text-sm text-slate-700">Priorität A</span>
                  </div>
                  <span className="font-semibold text-slate-900">{stats.prioA}</span>
                </Link>
                <Link
                  href="/shops?prioritaet=B"
                  className="flex items-center justify-between hover:bg-slate-50 -mx-2 px-2 py-1 rounded transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-amber-500 rounded-full"></span>
                    <span className="text-sm text-slate-700">Priorität B</span>
                  </div>
                  <span className="font-semibold text-slate-900">{stats.prioB}</span>
                </Link>
                <Link
                  href="/shops?prioritaet=C"
                  className="flex items-center justify-between hover:bg-slate-50 -mx-2 px-2 py-1 rounded transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-slate-400 rounded-full"></span>
                    <span className="text-sm text-slate-700">Priorität C</span>
                  </div>
                  <span className="font-semibold text-slate-900">{stats.prioC}</span>
                </Link>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="font-semibold text-slate-900 mb-4">Schnellzugriff</h2>
              <div className="space-y-2">
                <Link
                  href="/shops"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <Bike className="w-5 h-5 text-slate-500" />
                  <span className="text-sm text-slate-700">Alle Läden</span>
                </Link>
                <Link
                  href="/map"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <MapPin className="w-5 h-5 text-slate-500" />
                  <span className="text-sm text-slate-700">Kartenansicht</span>
                </Link>
                <Link
                  href="/routenplaner"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <ArrowRight className="w-5 h-5 text-slate-500" />
                  <span className="text-sm text-slate-700">Routenplaner</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShopRow({ shop }: { shop: Shop }) {
  return (
    <Link
      href={`/shop/${shop.slug}`}
      className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
          {shop.typ === 'Baby' ? (
            <Baby className="w-5 h-5 text-slate-500" />
          ) : (
            <Bike className="w-5 h-5 text-slate-500" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-900 truncate">{shop.name}</span>
            <span className={cn(
              "text-xs font-bold px-1.5 py-0.5 rounded border flex-shrink-0",
              getPriorityColor(shop.prioritaet)
            )}>
              {shop.prioritaet}
            </span>
          </div>
          <div className="text-sm text-slate-500 flex items-center gap-2">
            <span>{shop.stadtteil}</span>
            {shop.geschaeftsfuehrer && shop.geschaeftsfuehrer !== '-' && (
              <>
                <span className="text-slate-300">|</span>
                <span>{shop.geschaeftsfuehrer}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-shrink-0">
        {/* Email indicator */}
        {shop.email && shop.email !== '-' && (
          <Mail className="w-4 h-4 text-slate-400" />
        )}

        {/* Rating */}
        {shop.bewertung > 0 && (
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="text-sm text-slate-600">{shop.bewertung}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
