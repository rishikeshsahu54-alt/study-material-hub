'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Shield } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  if (pathname?.startsWith('/admin/dashboard')) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm group-hover:bg-blue-700 transition-colors">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-gray-900 text-lg tracking-tight block leading-tight">
                Study Materials <span className="text-blue-600">Hub</span>
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 hover:text-blue-600 hover:bg-blue-50/50 border border-gray-200 transition-colors shadow-2xs"
            >
              <Shield className="w-4 h-4 text-blue-600" />
              <span>Admin Portal</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
