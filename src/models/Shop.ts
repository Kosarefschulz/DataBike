import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IShop extends Document {
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
  isCustom: boolean; // true wenn vom User hinzugefügt
}

const ShopSchema = new Schema<IShop>(
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

// Generate slug before saving
ShopSchema.pre('save', function(next) {
  if (!this.slug || this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[äöüß]/g, (match) => {
        const map: Record<string, string> = { 'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'ß': 'ss' };
        return map[match] || match;
      })
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

// Prevent model recompilation in development
const Shop: Model<IShop> = mongoose.models.Shop || mongoose.model<IShop>('Shop', ShopSchema);

export default Shop;
