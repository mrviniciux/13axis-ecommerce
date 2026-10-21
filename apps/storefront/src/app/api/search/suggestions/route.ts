import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function textFilter(value: string) {
  return {
    contains: value,
    mode: 'insensitive' as const,
  };
}

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q || q.trim().length < 2) {
    return NextResponse.json({ words: [], products: [] });
  }

  const query = q.trim();

  // Sugestões de palavras a partir dos nomes de produtos que contêm o termo.
  const productsByName = await prisma.product.findMany({
    where: {
      status: 'ACTIVE',
      name: textFilter(query),
    },
    select: { name: true },
    take: 20,
  });

  const wordSet = new Set<string>();
  wordSet.add(query);

  for (const product of productsByName) {
    const words = product.name.split(/\s+/);
    for (let i = 0; i < words.length; i++) {
      const phrase = words.slice(0, i + 1).join(' ');
      if (phrase.toLowerCase().includes(query.toLowerCase())) {
        wordSet.add(phrase);
      }
    }
  }

  const words = Array.from(wordSet).slice(0, 8);

  // Sugestões de produtos com imagem.
  const suggestedProducts = await prisma.product.findMany({
    where: {
      status: 'ACTIVE',
      name: textFilter(query),
    },
    include: {
      variants: {
        include: {
          inventory: true,
        },
        orderBy: {
          salePrice: 'asc',
        },
        take: 1,
      },
    },
    take: 6,
    orderBy: {
      updatedAt: 'desc',
    },
  });

  const products = suggestedProducts.map((product) => ({
    id: product.id,
    name: product.name,
    image: product.image || null,
  }));

  return NextResponse.json({ words, products });
}
