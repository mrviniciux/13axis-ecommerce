import { prisma } from '@/lib/prisma';
import { listProducts } from './storefront-products';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    product: {
      findMany: jest.fn(),
    },
  },
  getDatabaseProvider: jest.fn(() => 'postgresql'),
}));

const findMany = prisma.product.findMany as unknown as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  findMany.mockResolvedValue([]);
});

it('returns an empty catalog without sample products', async () => {
  await expect(listProducts(new URLSearchParams())).resolves.toEqual([]);
  expect(findMany).toHaveBeenCalledWith(
    expect.objectContaining({ where: { status: 'ACTIVE' } })
  );
});

it('passes search and price filters as Prisma values', async () => {
  const search = "camiseta' OR 1=1 --";
  await listProducts(
    new URLSearchParams({ search, minPrice: '10', maxPrice: '50' })
  );

  const args = findMany.mock.calls[0][0];
  expect(args.where.status).toBe('ACTIVE');
  expect(args.where.variants).toEqual({
    some: { AND: [{ salePrice: { gte: 10 } }, { salePrice: { lte: 50 } }] },
  });
  expect(args.where.OR).toEqual(
    expect.arrayContaining([
      { name: { contains: search, mode: 'insensitive' } },
      {
        category: {
          is: { name: { contains: search, mode: 'insensitive' } },
        },
      },
      {
        brand: {
          is: { name: { contains: search, mode: 'insensitive' } },
        },
      },
      {
        variants: {
          some: { sku: { contains: search, mode: 'insensitive' } },
        },
      },
    ])
  );
});

it('passes color, size, and price filters as Prisma values', async () => {
  await listProducts(
    new URLSearchParams({
      colors: 'black,white',
      sizes: 'M,GG',
      minPrice: '100',
    })
  );

  const args = findMany.mock.calls[0][0];
  expect(args.where.variation).toEqual({
    is: { slug: { in: ['preto', 'branco'] } },
  });
  expect(args.where.variants).toEqual({
    some: {
      AND: [
        {
          OR: [
            { label: { endsWith: ' / M', mode: 'insensitive' } },
            { label: { endsWith: ' / GG', mode: 'insensitive' } },
          ],
        },
        { salePrice: { gte: 100 } },
      ],
    },
  });
});

it('does not match products for an unknown color', async () => {
  await listProducts(new URLSearchParams({ colors: 'pink' }));

  expect(findMany.mock.calls[0][0].where.variation).toEqual({
    is: { slug: { in: [] } },
  });
});

it.each(['NaN', '-1', 'Infinity'])(
  'rejects an invalid price (%s) before querying',
  async (minPrice) => {
    await expect(
      listProducts(new URLSearchParams({ minPrice }))
    ).rejects.toThrow(RangeError);
    expect(findMany).not.toHaveBeenCalled();
  }
);
