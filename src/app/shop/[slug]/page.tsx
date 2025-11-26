'use client';

import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import {
  Bike,
  Mail,
  Phone,
  MapPin,
  Star,
  Globe,
  ArrowLeft,
  ExternalLink,
  Navigation,
  Building2,
  Tag,
  Award,
  Users,
  Copy,
  Check
} from 'lucide-react';
import { getShopBySlug, shops } from '@/lib/shops';
import { cn, getPriorityColor, getWebsiteUrl } from '@/lib/utils';
import { useState } from 'react';

export default function ShopDetailPage() {
  const params = useParams();
  const shop = getShopBySlug(params.slug as string);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!shop) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Laden nicht gefunden</h1>
          <Link href="/shops" className="text-blue-600 hover:text-blue-700">
            Zurück zur Übersicht
          </Link>
        </div>
      </div>
    );
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Ähnliche Läden
  const similarShops = shops
    .filter(s => s.id !== shop.id && s.typ === shop.typ && s.stadtteil === shop.stadtteil)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/shops"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Zurück zur Übersicht</span>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* Main Info Card - Spans 2 columns */}
          <div className="md:col-span-2 bg-white rounded-2xl shadow-soft p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center",
                  shop.typ === 'Baby' ? "bg-pink-100" : "bg-blue-100"
                )}>
                  {shop.typ === 'Baby' ? (
                    <span className="text-3xl">👶</span>
                  ) : (
                    <Bike className="w-8 h-8 text-blue-600" />
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">{shop.name}</h1>
                  <p className="text-slate-500">{shop.firma || shop.adresse}</p>
                </div>
              </div>
              <span className={cn(
                "text-sm font-bold px-3 py-1.5 rounded-lg border",
                getPriorityColor(shop.prioritaet)
              )}>
                Priorität {shop.prioritaet}
              </span>
            </div>

            {/* Bewertung */}
            {shop.bewertung > 0 && (
              <div className="flex items-center gap-4 mb-6 p-4 bg-amber-50 rounded-xl">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        "w-5 h-5",
                        star <= Math.round(shop.bewertung)
                          ? "text-amber-500 fill-amber-500"
                          : "text-slate-300"
                      )}
                    />
                  ))}
                </div>
                <span className="text-xl font-bold text-slate-900">{shop.bewertung}</span>
                <span className="text-slate-500">({shop.anzahlBewertungen} Bewertungen)</span>
              </div>
            )}

            {/* Adresse */}
            <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
              <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-slate-900 font-medium">{shop.adresse}</p>
                <p className="text-sm text-slate-500">{shop.stadtteil}, {shop.plz} Köln</p>
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shop.adresse + ', Köln')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                <Navigation className="w-4 h-4" />
                Route
              </a>
            </div>
          </div>

          {/* Geschäftsführer Card - Prominently displayed */}
          <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl shadow-soft p-6 text-white">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-5 h-5" />
              <span className="font-medium">Geschäftsführer</span>
            </div>
            {shop.geschaeftsfuehrer && shop.geschaeftsfuehrer !== '-' ? (
              <>
                <p className="text-2xl font-bold mb-2">{shop.geschaeftsfuehrer}</p>
                <p className="text-violet-200 text-sm mb-4">{shop.firma || shop.name}</p>
                <a
                  href={`https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(shop.geschaeftsfuehrer + ' ' + shop.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                  Auf LinkedIn suchen
                </a>
              </>
            ) : (
              <p className="text-violet-200">Nicht bekannt</p>
            )}
          </div>

          {/* Kontakt Card */}
          <div className="bg-white rounded-2xl shadow-soft p-6">
            <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-slate-400" />
              Kontakt
            </h2>
            <div className="space-y-3">
              {shop.telefon && shop.telefon !== '-' && (
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg group">
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <a href={`tel:${shop.telefon}`} className="text-slate-900 hover:text-blue-600">
                      {shop.telefon}
                    </a>
                  </div>
                  <button
                    onClick={() => copyToClipboard(shop.telefon, 'telefon')}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {copiedField === 'telefon' ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                    )}
                  </button>
                </div>
              )}

              {shop.email && shop.email !== '-' && (
                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg group">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-emerald-600" />
                    <a href={`mailto:${shop.email}`} className="text-slate-900 hover:text-blue-600 truncate">
                      {shop.email}
                    </a>
                  </div>
                  <button
                    onClick={() => copyToClipboard(shop.email, 'email')}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {copiedField === 'email' ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                    )}
                  </button>
                </div>
              )}

              {shop.website && shop.website !== '-' && (
                <a
                  href={getWebsiteUrl(shop.website)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-blue-600" />
                    <span className="text-slate-900">{shop.website}</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-blue-600" />
                </a>
              )}
            </div>
          </div>

          {/* Marken Card */}
          <div className="bg-white rounded-2xl shadow-soft p-6">
            <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-slate-400" />
              Marken
            </h2>
            {shop.marken.length > 0 && shop.marken[0] !== '-' ? (
              <div className="flex flex-wrap gap-2">
                {shop.marken.map((marke, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm"
                  >
                    {marke}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-slate-400">Keine Marken angegeben</p>
            )}
          </div>

          {/* Schwerpunkte Card */}
          <div className="bg-white rounded-2xl shadow-soft p-6">
            <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-slate-400" />
              Schwerpunkte
            </h2>
            {shop.schwerpunkte.length > 0 && shop.schwerpunkte[0] !== '-' ? (
              <div className="flex flex-wrap gap-2">
                {shop.schwerpunkte.map((schwerpunkt, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm"
                  >
                    {schwerpunkt}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-slate-400">Keine Schwerpunkte angegeben</p>
            )}
          </div>

          {/* Route Info */}
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-soft p-6 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Navigation className="w-5 h-5" />
              <span className="font-medium">Vertriebsroute</span>
            </div>
            <p className="text-4xl font-bold mb-1">Route {shop.route}</p>
            <p className="text-emerald-200 text-sm">
              {shops.filter(s => s.route === shop.route).length} Läden auf dieser Route
            </p>
          </div>
        </div>

        {/* Ähnliche Läden */}
        {similarShops.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              Weitere Läden in {shop.stadtteil}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {similarShops.map((similar) => (
                <Link
                  key={similar.id}
                  href={`/shop/${similar.slug}`}
                  className="bg-white rounded-xl p-4 shadow-soft hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      similar.typ === 'Baby' ? "bg-pink-100" : "bg-blue-100"
                    )}>
                      {similar.typ === 'Baby' ? '👶' : <Bike className="w-5 h-5 text-blue-600" />}
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900">{similar.name}</h3>
                      <p className="text-sm text-slate-500">{similar.geschaeftsfuehrer !== '-' ? similar.geschaeftsfuehrer : similar.adresse}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
