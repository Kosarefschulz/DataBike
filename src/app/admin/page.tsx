'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus,
  Bike,
  Users,
  Search,
  Edit,
  Trash2,
  X,
  Save,
  AlertCircle,
  CheckCircle,
  MapPin,
  Building2,
  Mail,
  Phone,
  Globe,
  Star,
  Tag,
  Route,
  FileText,
  Upload,
  Download
} from 'lucide-react';
import { cn, getPriorityColor } from '@/lib/utils';

interface ShopFormData {
  name: string;
  typ: 'Fahrrad' | 'Baby';
  prioritaet: 'A' | 'B' | 'C';
  adresse: string;
  stadtteil: string;
  plz: string;
  telefon: string;
  email: string;
  website: string;
  geschaeftsfuehrer: string;
  bewertung: number;
  anzahlBewertungen: number;
  schwerpunkte: string;
  marken: string;
  route: number;
  lat: number;
  lng: number;
  notizen: string;
  status: 'aktiv' | 'inaktiv' | 'kontaktiert' | 'kunde';
}

const defaultFormData: ShopFormData = {
  name: '',
  typ: 'Fahrrad',
  prioritaet: 'C',
  adresse: '',
  stadtteil: '',
  plz: '',
  telefon: '',
  email: '',
  website: '',
  geschaeftsfuehrer: '',
  bewertung: 0,
  anzahlBewertungen: 0,
  schwerpunkte: '',
  marken: '',
  route: 0,
  lat: 0,
  lng: 0,
  notizen: '',
  status: 'aktiv'
};

const stadtteile = [
  'Altstadt-Nord', 'Altstadt-Süd', 'Neustadt-Nord', 'Neustadt-Süd', 'Deutz',
  'Ehrenfeld', 'Nippes', 'Lindenthal', 'Sülz', 'Klettenberg', 'Rodenkirchen',
  'Porz', 'Kalk', 'Mülheim', 'Chorweiler', 'Longerich', 'Bilderstöckchen',
  'Ossendorf', 'Bocklemünd', 'Vogelsang', 'Bickendorf', 'Müngersdorf', 'Braunsfeld',
  'Junkersdorf', 'Lövenich', 'Weiden', 'Widdersdorf', 'Pulheim', 'Frechen',
  'Hürth', 'Brühl', 'Wesseling', 'Bonn', 'Bergisch Gladbach', 'Leverkusen'
];

