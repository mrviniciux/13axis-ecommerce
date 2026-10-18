import { fireEvent, render, screen, within } from '@testing-library/react';
import Navbar from './Navbar';

describe('Navbar', () => {
  test('renders the logo linked to the home page', () => {
    render(<Navbar />);

    const homeLinks = screen.getAllByRole('link', { name: 'Página inicial' });

    expect(homeLinks).toHaveLength(2);
    homeLinks.forEach((link) => {
      expect(link).toHaveAttribute('href', '/');
      expect(
        within(link).getByRole('img', { name: 'Logo da empresa' })
      ).toBeInTheDocument();
    });
  });

  test('shows customer service contact information', () => {
    render(<Navbar />);

    fireEvent.click(screen.getByRole('button', { name: /Atendimento/ }));

    expect(screen.getByText('Whatsapp: 48 9 9999-9999')).toBeInTheDocument();
  });

  test('increments and displays the cart item count when clicked', () => {
    render(<Navbar />);

    const cartButtons = screen.getAllByRole('button', {
      name: 'Carrinho, 0 itens',
    });

    expect(cartButtons).toHaveLength(2);
    cartButtons.forEach((button) => {
      expect(within(button).getByText('0')).toBeInTheDocument();
    });

    fireEvent.click(cartButtons[0]);

    const updatedCartButtons = screen.getAllByRole('button', {
      name: 'Carrinho, 1 itens',
    });

    expect(updatedCartButtons).toHaveLength(2);
    updatedCartButtons.forEach((button) => {
      expect(within(button).getByText('1')).toBeInTheDocument();
    });
  });
});
