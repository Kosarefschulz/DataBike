'use client';

import { useState, useEffect, useMemo } from 'react';
import { Shop, Vertrieb } from '@/types/shop';
import {
  Briefcase,
  ArrowLeft,
  Check,
  Circle,
  X,
  Calendar,
  Bike,
  Baby,
  Star,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { cn, getPriorityColor } from '@/lib/utils';

interface RouteInfo {
  number: number;
  shops: Shop[];
  completed: number;
}

export default function VertriebstoolPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState<number | null>(null);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Vertrieb>({
    interesse: null,
    terminDatum: null,
    budgetVorhanden: null,
    entscheiderGesprochen: null,
    naechsterSchritt: '',
    zuletztAktualisiert: null
  });

  // Load shops from API
  useEffect(() => {
    async function loadShops() {
      try {
        const res = await fetch('/api/shops');
        const data = await res.json();
        if (data.success) {
          setShops(data.shops);
        }
      } catch (error) {
        console.error('Failed to load shops:', error);
      } finally {
        setLoading(false);
      }
    }
    loadShops();
  }, []);

  // Group shops by route
  const routes = useMemo<RouteInfo[]>(() => {
    const routeMap = new Map<number, Shop[]>();

    shops.forEach(shop => {
      if (shop.route && shop.route > 0) {
        const existing = routeMap.get(shop.route) || [];
        existing.push(shop);
        routeMap.set(shop.route, existing);
      }
    });

    return Array.from(routeMap.entries())
      .map(([number, routeShops]) => ({
        number,
        shops: routeShops.sort((a, b) => a.name.localeCompare(b.name)),
        completed: routeShops.filter(s => s.vertrieb?.interesse !== null).length
      }))
      .sort((a, b) => a.number - b.number);
  }, [shops]);

  // Get shops for selected route
  const routeShops = useMemo(() => {
    if (selectedRoute === null) return [];
    return routes.find(r => r.number === selectedRoute)?.shops || [];
  }, [routes, selectedRoute]);

  // Open shop form
  const openShopForm = (shop: Shop) => {
    setSelectedShop(shop);
    setFormData(shop.vertrieb || {
      interesse: null,
      terminDatum: null,
      budgetVorhanden: null,
      entscheiderGesprochen: null,
      naechsterSchritt: '',
      zuletztAktualisiert: null
    });
  };

  // Save vertrieb data
  const saveVertrieb = async () => {
    if (!selectedShop) return;

    setSaving(true);
    try {
      const shopId = selectedShop._id || selectedShop.slug;
      const res = await fetch(`/api/shops/${shopId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vertrieb: {
            ...formData,
            zuletztAktualisiert: new Date().toISOString()
          }
        })
      });

      if (res.ok) {
        // Update local state
        setShops(prev => prev.map(s => {
          if ((s._id === selectedShop._id) || (s.slug === selectedShop.slug)) {
            return {
              ...s,
              vertrieb: {
                ...formData,
                zuletztAktualisiert: new Date().toISOString()
              }
            };
          }
          return s;
        }));
        setSelectedShop(null);
      }
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setSaving(false);
    }
  };

  // Check if shop is completed
  const isCompleted = (shop: Shop) => shop.vertrieb?.interesse !== null;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Route Selection View
  if (selectedRoute === null) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <Briefcase className="w-7 h-7 text-blue-600" />
              Vertriebstool
            </h1>
            <p className="text-slate-500 mt-1">Wähle eine Route, um die Läden zu bearbeiten</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {routes.map(route => {
              const progress = route.shops.length > 0
                ? Math.round((route.completed / route.shops.length) * 100)
                : 0;

              return (
                <button
                  key={route.number}
                  onClick={() => setSelectedRoute(route.number)}
                  className="bg-white rounded-xl border border-slate-200 p-6 text-left hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-semibold text-slate-900">Route {route.number}</span>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </div>

                  <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
                    <span>{route.shops.length} Läden</span>
                    <span className="text-slate-300">|</span>
                    <span className={cn(
                      route.completed === route.shops.length && route.shops.length > 0
                        ? "text-green-600"
                        : "text-amber-600"
                    )}>
                      {route.shops.length - route.completed} offen
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full transition-all",
                        progress === 100 ? "bg-green-500" : "bg-blue-500"
                      )}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="text-xs text-slate-500 mt-1 text-right">{progress}%</div>
                </button>
              );
            })}
          </div>

          {routes.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              Keine Routen gefunden. Läden müssen einer Route zugewiesen sein.
            </div>
          )}
        </div>
      </div>
    );
  }

  // Route Detail View
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => setSelectedRoute(null)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Route {selectedRoute}</h1>
            <p className="text-slate-500">
              {routeShops.filter(isCompleted).length} von {routeShops.length} erledigt
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Fortschritt</span>
            <span className="text-sm text-slate-500">
              {Math.round((routeShops.filter(isCompleted).length / routeShops.length) * 100)}%
            </span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all"
              style={{ width: `${(routeShops.filter(isCompleted).length / routeShops.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Shop List */}
        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
          {routeShops.map(shop => (
            <div
              key={shop._id || shop.slug}
              className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                {/* Status Icon */}
                {isCompleted(shop) ? (
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                ) : (
                  <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                    <Circle className="w-4 h-4 text-slate-400" />
                  </div>
                )}

                {/* Shop Info */}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900">{shop.name}</span>
                    <span className={cn(
                      "text-xs font-bold px-1.5 py-0.5 rounded border",
                      getPriorityColor(shop.prioritaet)
                    )}>
                      {shop.prioritaet}
                    </span>
                  </div>
                  <div className="text-sm text-slate-500 flex items-center gap-2">
                    {shop.geschaeftsfuehrer && shop.geschaeftsfuehrer !== '-' && (
                      <span>{shop.geschaeftsfuehrer}</span>
                    )}
                    {shop.bewertung > 0 && (
                      <>
                        <span className="text-slate-300">|</span>
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                          {shop.bewertung}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => openShopForm(shop)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  isCompleted(shop)
                    ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                )}
              >
                {isCompleted(shop) ? 'Bearbeiten' : 'Ausfüllen'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {selectedShop && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div>
                <h2 className="font-semibold text-lg text-slate-900">{selectedShop.name}</h2>
                <p className="text-sm text-slate-500">
                  {selectedShop.geschaeftsfuehrer !== '-' && selectedShop.geschaeftsfuehrer}
                  {selectedShop.geschaeftsfuehrer !== '-' && ' • '}
                  {selectedShop.adresse}
                </p>
              </div>
              <button
                onClick={() => setSelectedShop(null)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 space-y-6">
              {/* 1. Interesse */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  1. Interesse vorhanden?
                </label>
                <div className="flex gap-3">
                  {(['ja', 'nein', 'vielleicht'] as const).map(option => (
                    <button
                      key={option}
                      onClick={() => setFormData(prev => ({ ...prev, interesse: option }))}
                      className={cn(
                        "flex-1 py-2.5 rounded-lg border text-sm font-medium transition-colors",
                        formData.interesse === option
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "bg-white border-slate-200 text-slate-700 hover:border-blue-300"
                      )}
                    >
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Termin */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  2. Termin vereinbart?
                </label>
                <div className="flex gap-3 mb-3">
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, terminDatum: prev.terminDatum || new Date().toISOString().split('T')[0] }))}
                    className={cn(
                      "flex-1 py-2.5 rounded-lg border text-sm font-medium transition-colors",
                      formData.terminDatum
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "bg-white border-slate-200 text-slate-700 hover:border-blue-300"
                    )}
                  >
                    Ja
                  </button>
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, terminDatum: null }))}
                    className={cn(
                      "flex-1 py-2.5 rounded-lg border text-sm font-medium transition-colors",
                      formData.terminDatum === null
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "bg-white border-slate-200 text-slate-700 hover:border-blue-300"
                    )}
                  >
                    Nein
                  </button>
                </div>
                {formData.terminDatum !== null && (
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="date"
                      value={formData.terminDatum || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, terminDatum: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>

              {/* 3. Budget */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  3. Budget vorhanden?
                </label>
                <div className="flex gap-3">
                  {(['ja', 'nein', 'unbekannt'] as const).map(option => (
                    <button
                      key={option}
                      onClick={() => setFormData(prev => ({ ...prev, budgetVorhanden: option }))}
                      className={cn(
                        "flex-1 py-2.5 rounded-lg border text-sm font-medium transition-colors",
                        formData.budgetVorhanden === option
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "bg-white border-slate-200 text-slate-700 hover:border-blue-300"
                      )}
                    >
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Entscheider */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  4. Mit Entscheider gesprochen?
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, entscheiderGesprochen: true }))}
                    className={cn(
                      "flex-1 py-2.5 rounded-lg border text-sm font-medium transition-colors",
                      formData.entscheiderGesprochen === true
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "bg-white border-slate-200 text-slate-700 hover:border-blue-300"
                    )}
                  >
                    Ja
                  </button>
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, entscheiderGesprochen: false }))}
                    className={cn(
                      "flex-1 py-2.5 rounded-lg border text-sm font-medium transition-colors",
                      formData.entscheiderGesprochen === false
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "bg-white border-slate-200 text-slate-700 hover:border-blue-300"
                    )}
                  >
                    Nein
                  </button>
                </div>
              </div>

              {/* 5. Nächster Schritt */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  5. Nächster Schritt
                </label>
                <textarea
                  value={formData.naechsterSchritt}
                  onChange={(e) => setFormData(prev => ({ ...prev, naechsterSchritt: e.target.value }))}
                  placeholder="z.B. Angebot senden, Rückruf nächste Woche..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setSelectedShop(null)}
                className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={saveVertrieb}
                disabled={saving}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
