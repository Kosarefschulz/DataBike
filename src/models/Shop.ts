import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IVertrieb {
  interesse: 'ja' | 'nein' | 'vielleicht' | null;
  terminDatum: Date | null;
  budgetVorhanden: 'ja' | 'nein' | 'unbekannt' | null;
  entscheiderGesprochen: boolean | null;
  naechsterSchritt: string;
  zuletztAktualisiert: Date | null;
}

export interface IShop {
  name: string;
  slug: string;
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
  schwerpunkte: string[];
  marken: string[];
  route: number;
  lat: number;
  lng: number;
  notizen: string;
  status: 'aktiv' | 'inaktiv' | 'kontaktiert' | 'kunde';
  letzterKontakt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  isCustom: boolean;
  vertrieb: IVertrieb;
}

export interface IShopDocument extends IShop, Document {}

const ShopSchema = new Schema(
  {
    name: { type: String, required: true, index: true },
    slug: { type: String, required: true, unique: true },
    typ: { type: String, enum: ['Fahrrad', 'Baby'], default: 'Fahrrad' },
    prioritaet: { type: String, enum: ['A', 'B', 'C'], default: 'C' },
    adresse: { type: String, required: true },
    stadtteil: { type: String, required: true, index: true },
    plz: { type: String, default: '' },
    telefon: { type: String, default: '-' },
    email: { type: String, default: '-' },
    website: { type: String, default: '-' },
    geschaeftsfuehrer: { type: String, default: '-' },
    bewertung: { type: Number, default: 0 },
    anzahlBewertungen: { type: Number, default: 0 },
    schwerpunkte: [{ type: String }],
    marken: [{ type: String }],
    route: { type: Number, default: 0 },
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 },
    notizen: { type: String, default: '' },
    status: {
      type: String,
      enum: ['aktiv', 'inaktiv', 'kontaktiert', 'kunde'],
      default: 'aktiv'
    },
    letzterKontakt: { type: Date, default: null },
    createdBy: { type: String, default: 'system' },
    isCustom: { type: Boolean, default: false },
    vertrieb: {
      interesse: {
        type: String,
        enum: ['ja', 'nein', 'vielleicht', null],
        default: null
      },
      terminDatum: { type: Date, default: null },
      budgetVorhanden: {
        type: String,
        enum: ['ja', 'nein', 'unbekannt', null],
        default: null
      },
      entscheiderGesprochen: { type: Boolean, default: null },
      naechsterSchritt: { type: String, default: '' },
      zuletztAktualisiert: { type: Date, default: null }
    },
  },
  {
    timestamps: true,
  }
);

// Text search index
ShopSchema.index({
  name: 'text',
  adresse: 'text',
  geschaeftsfuehrer: 'text',
  stadtteil: 'text'
});

// Compound indexes for common queries
ShopSchema.index({ typ: 1, prioritaet: 1 });
ShopSchema.index({ stadtteil: 1, prioritaet: 1 });
ShopSchema.index({ route: 1 });

// Helper function to generate slug
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[äöüß]/g, (match: string) => {
      const map: Record<string, string> = { 'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'ß': 'ss' };
      return map[match] || match;
    })
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Prevent model recompilation in development
const Shop: Model<IShopDocument> = mongoose.models.Shop || mongoose.model<IShopDocument>('Shop', ShopSchema);

export default Shop;
