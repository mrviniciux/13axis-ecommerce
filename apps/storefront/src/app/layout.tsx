import type { ReactNode } from 'react';
import { Montserrat } from 'next/font/google';

import '../styles/globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';

const montserrat = Montserrat({
  display: 'swap',
  subsets: ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext'],
  weight: '400',
  variable: '--font-montserrat',
});

const themeScript = `
(function(){
  try {
    var stored = localStorage.getItem('theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var isDark = stored === 'dark' || (stored !== 'light' && prefersDark);
    if (isDark) document.documentElement.classList.add('dark');
  } catch(e) {}
})();
`;

export default async function RootLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale?: string }>;
}) {
  const { locale } = await params;

  return (
    <html
      lang={locale ?? 'pt-BR'}
      className={montserrat.variable}
      suppressHydrationWarning
    >
      <head>
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
