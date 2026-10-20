import { prisma } from '@/lib/prisma';

type ProductImageRouteProps = {
  params: Promise<{ productId: string }>;
};

export async function GET(
  _request: Request,
  { params }: ProductImageRouteProps
) {
  const { productId } = await params;
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { image: true },
  });
  const match = product?.image?.match(
    /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]+=*)$/
  );

  if (!match) {
    return new Response('Imagem não encontrada.', { status: 404 });
  }

  return new Response(Buffer.from(match[2], 'base64'), {
    headers: {
      'Content-Type': match[1],
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
