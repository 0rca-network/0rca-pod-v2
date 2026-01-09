import { Inter, Outfit } from 'next/font/google';
import '../styles/globals.css';
import clsx from 'clsx';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const metadata = {
  title: '0rca Pod - AI Agents',
  description: 'Discover and deploy autonomous AI agents on Cronos.',
};

import { Header } from '@/components/Header';
import { Providers } from '@/components/Providers';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={clsx(inter.variable, outfit.variable)} style={{ scrollBehavior: 'smooth' }}>
      <body className="bg-black text-white min-h-screen selection:bg-mint-glow selection:text-black antialiased overflow-x-hidden">
        <Providers>
          <Header />
          <div className="flex flex-col min-h-screen">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
