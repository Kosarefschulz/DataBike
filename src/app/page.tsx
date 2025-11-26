'use client';

import Link from 'next/link';
import Image from 'next/image';
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
  Building2,
  Route,
  Target,
  Zap
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

  // Features für Feature-Section
  const features = [
    {
      icon: Target,
      title: 'Intelligente Priorisierung',
      description: 'Automatische Kategorisierung nach Verkaufspotenzial mit A/B/C-Bewertung.',
      image: '/images/bike-wheel.jpg'
    },
    {
      icon: Route,
      title: 'Routenoptimierung',
      description: 'Planen Sie Ihre Vertriebstouren effizient mit unserer Kartenansicht.',
      image: '/images/cyclist-action.jpg'
    },
    {
      icon: Zap,
      title: 'Schnelle Kontaktaufnahme',
      description: 'Direkter Zugriff auf E-Mails, Telefon und Geschäftsführer-Daten.',
      image: '/images/bike-shop.jpg'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section with Image */}
      <section className="relative overflow-hidden min-h-[85vh] flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero-bike.jpg"
            alt="Professionelles Fahrrad"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-slate-900/60" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-white">{stats.total} Läden indexiert • Live-Daten</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-white">
              Kölns Fahrrad-Ökosystem.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                Entschlüsselt.
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mb-10">
              Ihr datengetriebenes Sales-Tool für den Kölner Fahrradmarkt.
              Geschäftsführer, Kontaktdaten, Bewertungen – alles an einem Ort.
            </p>

            {/* Omni-Search */}
            <div className="max-w-xl mb-8">
              <SearchBar large />
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="text-slate-400">Beliebte Suchen:</span>
              {['Rennrad', 'E-Bike', 'Nippes', 'Ehrenfeld', 'Kinderanhänger'].map((term) => (
                <Link
                  key={term}
                  href={`/shops?search=${encodeURIComponent(term)}`}
                  className="bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-lg transition-colors"
                >
                  {term}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
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

      {/* Features Section with Images */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Alles was Sie für Ihren Vertrieb brauchen
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              DataBike vereint alle relevanten Daten für effizientes B2B-Sales im Fahrradmarkt.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-slate-50 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-slate-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Shops Section */}
      <section className="py-16 bg-slate-50">
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
                className="bg-white hover:bg-slate-50 rounded-xl p-4 transition-all duration-200 hover:shadow-md group border border-slate-100"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-md">
                    <Bike className="w-6 h-6 text-white" />
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

      {/* E-Bike Highlight Section */}
      <section className="py-20 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block bg-blue-100 text-blue-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
                Wachstumsmarkt E-Bike
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                Der E-Bike Boom in Köln
              </h2>
              <p className="text-lg text-slate-600 mb-6">
                E-Bikes sind der am schnellsten wachsende Sektor im Fahrradmarkt.
                Mit DataBike finden Sie alle Händler mit E-Bike-Fokus und deren Ansprechpartner.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  `${shops.filter(s => s.schwerpunkte.some(sw => sw.toLowerCase().includes('e-bike'))).length}+ Läden mit E-Bike-Fokus`,
                  'Direkter Kontakt zu Entscheidern',
                  'Google-Bewertungen & Markenportfolio'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/shops?schwerpunkt=E-Bike"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors shadow-lg shadow-blue-600/25"
              >
                E-Bike Händler finden
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="relative">
              <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/ebike.jpg"
                  alt="E-Bike"
                  fill
                  className="object-cover"
                />
              </div>
              {/* Floating Stats */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl p-4 shadow-xl border border-slate-100">
                <div className="text-3xl font-bold text-blue-600">{stats.fahrrad}</div>
                <div className="text-sm text-slate-500">Fahrradhändler</div>
              </div>
              <div className="absolute -top-6 -right-6 bg-white rounded-xl p-4 shadow-xl border border-slate-100">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <span className="text-2xl font-bold text-slate-900">{avgBewertung}</span>
                </div>
                <div className="text-sm text-slate-500">Ø Bewertung</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-white text-center lg:text-left">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Bereit für effizienteres Vertriebsmanagement?
              </h2>
              <p className="text-xl text-blue-100 max-w-2xl">
                Durchsuchen Sie alle {stats.total} Läden, planen Sie Ihre Routen und erreichen Sie Ihre Ziele schneller.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/shops"
                className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-xl font-bold text-lg transition-colors shadow-lg flex items-center gap-2"
              >
                <Bike className="w-5 h-5" />
                Alle Läden
              </Link>
              <Link
                href="/map"
                className="bg-blue-500 text-white hover:bg-blue-400 px-8 py-4 rounded-xl font-bold text-lg transition-colors border border-blue-400 flex items-center gap-2"
              >
                <MapPin className="w-5 h-5" />
                Zur Karte
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-900 text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Bike className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl text-white">DataBike</span>
              </div>
              <p className="text-slate-400">
                Das führende B2B Sales-Tool für den Kölner Fahrradmarkt.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="/shops" className="hover:text-white transition-colors">Alle Läden</Link></li>
                <li><Link href="/map" className="hover:text-white transition-colors">Kartenansicht</Link></li>
                <li><Link href="/shops?prioritaet=A" className="hover:text-white transition-colors">Priorität A</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Statistiken</h4>
              <ul className="space-y-2">
                <li>{stats.total} Läden indexiert</li>
                <li>{stats.mitEmail} mit E-Mail-Kontakt</li>
                <li>{stats.mitGF} mit Geschäftsführer</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center">
            <p className="text-sm">
              © 2025 DataBike. B2B Sales Tool für den Kölner Fahrradmarkt.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
