import { notFound } from 'next/navigation';
import ProductDetail from '@/components/ProductDetail';
import { products } from '@/lib/products';

type ProductPageProps = {
  params: Promise<{ productId: string }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { productId } = await params;
  const product = products.find((item) => item.id === productId);

  if (!product) {
    notFound();
  }

  return <ProductDetail product={product} />;
}
