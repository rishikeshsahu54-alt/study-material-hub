'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith('/admin/dashboard')) {
    return null;
  }

  return (
    <footer className="bg-white border-t border-gray-100 mt-auto py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <Link href="/" className="flex items-center gap-2.5">
    
          <span className="font-bold text-gray-900 text-base">
            Study Materials <span className="text-blue-600">Hub</span>
          </span>
        </Link>
      </div>
    </footer>
  );
}
