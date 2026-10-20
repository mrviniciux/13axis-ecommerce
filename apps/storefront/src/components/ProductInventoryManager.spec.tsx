import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ProductInventoryManager from './ProductInventoryManager';

const product = {
  id: 'product-1',
  name: 'Camiseta teste',
  description: 'Uma camiseta de teste para o componente',
  categoryId: 'category-1',
  brandId: 'brand-1',
  variationId: 'variation-1',
  category: { id: 'category-1', name: 'Camiseta' },
  brand: { id: 'brand-1', name: 'Nike' },
  variation: { id: 'variation-1', name: 'Verde' },
  status: 'ACTIVE' as const,
  image: null,
  variants: [
    {
      id: 'variant-1',
      sku: 'TEE-M',
      barcode: null,
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

const categories = [
  { id: 'category-1', name: 'Camiseta' },
  { id: 'category-2', name: 'Calça' },
];
const brands = [
  { id: 'brand-1', name: 'Nike' },
  { id: 'brand-2', name: 'Adidas' },
];
const variations = [
  { id: 'variation-1', name: 'Verde' },
  { id: 'variation-2', name: 'Preto' },
];

function renderManager(overrides?: { products?: (typeof product)[] }) {
  return render(
    <ProductInventoryManager
      initialProducts={overrides?.products ?? [product]}
      categories={categories}
      brands={brands}
      variations={variations}
    />
  );
}

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

    renderManager();

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

  it('edits product details and uploads an image', async () => {
    const updatedProduct = {
      ...product,
      name: 'Camiseta atualizada',
      image: '/api/products/product-1/image',
      variants: [
        {
          ...product.variants[0],
          sku: 'TEE-UPDATED',
          salePrice: '99.90',
        },
      ],
    };
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ product: updatedProduct }),
    } as Response);
    globalThis.fetch = fetchMock;

    renderManager();
    fireEvent.click(
      screen.getByRole('button', { name: 'Editar Camiseta teste' })
    );
    fireEvent.change(screen.getByLabelText('Nome do produto'), {
      target: { value: 'Camiseta atualizada' },
    });
    fireEvent.change(screen.getByLabelText('SKU'), {
      target: { value: 'TEE-UPDATED' },
    });
    fireEvent.focus(screen.getByLabelText('Categoria'));
    fireEvent.click(screen.getByRole('option', { name: 'Calça' }));
    fireEvent.focus(screen.getByLabelText('Marca'));
    fireEvent.click(screen.getByRole('option', { name: 'Adidas' }));
    fireEvent.focus(screen.getByLabelText('Variação (cor)'));
    fireEvent.click(screen.getByRole('option', { name: 'Preto' }));
    fireEvent.change(screen.getByLabelText('Preço de venda (R$)'), {
      target: { value: '99.90' },
    });
    fireEvent.change(screen.getByLabelText('Enviar imagem do produto'), {
      target: {
        files: [
          new File(['image-content'], 'product.png', { type: 'image/png' }),
        ],
      },
    });
    await screen.findByAltText('Pré-visualização da imagem do produto');
    fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));

    await waitFor(() =>
      expect(screen.getByText('Produto atualizado.')).toBeInTheDocument()
    );
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/admin/products/product-1',
      expect.objectContaining({
        method: 'PATCH',
        body: expect.stringContaining('"image":"data:image/png;base64,'),
      })
    );
    const [, request] = fetchMock.mock.calls[0];
    const body = JSON.parse(String(request?.body));
    expect(body).toMatchObject({
      categoryId: 'category-2',
      brandId: 'brand-2',
      variationId: 'variation-2',
    });
    expect(screen.getByText('Camiseta atualizada')).toBeInTheDocument();
  });

  it('inactivates a product without deleting its inventory history', async () => {
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'ARCHIVED' }),
    } as Response);
    globalThis.fetch = fetchMock;

    renderManager();
    fireEvent.click(
      screen.getByRole('button', { name: 'Inativar Camiseta teste' })
    );

    await waitFor(() =>
      expect(
        screen.getByText('Produto inativado; o histórico foi preservado.')
      ).toBeInTheDocument()
    );
    expect(fetchMock).toHaveBeenCalledWith('/api/admin/products/product-1', {
      method: 'DELETE',
    });
    expect(screen.getByText('Inativo')).toBeInTheDocument();
  });
});
