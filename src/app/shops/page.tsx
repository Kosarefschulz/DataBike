'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
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
  Building2,
  Users,
  ChevronDown,
  ChevronUp,
  Plus,
  Baby
} from 'lucide-react';
import { shops, getUniqueValues, getStats } from '@/lib/shops';
import { Shop } from '@/types/shop';
import { cn, getPriorityColor } from '@/lib/utils';

export default function ShopsPage() {
  const searchParams = useSearchParams();

  // Filter states - ALLE Filter
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedTyp, setSelectedTyp] = useState(searchParams.get('typ') || '');
  const [selectedPriorität, setSelectedPriorität] = useState(searchParams.get('prioritaet') || '');
  const [selectedStadtteil, setSelectedStadtteil] = useState(searchParams.get('stadtteil') || '');
  const [selectedSchwerpunkt, setSelectedSchwerpunkt] = useState(searchParams.get('schwerpunkt') || '');
  const [selectedMarke, setSelectedMarke] = useState(searchParams.get('marke') || '');
  const [selectedRoute, setSelectedRoute] = useState(searchParams.get('route') || '');
  const [hasEmail, setHasEmail] = useState(searchParams.get('email') === 'true');
  const [hasWebsite, setHasWebsite] = useState(searchParams.get('website') === 'true');
  const [hasGF, setHasGF] = useState(searchParams.get('gf') === 'true');
  const [minBewertung, setMinBewertung] = useState(searchParams.get('bewertung') || '');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    typ: true,
    prioritaet: true,
    stadtteil: true,
    kontakt: true,
    schwerpunkt: false,
    marke: false,
    route: false
  });

  // Get unique values for filters
  const stadtteile = useMemo(() => {
    const unique = new Set<string>();
    shops.forEach(s => s.stadtteil && unique.add(s.stadtteil));
    return Array.from(unique).sort();
  }, []);

  const schwerpunkte = useMemo(() => getUniqueValues('schwerpunkte'), []);
  const marken = useMemo(() => getUniqueValues('marken'), []);
  const routen = useMemo(() => {
    const unique = new Set<number>();
    shops.forEach(s => s.route && unique.add(s.route));
    return Array.from(unique).sort((a, b) => a - b);
  }, []);

  const stats = getStats();

  // Filter shops - ALLE Filter anwenden
  const filteredShops = useMemo(() => {
    return shops.filter(shop => {
      // Search filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          shop.name.toLowerCase().includes(q) ||
          shop.adresse.toLowerCase().includes(q) ||
          shop.geschaeftsfuehrer.toLowerCase().includes(q) ||
          shop.email.toLowerCase().includes(q) ||
          shop.telefon.toLowerCase().includes(q) ||
          shop.marken.some(m => m.toLowerCase().includes(q)) ||
          shop.schwerpunkte.some(s => s.toLowerCase().includes(q));
        if (!matchesSearch) return false;
      }

      // Typ filter
      if (selectedTyp && shop.typ !== selectedTyp) return false;

      // Priorität filter
      if (selectedPriorität && shop.prioritaet !== selectedPriorität) return false;

      // Stadtteil filter
      if (selectedStadtteil && shop.stadtteil !== selectedStadtteil) return false;

      // Schwerpunkt filter
      if (selectedSchwerpunkt && !shop.schwerpunkte.some(s =>
        s.toLowerCase().includes(selectedSchwerpunkt.toLowerCase())
      )) return false;

      // Marke filter
      if (selectedMarke && !shop.marken.some(m =>
        m.toLowerCase().includes(selectedMarke.toLowerCase())
      )) return false;

      // Route filter
      if (selectedRoute && shop.route !== parseInt(selectedRoute)) return false;

      // Email filter
      if (hasEmail && (!shop.email || shop.email === '-')) return false;

      // Website filter
      if (hasWebsite && (!shop.website || shop.website === '-')) return false;

      // Geschäftsführer filter
      if (hasGF && (!shop.geschaeftsfuehrer || shop.geschaeftsfuehrer === '-')) return false;

      // Bewertung filter
      if (minBewertung && shop.bewertung < parseFloat(minBewertung)) return false;

      return true;
    });
  }, [searchQuery, selectedTyp, selectedPriorität, selectedStadtteil, selectedSchwerpunkt, selectedMarke, selectedRoute, hasEmail, hasWebsite, hasGF, minBewertung]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedTyp) params.set('typ', selectedTyp);
    if (selectedPriorität) params.set('prioritaet', selectedPriorität);
    if (selectedStadtteil) params.set('stadtteil', selectedStadtteil);
    if (selectedSchwerpunkt) params.set('schwerpunkt', selectedSchwerpunkt);
    if (selectedMarke) params.set('marke', selectedMarke);
    if (selectedRoute) params.set('route', selectedRoute);
    if (hasEmail) params.set('email', 'true');
    if (hasWebsite) params.set('website', 'true');
    if (hasGF) params.set('gf', 'true');
    if (minBewertung) params.set('bewertung', minBewertung);

    const newUrl = params.toString() ? `/shops?${params.toString()}` : '/shops';
    window.history.replaceState({}, '', newUrl);
  }, [searchQuery, selectedTyp, selectedPriorität, selectedStadtteil, selectedSchwerpunkt, selectedMarke, selectedRoute, hasEmail, hasWebsite, hasGF, minBewertung]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTyp('');
    setSelectedPriorität('');
    setSelectedStadtteil('');
    setSelectedSchwerpunkt('');
    setSelectedMarke('');
    setSelectedRoute('');
    setHasEmail(false);
    setHasWebsite(false);
    setHasGF(false);
    setMinBewertung('');
  };

  const activeFiltersCount = [
    selectedTyp, selectedPriorität, selectedStadtteil, selectedSchwerpunkt,
    selectedMarke, selectedRoute, hasEmail, hasWebsite, hasGF, minBewertung
  ].filter(Boolean).length;

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const FilterSection = ({ title, section, children }: { title: string; section: string; children: React.ReactNode }) => (
    <div className="border-b border-slate-100 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
      <button
        onClick={() => toggleSection(section)}
        className="w-full flex items-center justify-between text-sm font-medium text-slate-700 mb-2"
      >
        {title}
        {expandedSections[section] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {expandedSections[section] && children}
    </div>
  );

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
                {activeFiltersCount > 0 && ` (${activeFiltersCount} Filter aktiv)`}
              </p>
            </div>

            {/* Search and Actions */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1 md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Name, Adresse, Email, Geschäftsführer..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 caret-blue-600"
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

              {/* Add New Shop Button */}
              <Link
                href="/admin"
                className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
              >
                <Plus className="w-5 h-5" />
                Neuer Laden
              </Link>

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
          <aside className="hidden md:block w-72 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-soft p-5 sticky top-36 max-h-[calc(100vh-10rem)] overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-slate-900">Filter</h2>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Alle zurücksetzen
                  </button>
                )}
              </div>

              {/* Typ Filter */}
              <FilterSection title="Typ" section="typ">
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
                      <span className="ml-auto text-xs text-slate-500">
                        {shops.filter(s => s.typ === typ).length}
                      </span>
                    </button>
                  ))}
                </div>
              </FilterSection>

              {/* Priorität Filter */}
              <FilterSection title="Priorität" section="prioritaet">
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
                            "bg-slate-200 text-slate-700 border-slate-300"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      )}
                    >
                      {prio}
                      <span className="block text-xs font-normal mt-0.5">
                        {shops.filter(s => s.prioritaet === prio).length}
                      </span>
                    </button>
                  ))}
                </div>
              </FilterSection>

              {/* Stadtteil Filter */}
              <FilterSection title="Stadtteil" section="stadtteil">
                <select
                  value={selectedStadtteil}
                  onChange={(e) => setSelectedStadtteil(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Alle Stadtteile</option>
                  {stadtteile.map((s) => (
                    <option key={s} value={s}>{s} ({shops.filter(shop => shop.stadtteil === s).length})</option>
                  ))}
                </select>
              </FilterSection>

              {/* Kontakt Filter */}
              <FilterSection title="Kontaktdaten" section="kontakt">
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasEmail}
                      onChange={(e) => setHasEmail(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Mail className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm text-slate-700">Mit E-Mail</span>
                    <span className="ml-auto text-xs text-slate-500">{stats.mitEmail}</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasWebsite}
                      onChange={(e) => setHasWebsite(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Globe className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-slate-700">Mit Website</span>
                    <span className="ml-auto text-xs text-slate-500">
                      {shops.filter(s => s.website && s.website !== '-').length}
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasGF}
                      onChange={(e) => setHasGF(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Building2 className="w-4 h-4 text-violet-500" />
                    <span className="text-sm text-slate-700">GF bekannt</span>
                    <span className="ml-auto text-xs text-slate-500">{stats.mitGF}</span>
                  </label>
                </div>
              </FilterSection>

              {/* Bewertung Filter */}
              <FilterSection title="Mindestbewertung" section="bewertung">
                <div className="flex gap-1">
                  {['', '3', '4', '4.5'].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setMinBewertung(rating)}
                      className={cn(
                        "flex-1 py-2 rounded-lg text-sm transition-colors border flex items-center justify-center gap-1",
                        minBewertung === rating
                          ? "bg-amber-100 text-amber-700 border-amber-200"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      )}
                    >
                      {rating ? (
                        <>
                          <Star className="w-3 h-3 fill-current" />
                          {rating}+
                        </>
                      ) : 'Alle'}
                    </button>
                  ))}
                </div>
              </FilterSection>

              {/* Schwerpunkt Filter */}
              <FilterSection title="Schwerpunkt" section="schwerpunkt">
                <select
                  value={selectedSchwerpunkt}
                  onChange={(e) => setSelectedSchwerpunkt(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Alle Schwerpunkte</option>
                  {schwerpunkte.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </FilterSection>

              {/* Marken Filter */}
              <FilterSection title="Marken" section="marke">
                <select
                  value={selectedMarke}
                  onChange={(e) => setSelectedMarke(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Alle Marken</option>
                  {marken.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </FilterSection>

              {/* Route Filter */}
              <FilterSection title="Vertriebsroute" section="route">
                <select
                  value={selectedRoute}
                  onChange={(e) => setSelectedRoute(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Alle Routen</option>
                  {routen.map((r) => (
                    <option key={r} value={r}>Route {r} ({shops.filter(s => s.route === r).length} Läden)</option>
                  ))}
                </select>
              </FilterSection>
            </div>
          </aside>

          {/* Mobile Filters */}
          {showMobileFilters && (
            <div className="fixed inset-0 z-50 md:hidden">
              <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileFilters(false)} />
              <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white p-5 overflow-y-auto">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-semibold text-slate-900">Filter ({activeFiltersCount} aktiv)</h2>
                  <button onClick={() => setShowMobileFilters(false)}>
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Mobile Filter Content - Same as desktop */}
                <div className="space-y-4">
                  {/* Quick toggles */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setHasEmail(!hasEmail)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-colors",
                        hasEmail ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-slate-50 border-slate-200"
                      )}
                    >
                      <Mail className="w-4 h-4" />
                      Mit Email
                    </button>
                    <button
                      onClick={() => setHasGF(!hasGF)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-colors",
                        hasGF ? "bg-violet-50 border-violet-200 text-violet-700" : "bg-slate-50 border-slate-200"
                      )}
                    >
                      <Building2 className="w-4 h-4" />
                      GF bekannt
                    </button>
                  </div>

                  {/* Typ */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Typ</label>
                    <div className="flex gap-2">
                      {['Fahrrad', 'Baby'].map((typ) => (
                        <button
                          key={typ}
                          onClick={() => setSelectedTyp(selectedTyp === typ ? '' : typ)}
                          className={cn(
                            "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm border transition-colors",
                            selectedTyp === typ ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-slate-50 border-slate-200"
                          )}
                        >
                          {typ === 'Fahrrad' ? <Bike className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                          {typ}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Priorität */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Priorität</label>
                    <div className="flex gap-2">
                      {['A', 'B', 'C'].map((prio) => (
                        <button
                          key={prio}
                          onClick={() => setSelectedPriorität(selectedPriorität === prio ? '' : prio)}
                          className={cn(
                            "flex-1 py-2 rounded-lg font-semibold text-sm border transition-colors",
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

                  {/* Stadtteil */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Stadtteil</label>
                    <select
                      value={selectedStadtteil}
                      onChange={(e) => setSelectedStadtteil(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                    >
                      <option value="">Alle Stadtteile</option>
                      {stadtteile.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  {/* Route */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Vertriebsroute</label>
                    <select
                      value={selectedRoute}
                      onChange={(e) => setSelectedRoute(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                    >
                      <option value="">Alle Routen</option>
                      {routen.map((r) => (
                        <option key={r} value={r}>Route {r}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => {
                      clearFilters();
                      setShowMobileFilters(false);
                    }}
                    className="flex-1 py-3 border border-slate-200 rounded-xl text-slate-600 font-medium"
                  >
                    Zurücksetzen
                  </button>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium"
                  >
                    {filteredShops.length} Ergebnisse
                  </button>
                </div>
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
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
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
  const [isInRoute, setIsInRoute] = useState(false);

  // Check if shop is in route (localStorage)
  useEffect(() => {
    const routeShops = JSON.parse(localStorage.getItem('routeShops') || '[]');
    setIsInRoute(routeShops.some((s: Shop) => s.id === shop.id));
  }, [shop.id]);

  const addToRoute = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const routeShops = JSON.parse(localStorage.getItem('routeShops') || '[]');
    if (!routeShops.some((s: Shop) => s.id === shop.id)) {
      routeShops.push(shop);
      localStorage.setItem('routeShops', JSON.stringify(routeShops));
      setIsInRoute(true);
    }
  };

  return (
    <Link
      href={`/shop/${shop.slug}`}
      className="bg-white rounded-2xl shadow-soft p-5 card-hover block"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center",
            shop.typ === 'Baby' ? "bg-slate-100" : "bg-slate-100"
          )}>
            {shop.typ === 'Baby' ? (
              <Baby className="w-5 h-5 text-slate-600" />
            ) : (
              <Bike className="w-5 h-5 text-slate-600" />
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
          <span className="text-slate-700">{shop.geschaeftsfuehrer}</span>
        </div>
      )}

      {/* Contact Info */}
      <div className="space-y-1.5 mb-4 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <span className="truncate">{shop.adresse}</span>
        </div>
        {shop.email && shop.email !== '-' && (
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span className="truncate">{shop.email}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div className="flex items-center gap-3">
          {shop.bewertung > 0 && (
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="text-sm font-medium text-slate-900">{shop.bewertung}</span>
            </div>
          )}
          <span className="text-xs text-slate-400">
            Route {shop.route}
          </span>
        </div>

        {/* Add to Route Button */}
        <button
          onClick={addToRoute}
          disabled={isInRoute}
          className={cn(
            "flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors",
            isInRoute
              ? "bg-slate-100 text-slate-400 cursor-default"
              : "bg-blue-50 text-blue-600 hover:bg-blue-100"
          )}
        >
          <Plus className="w-3.5 h-3.5" />
          {isInRoute ? 'In Route' : 'Route'}
        </button>
      </div>
    </Link>
  );
}
