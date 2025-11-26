import { Shop } from '@/types/shop';
import shopsData from '@/data/shops.json';

export const shops: Shop[] = shopsData as Shop[];

export function getShopBySlug(slug: string): Shop | undefined {
  return shops.find(shop => shop.slug === slug);
}

export function getShopById(id: number): Shop | undefined {
  return shops.find(shop => shop.id === id);
}

export function searchShops(query: string): Shop[] {
  const q = query.toLowerCase();
  return shops.filter(shop =>
    shop.name.toLowerCase().includes(q) ||
    shop.adresse.toLowerCase().includes(q) ||
    shop.geschaeftsfuehrer.toLowerCase().includes(q) ||
    shop.marken.some(m => m.toLowerCase().includes(q)) ||
    shop.schwerpunkte.some(s => s.toLowerCase().includes(q))
  );
}

export function filterShops(filters: {
  typ?: string;
  prioritaet?: string;
  stadtteil?: string;
  schwerpunkt?: string;
  search?: string;
}): Shop[] {
  return shops.filter(shop => {
    if (filters.typ && shop.typ !== filters.typ) return false;
    if (filters.prioritaet && shop.prioritaet !== filters.prioritaet) return false;
    if (filters.stadtteil && !shop.adresse.includes(filters.stadtteil)) return false;
    if (filters.schwerpunkt && !shop.schwerpunkte.some(s => s.toLowerCase().includes(filters.schwerpunkt!.toLowerCase()))) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const matchesSearch =
        shop.name.toLowerCase().includes(q) ||
        shop.adresse.toLowerCase().includes(q) ||
        shop.geschaeftsfuehrer.toLowerCase().includes(q) ||
        shop.marken.some(m => m.toLowerCase().includes(q)) ||
        shop.schwerpunkte.some(s => s.toLowerCase().includes(q));
      if (!matchesSearch) return false;
    }
    return true;
  });
}

export function getUniqueValues(key: keyof Shop): string[] {
  const values = new Set<string>();
  shops.forEach(shop => {
    const value = shop[key];
    if (Array.isArray(value)) {
      value.forEach(v => values.add(v));
    } else if (typeof value === 'string' && value) {
      values.add(value);
    }
  });
  return Array.from(values).sort();
}

export function getStats() {
  const total = shops.length;
  const fahrrad = shops.filter(s => s.typ === 'Fahrrad').length;
  const baby = shops.filter(s => s.typ === 'Baby').length;
  const mitEmail = shops.filter(s => s.email && s.email !== '-').length;
  const mitGF = shops.filter(s => s.geschaeftsfuehrer && s.geschaeftsfuehrer !== '-').length;
  const prioA = shops.filter(s => s.prioritaet === 'A').length;
  const prioB = shops.filter(s => s.prioritaet === 'B').length;

  return { total, fahrrad, baby, mitEmail, mitGF, prioA, prioB };
}
