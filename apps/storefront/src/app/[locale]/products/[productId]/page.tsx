import { notFound } from 'next/navigation';
import ProductDetail from '@/components/ProductDetail';

type ProductPageProps = {
  params: Promise<{ productId: string }>;
};

interface ProductFromApi {
  id: string;
  name: string;
  image: string;
  price: number;
  color: string;
  sizes: string[];
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { productId } = await params;

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || ''}/api/products?id=${productId}`,
    { cache: 'no-store' }
  );

  if (!response.ok) {
    notFound();
  }

  const data = await response.json();
  const product: ProductFromApi | undefined = data.products?.[0];

  if (!product) {
    notFound();
  }

  return <ProductDetail product={product} />;
}
