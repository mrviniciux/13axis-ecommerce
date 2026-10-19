import { ReactNode } from 'react';
import { getMessages } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { Montserrat } from 'next/font/google';

import '../../styles/globals.css';
import Navbar from '@/components/Navbar';
import { ThemeProvider } from '@/components/ThemeProvider';

const montserrat = Montserrat({
  display: 'swap',
  subsets: ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext'],
  weight: '400',
  variable: '--font-montserrat',
});

/**
 * Inline script that runs before React hydration to apply the stored theme
 * class on <html>. This eliminates the flash of unstyled (light) content
 * when the user prefers dark mode.
 *
 * The script is intentionally kept tiny and inline — no module boundary,
 * no async, executes synchronously during HTML parse.
 */
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

type AppPageProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function RootLayout({ children, params }: AppPageProps) {
  const { locale } = await params;
  const messages = await getMessages({ locale });

  return (
    // suppressHydrationWarning: the .dark class is mutated by the inline script
    // before React takes over; without this, React warns about the className
    // mismatch between server-render and client hydration.
    <html
      lang={locale}
      className={montserrat.variable}
      suppressHydrationWarning
    >
      <head>
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider>
            <Navbar />
            {children}
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
