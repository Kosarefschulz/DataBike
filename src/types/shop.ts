export interface Vertrieb {
  interesse: 'ja' | 'nein' | 'vielleicht' | null;
  terminDatum: string | null;
  budgetVorhanden: 'ja' | 'nein' | 'unbekannt' | null;
  entscheiderGesprochen: boolean | null;
  naechsterSchritt: string;
  zuletztAktualisiert: string | null;
}

export interface Shop {
  id: number;
  _id?: string;
  slug: string;
  name: string;
  typ: 'Fahrrad' | 'Baby';
  adresse: string;
  stadtteil: string;
  plz: string;
  telefon: string;
  email: string;
  website: string;
  bewertung: number;
  anzahlBewertungen: number;
  lat: number;
  lng: number;
  route: number;
  prioritaet: 'A' | 'B' | 'C';
  firma: string;
  geschaeftsfuehrer: string;
  marken: string[];
  schwerpunkte: string[];
  vertrieb?: Vertrieb;
}

export interface FilterState {
  search: string;
  typ: string;
  prioritaet: string;
  stadtteil: string;
  schwerpunkt: string;
}
