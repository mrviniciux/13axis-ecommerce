import { NextIntlClientProvider } from 'next-intl';
import { fireEvent, render, screen, within } from '@testing-library/react';
import ptBR from '@/i18n/messages/pt-BR.json';
import ProductListing from './ProductListing';

function renderProductListing() {
  return render(
    <NextIntlClientProvider locale="pt-BR" messages={ptBR}>
      <ProductListing />
    </NextIntlClientProvider>
  );
}

describe('ProductListing', () => {
  it('shows eight products and only the requested filters', () => {
    renderProductListing();

    expect(screen.getByTestId('product-count')).toHaveTextContent('8 produtos');
    expect(screen.getAllByRole('article')).toHaveLength(8);
    expect(screen.getByRole('group', { name: 'Cor' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Tamanho' })).toBeInTheDocument();
    expect(
      screen.getByRole('group', { name: 'Preço (R$)' })
    ).toBeInTheDocument();
    expect(screen.queryByText('Marca')).not.toBeInTheDocument();
  });

  it('filters by color, size, and price together', () => {
    renderProductListing();

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

  it('shows an empty state and clears filters', () => {
    renderProductListing();

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
