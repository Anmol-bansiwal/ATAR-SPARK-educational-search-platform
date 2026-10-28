import type { Metadata } from 'next';
import './globals.css';
import { AppQueryProvider } from '../components/providers/query-provider';

export const metadata: Metadata = {
  title: 'EduSearch Admin — Question Bank & Paper Extraction',
  description:
    'Upload, review, and curate examination questions and diagrams for ATAR SPARK.',
  icons: {
    icon: '/favicon.svg',
  },
};

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
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-blue-600/20 selection:text-blue-900">
        <AppQueryProvider>{children}</AppQueryProvider>
      </body>
    </html>
  );
}

