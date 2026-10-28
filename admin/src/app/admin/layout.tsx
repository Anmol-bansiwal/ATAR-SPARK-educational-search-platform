'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ExternalLink } from 'lucide-react';
import { cn } from '../../lib/utils';

const NAV = [
  { href: '/admin', label: 'Upload paper', exact: true },
  { href: '/admin/review', label: 'Review', exact: false },
  { href: '/admin/questions', label: 'Question bank', exact: false },
  { href: '/admin/taxonomy', label: 'Taxonomy', exact: false },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const mainSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-slate-50 to-sky-100 font-[family-name:Instrument_Sans,sans-serif]">
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-6xl px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="text-sm font-bold tracking-tight text-slate-900">
              EduSearch Admin
            </Link>
            <nav className="flex items-center gap-1">
              {NAV.map((item) => {
                const active = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
                      active
                        ? 'bg-blue-600/10 text-blue-700 font-bold'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <a
            href={mainSiteUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors rounded-lg px-2.5 py-1.5 hover:bg-slate-100"
            title="Open student search portal in a new tab"
          >
            <span>Student Portal</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
