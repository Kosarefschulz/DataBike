'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from './navbar';
import { Bike } from 'lucide-react';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center animate-pulse">
            <Bike className="w-8 h-8 text-white" />
          </div>
          <p className="text-slate-500">Laden...</p>
        </div>
      </div>
    );
  }

  // Don't show navbar on login page
  if (isLoginPage) {
    return <>{children}</>;
  }

  // If not authenticated and not on login page, the AuthContext will redirect
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center animate-pulse">
            <Bike className="w-8 h-8 text-white" />
          </div>
          <p className="text-slate-500">Weiterleitung...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="pt-16">
        {children}
      </main>
    </>
  );
}
