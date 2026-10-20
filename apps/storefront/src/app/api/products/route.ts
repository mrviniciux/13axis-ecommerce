import { NextResponse } from 'next/server';
import { listProducts } from '@/lib/storefront-products';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const products = await listProducts(new URL(request.url).searchParams);
    return NextResponse.json({ products });
  } catch (error) {
    if (error instanceof RangeError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Erro ao buscar produtos' },
      { status: 500 }
    );
  }
}
