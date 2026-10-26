import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ATAR SPARK — Find the Right Exam Question with AI',
  description:
    'Search a curated, well-indexed archive of examination questions across Mathematics, Physics and Chemistry, by topic, year, difficulty or pattern of repetition.',
  icons: {
    icon: '/favicon.svg',
  },
};

import { AppQueryProvider } from '../components/providers/query-provider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400..700;1,400..700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-white text-slate-900 antialiased selection:bg-blue-600/20 selection:text-blue-900">
        <AppQueryProvider>{children}</AppQueryProvider>
      </body>
    </html>
  );
}
