'use client';

import Link from 'next/link';
import { SearchBar } from '@/components/ui/search-bar';
import { getStats, shops } from '@/lib/shops';
import {
  Bike,
  Mail,
  MapPin,
  Users,
  Star,
  TrendingUp,
  ArrowRight,
  Building2
} from 'lucide-react';

export default function Home() {
  const stats = getStats();

  // Berechne zusätzliche Stats
  const avgBewertung = shops.filter(s => s.bewertung > 0).length > 0
    ? (shops.filter(s => s.bewertung > 0).reduce((sum, s) => sum + s.bewertung, 0) / shops.filter(s => s.bewertung > 0).length).toFixed(1)
    : '0';

  const totalBewertungen = shops.reduce((sum, s) => sum + s.anzahlBewertungen, 0);

  const statCards = [
    {
      label: 'Fahrradläden',
      value: stats.fahrrad,
      icon: Bike,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      label: 'Babyausstatter',
      value: stats.baby,
      icon: Users,
      color: 'bg-pink-500',
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-600'
    },
    {
      label: 'Mit E-Mail',
      value: stats.mitEmail,
      icon: Mail,
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600'
    },
    {
      label: 'Geschäftsführer bekannt',
      value: stats.mitGF,
      icon: Building2,
      color: 'bg-violet-500',
      bgColor: 'bg-violet-50',
      textColor: 'text-violet-600'
    },
    {
      label: 'Priorität A',
      value: stats.prioA,
      icon: TrendingUp,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600'
    },
    {
      label: 'Ø Bewertung',
      value: avgBewertung,
      icon: Star,
      color: 'bg-amber-500',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
      suffix: '★'
    },
  ];

  // Top 5 Priorität A Läden
  const topShops = shops
    .filter(s => s.prioritaet === 'A')
    .sort((a, b) => b.anzahlBewertungen - a.anzahlBewertungen)
    .slice(0, 5);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-sm font-medium">{stats.total} Läden indexiert</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Kölns Fahrrad-Ökosystem.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                Entschlüsselt.
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10">
              Ihr datengetriebenes Sales-Tool für den Kölner Fahrradmarkt.
              Geschäftsführer, Kontaktdaten, Bewertungen – alles an einem Ort.
            </p>

            {/* Omni-Search */}
            <div className="max-w-2xl mx-auto mb-8">
              <SearchBar large />
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap justify-center gap-3 text-sm">
              <span className="text-slate-400">Beliebte Suchen:</span>
              {['Rennrad', 'E-Bike', 'Nippes', 'Ehrenfeld', 'Kinderanhänger'].map((term) => (
                <Link
                  key={term}
                  href={`/shops?search=${encodeURIComponent(term)}`}
                  className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded-lg transition-colors"
                >
                  {term}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="#f8fafc"
            />
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {statCards.map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-2xl p-5 shadow-soft card-hover"
              >
                <div className={`w-10 h-10 ${stat.bgColor} rounded-xl flex items-center justify-center mb-3`}>
                  <stat.icon className={`w-5 h-5 ${stat.textColor}`} />
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  {stat.value}{stat.suffix || ''}
                </div>
                <div className="text-sm text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Access Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Top Priorität A Läden</h2>
              <p className="text-slate-500">Die wichtigsten Kontakte für Ihren Vertrieb</p>
            </div>
            <Link
              href="/shops?prioritaet=A"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Alle anzeigen
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {topShops.map((shop) => (
              <Link
                key={shop.id}
                href={`/shop/${shop.slug}`}
                className="bg-slate-50 hover:bg-slate-100 rounded-xl p-4 transition-all duration-200 hover:shadow-md group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <Bike className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-slate-900 truncate">{shop.name}</h3>
                    <p className="text-sm text-slate-500 truncate">
                      {shop.geschaeftsfuehrer !== '-' ? shop.geschaeftsfuehrer : shop.stadtteil}
                    </p>
                    {shop.bewertung > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span className="text-xs text-slate-600">{shop.bewertung} ({shop.anzahlBewertungen})</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-white">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                Bereit für effizienteres Vertriebsmanagement?
              </h2>
              <p className="text-blue-100">
                Durchsuchen Sie alle {stats.total} Läden und finden Sie Ihre nächsten Kunden.
              </p>
            </div>
            <div className="flex gap-4">
              <Link
                href="/shops"
                className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-xl font-semibold transition-colors shadow-lg"
              >
                Alle Läden durchsuchen
              </Link>
              <Link
                href="/map"
                className="bg-blue-500 text-white hover:bg-blue-400 px-6 py-3 rounded-xl font-semibold transition-colors border border-blue-400"
              >
                Zur Karte
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-900 text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Bike className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-white">DataBike</span>
            </div>
            <p className="text-sm">
              © 2025 DataBike. B2B Sales Tool für den Kölner Fahrradmarkt.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
