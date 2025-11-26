import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPhoneNumber(phone: string): string {
  return phone.replace(/\s+/g, '').replace(/^\+49/, '0');
}

export function getWebsiteUrl(website: string): string {
  if (!website || website === '-') return '';
  if (website.startsWith('http')) return website;
  return `https://${website}`;
}

export function getPriorityColor(prio: string): string {
  switch (prio) {
    case 'A': return 'bg-red-100 text-red-700 border-red-200';
    case 'B': return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'C': return 'bg-slate-100 text-slate-600 border-slate-200';
    default: return 'bg-slate-100 text-slate-600 border-slate-200';
  }
}

export function getTypColor(typ: string): string {
  switch (typ) {
    case 'Fahrrad': return 'bg-blue-100 text-blue-700';
    case 'Baby': return 'bg-pink-100 text-pink-700';
    default: return 'bg-slate-100 text-slate-600';
  }
}
