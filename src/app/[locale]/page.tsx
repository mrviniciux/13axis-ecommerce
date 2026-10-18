import { useTranslations } from 'next-intl';
import HeroCarousel from '@/components/HeroCarousel';

export default function HomePage() {
  const t = useTranslations();
  return (
    <main>
      <HeroCarousel />
      <div className="px-4 py-8 text-center">
        <h1 className="text-2xl font-semibold">{t('welcome')}</h1>
      </div>
    </main>
  );
}
