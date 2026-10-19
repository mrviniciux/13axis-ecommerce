import { NextIntlClientProvider } from 'next-intl';
import { fireEvent, render, screen } from '@testing-library/react';
import ptBR from '@/i18n/messages/pt-BR.json';
import { useCartStore } from '@/lib/cart-store';
import { products } from '@/lib/products';
import ProductDetail from './ProductDetail';

describe('ProductDetail', () => {
  beforeEach(() => {
    useCartStore.setState({ quantity: 0 });
  });

  afterEach(() => {
    useCartStore.setState({ quantity: 0 });
  });

  function renderProductDetail() {
    return render(
      <NextIntlClientProvider locale="pt-BR" messages={ptBR}>
        <ProductDetail product={products[7]} />
      </NextIntlClientProvider>
    );
  }

  it('shows product information and available sizes', () => {
    renderProductDetail();

    expect(
      screen.getByRole('heading', { name: 'Camiseta urbana preta' })
    ).toBeInTheDocument();
    expect(screen.getByText(/109,90/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'M' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Descrição' })
    ).toBeInTheDocument();
  });

  it('requires a size and updates the shared cart when adding the product', () => {
    renderProductDetail();

    fireEvent.click(
      screen.getByRole('button', { name: 'Adicionar ao carrinho' })
    );
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Selecione um tamanho para continuar.'
    );
    expect(useCartStore.getState().quantity).toBe(0);

    fireEvent.click(screen.getByRole('button', { name: 'M' }));
    fireEvent.click(
      screen.getByRole('button', { name: 'Adicionar ao carrinho' })
    );

    expect(useCartStore.getState().quantity).toBe(1);
    expect(
      screen.getByText('Produto adicionado ao carrinho.')
    ).toBeInTheDocument();
  });
});
