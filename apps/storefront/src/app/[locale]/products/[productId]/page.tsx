import { notFound } from 'next/navigation';
import ProductDetail from '@/components/ProductDetail';
import { listProducts } from '@/lib/storefront-products';

export const dynamic = 'force-dynamic';

type ProductPageProps = {
  params: Promise<{ productId: string }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { productId } = await params;

  const [product] = await listProducts(new URLSearchParams({ id: productId }));

  if (!product) {
    notFound();
  }

  return <ProductDetail product={product} />;
}
