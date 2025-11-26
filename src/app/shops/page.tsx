'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Bike,
  Search,
  Filter,
  X,
  Mail,
  Phone,
  MapPin,
  Star,
  Globe,
  ChevronDown,
  Building2,
  Users
} from 'lucide-react';
import { shops, getUniqueValues, getStats } from '@/lib/shops';
import { Shop } from '@/types/shop';
import { cn, getPriorityColor, getTypColor, getWebsiteUrl } from '@/lib/utils';

export default function ShopsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Filter states
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedTyp, setSelectedTyp] = useState(searchParams.get('typ') || '');
  const [selectedPriorität, setSelectedPriorität] = useState(searchParams.get('prioritaet') || '');
  const [selectedSchwerpunkt, setSelectedSchwerpunkt] = useState(searchParams.get('schwerpunkt') || '');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Get unique values for filters
  const schwerpunkte = useMemo(() => getUniqueValues('schwerpunkte'), []);
  const stats = getStats();

  // Filter shops
  const filteredShops = useMemo(() => {
    return shops.filter(shop => {
      // Search filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          shop.name.toLowerCase().includes(q) ||
          shop.adresse.toLowerCase().includes(q) ||
          shop.geschaeftsfuehrer.toLowerCase().includes(q) ||
          shop.marken.some(m => m.toLowerCase().includes(q)) ||
          shop.schwerpunkte.some(s => s.toLowerCase().includes(q));
        if (!matchesSearch) return false;
      }

      // Typ filter
      if (selectedTyp && shop.typ !== selectedTyp) return false;

      // Priorität filter
      if (selectedPriorität && shop.prioritaet !== selectedPriorität) return false;

      // Schwerpunkt filter
      if (selectedSchwerpunkt && !shop.schwerpunkte.some(s =>
        s.toLowerCase().includes(selectedSchwerpunkt.toLowerCase())
      )) return false;

      return true;
    });
  }, [searchQuery, selectedTyp, selectedPriorität, selectedSchwerpunkt]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedTyp) params.set('typ', selectedTyp);
    if (selectedPriorität) params.set('prioritaet', selectedPriorität);
    if (selectedSchwerpunkt) params.set('schwerpunkt', selectedSchwerpunkt);

    const newUrl = params.toString() ? `/shops?${params.toString()}` : '/shops';
    window.history.replaceState({}, '', newUrl);
  }, [searchQuery, selectedTyp, selectedPriorität, selectedSchwerpunkt]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTyp('');
    setSelectedPriorität('');
    setSelectedSchwerpunkt('');
  };

  const activeFiltersCount = [selectedTyp, selectedPriorität, selectedSchwerpunkt].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Alle Läden</h1>
              <p className="text-slate-500">
                {filteredShops.length} von {stats.total} Läden
              </p>
            </div>

            {/* Search */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1 md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Suchen..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                  </button>
                )}
              </div>

              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="md:hidden flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <Filter className="w-5 h-5" />
                {activeFiltersCount > 0 && (
                  <span className="w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden md:block w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-soft p-5 sticky top-36">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-slate-900">Filter</h2>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Zurücksetzen
                  </button>
                )}
              </div>

              {/* Typ Filter */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-slate-700 mb-2">Typ</label>
                <div className="space-y-2">
                  {['Fahrrad', 'Baby'].map((typ) => (
                    <button
                      key={typ}
                      onClick={() => setSelectedTyp(selectedTyp === typ ? '' : typ)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left",
                        selectedTyp === typ
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "hover:bg-slate-50 border border-transparent"
                      )}
                    >
                      {typ === 'Fahrrad' ? (
                        <Bike className="w-4 h-4" />
                      ) : (
                        <Users className="w-4 h-4" />
                      )}
                      <span className="text-sm">{typ}</span>
                      <span className="ml-auto text-xs text-slate-500">
                        {shops.filter(s => s.typ === typ).length}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Priorität Filter */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-slate-700 mb-2">Priorität</label>
                <div className="flex gap-2">
                  {['A', 'B', 'C'].map((prio) => (
                    <button
                      key={prio}
                      onClick={() => setSelectedPriorität(selectedPriorität === prio ? '' : prio)}
                      className={cn(
                        "flex-1 py-2 rounded-lg font-semibold text-sm transition-colors border",
                        selectedPriorität === prio
                          ? prio === 'A' ? "bg-red-100 text-red-700 border-red-200" :
                            prio === 'B' ? "bg-amber-100 text-amber-700 border-amber-200" :
                            "bg-slate-100 text-slate-600 border-slate-200"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      )}
                    >
                      {prio}
                    </button>
                  ))}
                </div>
              </div>

              {/* Schwerpunkt Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Schwerpunkt</label>
                <select
                  value={selectedSchwerpunkt}
                  onChange={(e) => setSelectedSchwerpunkt(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Alle Schwerpunkte</option>
                  {schwerpunkte.slice(0, 20).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </aside>

          {/* Mobile Filters */}
          {showMobileFilters && (
            <div className="fixed inset-0 z-50 md:hidden">
              <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileFilters(false)} />
              <div className="absolute right-0 top-0 bottom-0 w-80 bg-white p-5 overflow-y-auto">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-semibold text-slate-900">Filter</h2>
                  <button onClick={() => setShowMobileFilters(false)}>
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Same filter content as desktop */}
                <div className="mb-5">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Typ</label>
                  <div className="space-y-2">
                    {['Fahrrad', 'Baby'].map((typ) => (
                      <button
                        key={typ}
                        onClick={() => setSelectedTyp(selectedTyp === typ ? '' : typ)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left",
                          selectedTyp === typ
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "hover:bg-slate-50 border border-transparent"
                        )}
                      >
                        {typ === 'Fahrrad' ? <Bike className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                        <span className="text-sm">{typ}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Priorität</label>
                  <div className="flex gap-2">
                    {['A', 'B', 'C'].map((prio) => (
                      <button
                        key={prio}
                        onClick={() => setSelectedPriorität(selectedPriorität === prio ? '' : prio)}
                        className={cn(
                          "flex-1 py-2 rounded-lg font-semibold text-sm transition-colors border",
                          selectedPriorität === prio
                            ? getPriorityColor(prio)
                            : "bg-slate-50 text-slate-600 border-slate-200"
                        )}
                      >
                        {prio}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    clearFilters();
                    setShowMobileFilters(false);
                  }}
                  className="w-full py-2 text-blue-600 font-medium"
                >
                  Filter zurücksetzen
                </button>
              </div>
            </div>
          )}

          {/* Shop Grid */}
          <div className="flex-1">
            {filteredShops.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-soft p-12 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Keine Läden gefunden</h3>
                <p className="text-slate-500 mb-4">
                  Versuchen Sie andere Suchbegriffe oder entfernen Sie Filter.
                </p>
                <button
                  onClick={clearFilters}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Filter zurücksetzen
                </button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredShops.map((shop) => (
                  <ShopCard key={shop.id} shop={shop} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ShopCard({ shop }: { shop: Shop }) {
  return (
    <Link
      href={`/shop/${shop.slug}`}
      className="bg-white rounded-2xl shadow-soft p-5 card-hover block"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            shop.typ === 'Baby' ? "bg-pink-100" : "bg-blue-100"
          )}>
            {shop.typ === 'Baby' ? (
              <span className="text-xl">👶</span>
            ) : (
              <Bike className="w-6 h-6 text-blue-600" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 line-clamp-1">{shop.name}</h3>
            <p className="text-sm text-slate-500">{shop.stadtteil}</p>
          </div>
        </div>
        <span className={cn(
          "text-xs font-bold px-2 py-1 rounded border",
          getPriorityColor(shop.prioritaet)
        )}>
          {shop.prioritaet}
        </span>
      </div>

      {/* Geschäftsführer */}
      {shop.geschaeftsfuehrer && shop.geschaeftsfuehrer !== '-' && (
        <div className="flex items-center gap-2 mb-3 text-sm">
          <Building2 className="w-4 h-4 text-violet-500" />
          <span className="text-slate-700 font-medium">{shop.geschaeftsfuehrer}</span>
        </div>
      )}

      {/* Contact Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <span className="truncate">{shop.adresse}</span>
        </div>
        {shop.email && shop.email !== '-' && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Mail className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span className="truncate">{shop.email}</span>
          </div>
        )}
        {shop.telefon && shop.telefon !== '-' && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span>{shop.telefon}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        {shop.bewertung > 0 ? (
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="text-sm font-medium text-slate-900">{shop.bewertung}</span>
            <span className="text-sm text-slate-500">({shop.anzahlBewertungen})</span>
          </div>
        ) : (
          <span className="text-sm text-slate-400">Keine Bewertung</span>
        )}

        {shop.website && shop.website !== '-' && (
          <div className="flex items-center gap-1 text-sm text-blue-600">
            <Globe className="w-4 h-4" />
            <span>Website</span>
          </div>
        )}
      </div>
    </Link>
  );
}
