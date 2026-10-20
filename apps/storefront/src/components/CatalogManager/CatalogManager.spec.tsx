import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import CatalogManager from './CatalogManager';

const sections = [
  {
    resource: 'categories' as const,
    items: [
      { id: 'category-1', name: 'Camiseta', active: true, productsCount: 2 },
    ],
  },
  {
    resource: 'brands' as const,
    items: [{ id: 'brand-1', name: 'Nike', active: true, productsCount: 1 }],
  },
  {
    resource: 'variations' as const,
    items: [
      { id: 'variation-1', name: 'Preto', active: true, productsCount: 0 },
    ],
  },
];

const originalFetch = globalThis.fetch;

describe('CatalogManager', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    if (originalFetch) {
      globalThis.fetch = originalFetch;
    } else {
      Reflect.deleteProperty(globalThis, 'fetch');
    }
  });

  it('creates a category through the catalog API', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        item: {
          id: 'category-2',
          name: 'Calça',
          active: true,
          position: 0,
        },
      }),
    } as Response);
    globalThis.fetch = fetchMock;

    render(<CatalogManager sections={sections} />);

    fireEvent.click(screen.getByRole('button', { name: 'Nova categoria' }));
    fireEvent.change(screen.getByLabelText('Nome da categoria'), {
      target: { value: 'Calça' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() =>
      expect(screen.getByText('Registro criado.')).toBeInTheDocument()
    );
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/admin/catalog/categories',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: 'Calça' }),
      })
    );
    expect(screen.getByText('Calça')).toBeInTheDocument();
  });

  it('deactivates a variation and switches between tabs', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, active: false }),
    } as Response);
    globalThis.fetch = fetchMock;

    render(<CatalogManager sections={sections} />);

    fireEvent.click(screen.getByRole('tab', { name: /Variações/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Inativar Preto' }));

    await waitFor(() =>
      expect(screen.getByText('Registro inativado.')).toBeInTheDocument()
    );
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/admin/catalog/variations/variation-1',
      { method: 'DELETE' }
    );
    expect(screen.getByText('Inativo')).toBeInTheDocument();
  });
});
