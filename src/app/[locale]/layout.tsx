import { ReactNode } from 'react';
import { getMessages } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { Montserrat } from 'next/font/google';

import '../../styles/globals.css';
import Navbar from '@/components/Navbar';

const montserrat = Montserrat({
  display: 'swap',
  subsets: ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext'],
  weight: '400',
  variable: '--font-montserrat',
});

type AppPageProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function RootLayout({ children, params }: AppPageProps) {
  const { locale } = await params;
  const messages = await getMessages({ locale });

  return (
    <html lang={locale} className={montserrat.variable}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Navbar />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
