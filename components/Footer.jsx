'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, GraduationCap, Heart, Shield } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();

  // Hide footer inside admin dashboard
  if (pathname?.startsWith('/admin/dashboard')) {
    return null;
  }

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="font-bold text-gray-900 text-lg">
                Study Materials <span className="text-blue-600">Hub</span>
              </span>
            </div>
            <p className="text-gray-500 text-sm max-w-sm leading-relaxed">
              A centralized academic repository created for college students to effortlessly browse,
              search, and download subject notes, question papers, syllabus, and lab manuals.
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
              <GraduationCap className="w-3.5 h-3.5" />
              College Academic Mini-Project
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-xs font-semibold text-gray-900   tracking-wider mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-gray-500 hover:text-blue-600 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/#browse-materials" className="text-gray-500 hover:text-blue-600 transition-colors">
                  All Materials
                </Link>
              </li>
              <li>
                <Link href="/#browse-subjects" className="text-gray-500 hover:text-blue-600 transition-colors">
                  Subjects Directory
                </Link>
              </li>
              <li>
                <Link href="/#browse-semesters" className="text-gray-500 hover:text-blue-600 transition-colors">
                  Semester Finder
                </Link>
              </li>
            </ul>
          </div>

          {/* Administrative */}
          <div>
            <h4 className="text-xs font-semibold text-gray-900   tracking-wider mb-3">
              Faculty / Admin
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/admin/login"
                  className="inline-flex items-center gap-1.5 text-gray-500 hover:text-blue-600 transition-colors"
                >
                  <Shield className="w-3.5 h-3.5" />
                  Admin Sign In
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/dashboard"
                  className="text-gray-500 hover:text-blue-600 transition-colors"
                >
                  Admin Dashboard
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>
            &copy; {new Date().getFullYear()} Study Materials Hub. Built with Next.js, Tailwind CSS &amp; MongoDB.
          </p>
          <p className="flex items-center gap-1">
            Built for college academic excellence
          </p>
        </div>
      </div>
    </footer>
  );
}
