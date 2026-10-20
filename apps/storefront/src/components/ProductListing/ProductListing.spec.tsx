import { NextIntlClientProvider } from 'next-intl';
import { fireEvent, render, screen, within, act } from '@testing-library/react';
import ptBR from '@/i18n/messages/pt-BR.json';
import ProductListing from './ProductListing';

const mockProducts = {
  products: [
    {
      id: 'essential-cotton',
      name: 'Camiseta Essential de algodão',
      image:
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80',
      price: 79.9,
      color: 'white',
      sizes: ['P', 'M', 'G', 'GG'],
    },
    {
      id: 'classic-black',
      name: 'Camiseta clássica preta',
      image:
        'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=80',
      price: 89.9,
      color: 'black',
      sizes: ['P', 'M', 'G'],
    },
    {
      id: 'oversized-graphite',
      name: 'Camiseta oversized grafite',
      image:
        'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80',
      price: 119.9,
      color: 'gray',
      sizes: ['M', 'G', 'GG'],
    },
    {
      id: 'soft-pink',
      name: 'Camiseta básica rosa',
      image:
        'https://images.pexels.com/photos/6311392/pexels-photo-6311392.jpeg?auto=compress&cs=tinysrgb&w=800',
      price: 94.9,
      color: 'pink',
      sizes: ['P', 'M', 'G'],
    },
    {
      id: 'navy-basic',
      name: 'Camiseta básica azul-marinho',
      image:
        'https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=800&q=80',
      price: 84.9,
      color: 'blue',
      sizes: ['P', 'M', 'G', 'GG'],
    },
    {
      id: 'earthy-green',
      name: 'Camiseta casual verde',
      image:
        'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80',
      price: 99.9,
      color: 'green',
      sizes: ['M', 'G', 'GG'],
    },
    {
      id: 'everyday-white',
      name: 'Camiseta branca everyday',
      image:
        'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80',
      price: 69.9,
      color: 'white',
      sizes: ['P', 'M', 'G'],
    },
    {
      id: 'urban-black',
      name: 'Camiseta urbana preta',
      image:
        'https://images.unsplash.com/photo-1627225924765-552d49cf47ad?auto=format&fit=crop&w=800&q=80',
      price: 109.9,
      color: 'black',
      sizes: ['M', 'G', 'GG'],
    },
  ],
};

function renderProductListing() {
  return render(
    <NextIntlClientProvider locale="pt-BR" messages={ptBR}>
      <ProductListing />
    </NextIntlClientProvider>
  );
}

describe('ProductListing', () => {
  beforeEach(() => {
    (globalThis.fetch as jest.Mock) = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockProducts,
    } as Response);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('shows eight products and only the requested filters', async () => {
    await act(async () => {
      renderProductListing();
    });

    expect(screen.getByTestId('product-count')).toHaveTextContent('8 produtos');
    expect(screen.getAllByRole('article')).toHaveLength(8);
    expect(screen.getByRole('group', { name: 'Cor' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Tamanho' })).toBeInTheDocument();
    expect(
      screen.getByRole('group', { name: 'Preço (R$)' })
    ).toBeInTheDocument();
    expect(screen.queryByText('Marca')).not.toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Camiseta Essential de algodão/ })
    ).toHaveAttribute('href', '/br/produtos/essential-cotton');
  });

  it('filters by color, size, and price together', async () => {
    await act(async () => {
      renderProductListing();
    });

    fireEvent.click(screen.getByRole('checkbox', { name: 'Preto' }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'GG' }));
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Mínimo' }), {
      target: { value: '100' },
    });

    expect(screen.getByTestId('product-count')).toHaveTextContent('1 produto');
    expect(
      screen.getByRole('heading', { name: 'Camiseta urbana preta' })
    ).toBeInTheDocument();
  });

  it('shows an empty state and clears filters', async () => {
    await act(async () => {
      renderProductListing();
    });

    fireEvent.change(screen.getByRole('spinbutton', { name: 'Mínimo' }), {
      target: { value: '500' },
    });
    expect(
      screen.getByRole('heading', { name: 'Nenhum produto encontrado' })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Limpar' }));
    expect(screen.getAllByRole('article')).toHaveLength(8);
    expect(
      within(screen.getByRole('group', { name: 'Preço (R$)' })).getByRole(
        'spinbutton',
        { name: 'Mínimo' }
      )
    ).toHaveValue(null);
  });
});
