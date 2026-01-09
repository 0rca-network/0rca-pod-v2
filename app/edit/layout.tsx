import { Inter, Outfit } from 'next/font/google';
import '../../styles/globals.css';
import clsx from 'clsx';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export default function EditLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen bg-black text-white overflow-hidden">
      {children}
    </div>
  );
}