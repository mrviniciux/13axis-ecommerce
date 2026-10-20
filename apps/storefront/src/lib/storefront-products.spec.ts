import { drizzle } from 'drizzle-orm/pg-proxy';
import { getDb } from '../../db';
import { listProducts } from './storefront-products';

jest.mock('../../db', () => ({ getDb: jest.fn() }));

const execute = jest.fn(async (_query: string, _params: unknown[]) => ({
  rows: [],
}));

beforeEach(() => {
  jest.clearAllMocks();
  jest
    .mocked(getDb)
    .mockReturnValue(drizzle(execute) as unknown as ReturnType<typeof getDb>);
});

it('returns an empty catalog without sample products', async () => {
  await expect(listProducts(new URLSearchParams())).resolves.toEqual([]);
  expect(execute.mock.calls[0][1]).toContain('ACTIVE');
});

it('binds search and price filters as parameters, with correlated variant queries', async () => {
  const search = "camiseta' OR 1=1 --";
  await listProducts(
    new URLSearchParams({ search, minPrice: '10', maxPrice: '50' })
  );
  const [query, params] = execute.mock.calls[0];
  expect(query).not.toContain(search);
  expect(query).toContain('exists');
  expect(query).toContain('ilike');
  expect(params).toEqual(
    expect.arrayContaining(['ACTIVE', '10', '50', `%${search}%`])
  );
});

it.each(['NaN', '-1', 'Infinity'])(
  'rejects an invalid price (%s) before querying',
  async (minPrice) => {
    await expect(
      listProducts(new URLSearchParams({ minPrice }))
    ).rejects.toThrow(RangeError);
    expect(execute).not.toHaveBeenCalled();
  }
);