export default function AdminPage() {
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingShop, setEditingShop] = useState<any | null>(null);
  const [formData, setFormData] = useState<ShopFormData>(defaultFormData);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCustom, setFilterCustom] = useState<'all' | 'custom' | 'system'>('all');

  // Fetch shops
  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/shops');
      const data = await res.json();
      if (data.success) {
        setShops(data.shops);
      }
    } catch (error) {
      console.error('Error fetching shops:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter shops
  const filteredShops = shops.filter(shop => {
    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !shop.name?.toLowerCase().includes(q) &&
        !shop.adresse?.toLowerCase().includes(q) &&
        !shop.stadtteil?.toLowerCase().includes(q)
      ) {
        return false;
      }
    }

    // Custom filter
    if (filterCustom === 'custom' && !shop.isCustom) return false;
    if (filterCustom === 'system' && shop.isCustom) return false;

    return true;
  });

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const payload = {
        ...formData,
        schwerpunkte: formData.schwerpunkte.split(',').map(s => s.trim()).filter(Boolean),
        marken: formData.marken.split(',').map(s => s.trim()).filter(Boolean),
      };

      const url = editingShop
        ? `/api/shops/${editingShop._id || editingShop.slug}`
        : '/api/shops';

      const res = await fetch(url, {
        method: editingShop ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        setMessage({
          type: 'success',
          text: editingShop ? 'Laden erfolgreich aktualisiert!' : 'Neuer Laden erfolgreich hinzugefügt!'
        });
        setShowForm(false);
        setEditingShop(null);
        setFormData(defaultFormData);
        fetchShops();
      } else {
        setMessage({ type: 'error', text: data.error || 'Fehler beim Speichern' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Netzwerkfehler beim Speichern' });
    } finally {
      setSaving(false);
    }
  };

  // Handle delete
  const handleDelete = async (shop: any) => {
    if (!confirm(`Möchten Sie "${shop.name}" wirklich löschen?`)) return;

    try {
      const res = await fetch(`/api/shops/${shop._id || shop.slug}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Laden erfolgreich gelöscht!' });
        fetchShops();
      } else {
        setMessage({ type: 'error', text: data.error || 'Fehler beim Löschen' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Netzwerkfehler beim Löschen' });
    }
  };

  // Handle edit
  const handleEdit = (shop: any) => {
    setEditingShop(shop);
    setFormData({
      name: shop.name || '',
      typ: shop.typ || 'Fahrrad',
      prioritaet: shop.prioritaet || 'C',
      adresse: shop.adresse || '',
      stadtteil: shop.stadtteil || '',
      plz: shop.plz || '',
      telefon: shop.telefon || '',
      email: shop.email || '',
      website: shop.website || '',
      geschaeftsfuehrer: shop.geschaeftsfuehrer || '',
      bewertung: shop.bewertung || 0,
      anzahlBewertungen: shop.anzahlBewertungen || 0,
      schwerpunkte: (shop.schwerpunkte || []).join(', '),
      marken: (shop.marken || []).join(', '),
      route: shop.route || 0,
      lat: shop.lat || 0,
      lng: shop.lng || 0,
      notizen: shop.notizen || '',
      status: shop.status || 'aktiv',
    });
    setShowForm(true);
  };

  // Geocode address
  const geocodeAddress = async () => {
    if (!formData.adresse) return;

    try {
      const query = encodeURIComponent(`${formData.adresse}, ${formData.stadtteil}, Köln, Germany`);
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`);
      const data = await res.json();

      if (data && data[0]) {
        setFormData(prev => ({
          ...prev,
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        }));
        setMessage({ type: 'success', text: 'Koordinaten gefunden!' });
      } else {
        setMessage({ type: 'error', text: 'Adresse nicht gefunden' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Fehler bei der Geocodierung' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Admin - Läden verwalten</h1>
              <p className="text-slate-500 mt-1">
                {shops.length} Läden gesamt • {shops.filter(s => s.isCustom).length} eigene Läden
              </p>
            </div>
            <button
              onClick={() => {
                setEditingShop(null);
                setFormData(defaultFormData);
                setShowForm(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors flex items-center gap-2 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Neuen Laden hinzufügen
            </button>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={cn(
          "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4",
        )}>
          <div className={cn(
            "p-4 rounded-xl flex items-center gap-3",
            message.type === 'success' ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
          )}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{message.text}</span>
            <button
              onClick={() => setMessage(null)}
              className="ml-auto p-1 hover:bg-black/5 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter */}
        <div className="bg-white rounded-2xl shadow-soft p-6 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[300px] relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Suche nach Name, Adresse, Stadtteil..."
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-2">
              {(['all', 'custom', 'system'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setFilterCustom(filter)}
                  className={cn(
                    "px-4 py-3 rounded-xl font-medium transition-colors",
                    filterCustom === filter
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
                >
                  {filter === 'all' ? 'Alle' : filter === 'custom' ? 'Eigene' : 'System'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Shop List */}
        <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left p-4 font-semibold text-slate-600">Name</th>
                  <th className="text-left p-4 font-semibold text-slate-600">Typ</th>
                  <th className="text-left p-4 font-semibold text-slate-600">Stadtteil</th>
                  <th className="text-left p-4 font-semibold text-slate-600">Priorität</th>
                  <th className="text-left p-4 font-semibold text-slate-600">Status</th>
                  <th className="text-left p-4 font-semibold text-slate-600">Quelle</th>
                  <th className="text-right p-4 font-semibold text-slate-600">Aktionen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">
                      Laden...
                    </td>
                  </tr>
                ) : filteredShops.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">
                      Keine Läden gefunden
                    </td>
                  </tr>
                ) : (
                  filteredShops.slice(0, 100).map((shop) => (
                    <tr key={shop._id || shop.id} className="hover:bg-slate-50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center",
                            shop.typ === 'Baby' ? "bg-pink-100" : "bg-blue-100"
                          )}>
                            {shop.typ === 'Baby' ? (
                              <Users className="w-5 h-5 text-pink-600" />
                            ) : (
                              <Bike className="w-5 h-5 text-blue-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{shop.name}</p>
                            <p className="text-sm text-slate-500">{shop.adresse}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-slate-600">{shop.typ}</td>
                      <td className="p-4 text-slate-600">{shop.stadtteil}</td>
                      <td className="p-4">
                        <span className={cn(
                          "px-2 py-1 rounded font-bold text-xs",
                          getPriorityColor(shop.prioritaet)
                        )}>
                          {shop.prioritaet}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={cn(
                          "px-2 py-1 rounded text-xs font-medium",
                          shop.status === 'kunde' ? "bg-emerald-100 text-emerald-700" :
                          shop.status === 'kontaktiert' ? "bg-blue-100 text-blue-700" :
                          shop.status === 'inaktiv' ? "bg-slate-100 text-slate-600" :
                          "bg-green-100 text-green-700"
                        )}>
                          {shop.status || 'aktiv'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={cn(
                          "px-2 py-1 rounded text-xs font-medium",
                          shop.isCustom ? "bg-violet-100 text-violet-700" : "bg-slate-100 text-slate-600"
                        )}>
                          {shop.isCustom ? 'Eigener' : 'System'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/shop/${shop.slug}`}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Globe className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleEdit(shop)}
                            className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {shop.isCustom && (
                            <button
                              onClick={() => handleDelete(shop)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {filteredShops.length > 100 && (
            <div className="p-4 text-center text-slate-500 border-t border-slate-100">
              Zeige 100 von {filteredShops.length} Läden
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">
                {editingShop ? 'Laden bearbeiten' : 'Neuen Laden hinzufügen'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingShop(null);
                }}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="z.B. Fahrrad Müller"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Typ
                    </label>
                    <select
                      value={formData.typ}
                      onChange={(e) => setFormData(prev => ({ ...prev, typ: e.target.value as any }))}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Fahrrad">Fahrrad</option>
                      <option value="Baby">Baby</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Priorität
                    </label>
                    <select
                      value={formData.prioritaet}
                      onChange={(e) => setFormData(prev => ({ ...prev, prioritaet: e.target.value as any }))}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="A">A (Hoch)</option>
                      <option value="B">B (Mittel)</option>
                      <option value="C">C (Niedrig)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Adresse *
                  </label>
                  <input
                    type="text"
                    value={formData.adresse}
                    onChange={(e) => setFormData(prev => ({ ...prev, adresse: e.target.value }))}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Straße und Hausnummer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    PLZ
                  </label>
                  <input
                    type="text"
                    value={formData.plz}
                    onChange={(e) => setFormData(prev => ({ ...prev, plz: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="50667"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Stadtteil *
                  </label>
                  <select
                    value={formData.stadtteil}
                    onChange={(e) => setFormData(prev => ({ ...prev, stadtteil: e.target.value }))}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Bitte wählen...</option>
                    {stadtteile.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Koordinaten
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="any"
                      value={formData.lat || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, lat: parseFloat(e.target.value) || 0 }))}
                      className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Lat"
                    />
                    <input
                      type="number"
                      step="any"
                      value={formData.lng || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, lng: parseFloat(e.target.value) || 0 }))}
                      className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Lng"
                    />
                    <button
                      type="button"
                      onClick={geocodeAddress}
                      className="px-4 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                      title="Adresse geocodieren"
                    >
                      <MapPin className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-1" /> Telefon
                  </label>
                  <input
                    type="text"
                    value={formData.telefon}
                    onChange={(e) => setFormData(prev => ({ ...prev, telefon: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0221 12345678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-1" /> E-Mail
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="info@example.de"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Globe className="w-4 h-4 inline mr-1" /> Website
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://www.example.de"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Building2 className="w-4 h-4 inline mr-1" /> Geschäftsführer
                  </label>
                  <input
                    type="text"
                    value={formData.geschaeftsfuehrer}
                    onChange={(e) => setFormData(prev => ({ ...prev, geschaeftsfuehrer: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Max Mustermann"
                  />
                </div>
              </div>

              {/* Rating & Route */}
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Star className="w-4 h-4 inline mr-1" /> Bewertung
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={formData.bewertung || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, bewertung: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="4.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Anzahl Bewertungen
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.anzahlBewertungen || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, anzahlBewertungen: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="123"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Route className="w-4 h-4 inline mr-1" /> Route
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.route || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, route: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="aktiv">Aktiv</option>
                    <option value="kontaktiert">Kontaktiert</option>
                    <option value="kunde">Kunde</option>
                    <option value="inaktiv">Inaktiv</option>
                  </select>
                </div>
              </div>

              {/* Tags */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Tag className="w-4 h-4 inline mr-1" /> Schwerpunkte (kommagetrennt)
                  </label>
                  <input
                    type="text"
                    value={formData.schwerpunkte}
                    onChange={(e) => setFormData(prev => ({ ...prev, schwerpunkte: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="E-Bike, Rennrad, Kinderanhänger"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Marken (kommagetrennt)
                  </label>
                  <input
                    type="text"
                    value={formData.marken}
                    onChange={(e) => setFormData(prev => ({ ...prev, marken: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Cube, Canyon, Giant"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <FileText className="w-4 h-4 inline mr-1" /> Notizen
                </label>
                <textarea
                  value={formData.notizen}
                  onChange={(e) => setFormData(prev => ({ ...prev, notizen: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Interne Notizen zum Laden..."
                />
              </div>

              {/* Submit */}
              <div className="flex justify-end gap-4 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingShop(null);
                  }}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {saving ? 'Speichern...' : (editingShop ? 'Aktualisieren' : 'Hinzufügen')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
