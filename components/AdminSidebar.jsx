'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  FilePlus2,
  GraduationCap,
  Home,
  BookOpen,
  X,
} from 'lucide-react';

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: 'All Materials',
    href: '/admin/dashboard/materials',
    icon: FileText,
    exact: true,
  },
  {
    label: 'Add Material',
    href: '/admin/dashboard/materials/add',
    icon: FilePlus2,
    exact: false,
  },
  {
    label: 'Manage Subjects',
    href: '/admin/dashboard/subjects',
    icon: GraduationCap,
    exact: false,
  },
];

export default function AdminSidebar({ mobileOpen = false, onCloseMobile }) {
  const pathname = usePathname();

  const isLinkActive = (item) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname?.startsWith(item.href);
  };

  const navContent = (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Brand logo & title */}
      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        <Link href="/admin/dashboard" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-gray-900 text-base leading-tight block">
              Study Hub
            </span>
            <span className="text-[11px] font-semibold text-blue-600 tracking-wider block">
              Admin Portal
            </span>
          </div>
        </Link>
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main navigation */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
          Management
        </div>
        {NAV_ITEMS.map((item) => {
          const active = isLinkActive(item);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => onCloseMobile && onCloseMobile()}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon className={`w-4 h-4 ${active ? 'text-blue-600' : 'text-gray-400'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}

        <div className="pt-6 px-3 pb-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
          External
        </div>
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
        >
          <Home className="w-4 h-4 text-gray-400" />
          <span>View Student Site</span>
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 h-screen sticky top-0 shrink-0 z-30">
        {navContent}
      </aside>

      {/* Mobile Sidebar Backdrop & Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="fixed inset-y-0 left-0 w-64 max-w-full bg-white shadow-xl z-50">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
}
