import HeroCarousel from '@/components/HeroCarousel';
import BenefitsBar from '@/components/BenefitsBar';
import ProductListing from '@/components/ProductListing';

export default function HomePage() {
  return (
    <main>
      <HeroCarousel />
      <BenefitsBar />
      <ProductListing />
    </main>
  );
}
