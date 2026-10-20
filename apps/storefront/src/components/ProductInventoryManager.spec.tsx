import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ProductInventoryManager from './ProductInventoryManager';

const product = {
  id: 'product-1',
  name: 'Camiseta teste',
  category: 'Camisetas',
  status: 'ACTIVE' as const,
  image: null,
  variants: [
    {
      id: 'variant-1',
      sku: 'TEE-M',
      label: 'Verde / M',
      costPrice: '35.50',
      salePrice: '89.90',
      inventory: {
        id: 'inventory-1',
        onHand: 12,
        reserved: 2,
        reorderPoint: 3,
      },
    },
  ],
};

const originalFetch = globalThis.fetch;

describe('ProductInventoryManager', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    if (originalFetch) {
      globalThis.fetch = originalFetch;
    } else {
      Reflect.deleteProperty(globalThis, 'fetch');
    }
  });

  it('records a stock adjustment with quantity and reason', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        inventory: {
          id: 'inventory-1',
          onHand: 14,
          reserved: 2,
          reorderPoint: 3,
        },
      }),
    } as Response);
    globalThis.fetch = fetchMock;

    render(<ProductInventoryManager initialProducts={[product]} />);

    expect(screen.getByText('10 un.')).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Adicionar uma unidade de Camiseta teste',
      })
    );
    fireEvent.change(screen.getByLabelText('Quantidade'), {
      target: { value: '2' },
    });
    fireEvent.change(screen.getByLabelText('Motivo do ajuste'), {
      target: { value: 'Conferência de inventário' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar ajuste' }));

    await waitFor(() =>
      expect(
        screen.getByText('Estoque ajustado e movimentação registrada.')
      ).toBeInTheDocument()
    );
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/admin/stock',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          variantId: 'variant-1',
          quantity: 2,
          note: 'Conferência de inventário',
        }),
      })
    );
    expect(screen.getByText('12 un.')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
