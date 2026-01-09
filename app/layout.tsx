'use client';

import { Inter, Outfit } from 'next/font/google';
import '../styles/globals.css';
import clsx from 'clsx';
import { usePathname } from 'next/navigation';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

import { Header } from '@/components/Header';
import { Providers } from '@/components/Providers';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isEditPage = pathname?.startsWith('/edit');

  return (
    <html lang="en" className={clsx(inter.variable, outfit.variable)} style={{ scrollBehavior: 'smooth' }}>
      <head>
        <title>0rca Pod - AI Agents</title>
        <meta name="description" content="Discover and deploy autonomous AI agents on Cronos." />
      </head>
      <body className="bg-black text-white min-h-screen selection:bg-mint-glow selection:text-black antialiased overflow-x-hidden">
        <Providers>
          {!isEditPage && <Header />}
          <div className={clsx("flex flex-col", isEditPage ? "h-screen" : "min-h-screen")}>
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
