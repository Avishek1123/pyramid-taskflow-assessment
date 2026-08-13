import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '../components/providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TaskFlow | Kanban Task Management',
  description:
    'Manage projects, columns, and tasks with smooth drag-and-drop mechanics and real-time preferences.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`h-full antialiased ${inter.variable}`} suppressHydrationWarning>
      <body className={`${inter.className} min-h-full flex flex-col bg-background text-foreground`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
