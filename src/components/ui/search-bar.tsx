'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { shops } from '@/lib/shops';
import { Shop } from '@/types/shop';
import { cn } from '@/lib/utils';

export function SearchBar({ large = false }: { large?: boolean }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Shop[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (query.length >= 2) {
      const q = query.toLowerCase();
      const filtered = shops.filter(shop =>
        shop.name.toLowerCase().includes(q) ||
        shop.adresse.toLowerCase().includes(q) ||
        shop.geschaeftsfuehrer.toLowerCase().includes(q) ||
        shop.marken.some(m => m.toLowerCase().includes(q)) ||
        shop.schwerpunkte.some(s => s.toLowerCase().includes(q))
      ).slice(0, 8);
      setResults(filtered);
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && results[selectedIndex]) {
        router.push(`/shop/${results[selectedIndex].slug}`);
      } else if (query) {
        router.push(`/shops?search=${encodeURIComponent(query)}`);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className="relative w-full">
      <div className={cn(
        "relative flex items-center bg-white border border-slate-200 rounded-xl transition-all duration-200",
        large ? "shadow-lg hover:shadow-xl" : "shadow-soft",
        isOpen && results.length > 0 && "rounded-b-none border-b-transparent"
      )}>
        <Search className={cn(
          "text-slate-400 ml-4",
          large ? "w-6 h-6" : "w-5 h-5"
        )} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          placeholder='Suche nach "Rennrad in Nippes" oder "Geschäftsführer Müller"...'
          className={cn(
            "flex-1 bg-transparent outline-none placeholder:text-slate-400",
            large ? "py-5 px-4 text-lg" : "py-3 px-3 text-base"
          )}
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="p-2 mr-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        )}
        <button
          onClick={() => query && router.push(`/shops?search=${encodeURIComponent(query)}`)}
          className={cn(
            "bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors mr-2",
            large ? "px-6 py-3" : "px-4 py-2"
          )}
        >
          <Search className={large ? "w-5 h-5" : "w-4 h-4"} />
        </button>
      </div>

      {/* Instant Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-white border border-slate-200 border-t-0 rounded-b-xl shadow-xl z-50 overflow-hidden">
          {results.map((shop, index) => (
            <button
              key={shop.id}
              onClick={() => router.push(`/shop/${shop.slug}`)}
              className={cn(
                "w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-slate-50 transition-colors",
                selectedIndex === index && "bg-blue-50"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center text-lg",
                shop.typ === 'Baby' ? "bg-pink-100" : "bg-blue-100"
              )}>
                {shop.typ === 'Baby' ? '👶' : '🚲'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-slate-900 truncate">{shop.name}</div>
                <div className="text-sm text-slate-500 truncate">
                  {shop.geschaeftsfuehrer && shop.geschaeftsfuehrer !== '-'
                    ? `${shop.geschaeftsfuehrer} • ${shop.adresse}`
                    : shop.adresse
                  }
                </div>
              </div>
              <span className={cn(
                "text-xs font-semibold px-2 py-1 rounded",
                shop.prioritaet === 'A' ? "bg-red-100 text-red-700" :
                shop.prioritaet === 'B' ? "bg-amber-100 text-amber-700" :
                "bg-slate-100 text-slate-600"
              )}>
                {shop.prioritaet}
              </span>
            </button>
          ))}
          <button
            onClick={() => router.push(`/shops?search=${encodeURIComponent(query)}`)}
            className="w-full px-4 py-3 text-blue-600 font-medium hover:bg-blue-50 transition-colors border-t border-slate-100"
          >
            Alle Ergebnisse anzeigen →
          </button>
        </div>
      )}
    </div>
  );
}
