import type { ChangeEvent, ReactElement, ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { usePathname, useRouter } from '@/i18n/routing';
import enUS from '@/i18n/messages/en-US.json';
import ptBR from '@/i18n/messages/pt-BR.json';
import { useCartStore } from '@/lib/cart-store';
import Navbar from './Navbar';

jest.mock('@/i18n/routing', () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock('@/components/ui/select', () => {
  const ReactModule = jest.requireActual('react');
  const SelectContext = ReactModule.createContext('');

  return {
    Select: ({
      value,
      onValueChange,
      children,
    }: {
      value: string;
      onValueChange: (value: string) => void;
      children: ReactNode;
    }) => {
      const [trigger, content] = ReactModule.Children.toArray(children);

      return ReactModule.createElement(
        SelectContext.Provider,
        { value },
        ReactModule.createElement(
          ReactModule.Fragment,
          null,
          ReactModule.createElement(
            'select',
            {
              'aria-label': 'Idioma',
              value,
              onChange: (event: ChangeEvent<HTMLSelectElement>) =>
                onValueChange(event.target.value),
            },
            (content as ReactElement<{ children: ReactNode }>).props.children
          ),
          trigger
        )
      );
    },
    SelectContent: ({ children }: { children: ReactNode }) => children,
    SelectItem: ({
      value,
      children,
      ...props
    }: {
      value: string;
      children: ReactNode;
      'aria-label'?: string;
      title?: string;
    }) => {
      const text = ReactModule.Children.toArray(children)
        .map((child: ReactNode) =>
          typeof child === 'object' && child !== null && 'props' in child
            ? String(child.props.children)
            : String(child)
        )
        .join('');

      return ReactModule.createElement('option', { value, ...props }, text);
    },
    SelectTrigger: ({ children }: { children: ReactNode }) =>
      ReactModule.createElement(
        'div',
        { 'data-testid': 'language-trigger' },
        children
      ),
    SelectValue: ({
      children,
    }: {
      children: ReactNode | ((value: string) => ReactNode);
    }) => {
      const value = ReactModule.useContext(SelectContext);
      const content =
        typeof children === 'function' ? children(value) : children;

      return ReactModule.createElement(
        'span',
        { 'data-testid': 'selected-language' },
        content
      );
    },
  };
});

const replace = jest.fn();

function renderNavbar(locale: 'pt-BR' | 'en-US' = 'pt-BR') {
  return render(
    <NextIntlClientProvider
      locale={locale}
      messages={locale === 'pt-BR' ? ptBR : enUS}
    >
      <Navbar />
    </NextIntlClientProvider>
  );
}

describe('Navbar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useCartStore.setState({ quantity: 0 });
    (usePathname as jest.Mock).mockReturnValue('/shop');
    (useRouter as jest.Mock).mockReturnValue({ replace });
  });

  test('renders the logo linked to the home page', () => {
    renderNavbar();

    // 3 breakpoints render in jsdom: desktop, tablet, mobile
    const homeLinks = screen.getAllByRole('link', { name: 'Página inicial' });
    expect(homeLinks.length).toBeGreaterThanOrEqual(2);
    homeLinks.forEach((link) => {
      expect(link).toHaveAttribute('href', '/');
      expect(
        within(link).getByRole('img', { name: 'Logo da empresa' })
      ).toBeInTheDocument();
    });
  });

  test('shows translated navbar text for the selected locale', () => {
    renderNavbar('en-US');

    const homeLinks = screen.getAllByRole('link', { name: 'Home' });
    expect(homeLinks.length).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByRole('searchbox', { name: 'What are you looking for?' })
        .length
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByRole('button', { name: 'Cart, 0 items' }).length
    ).toBeGreaterThanOrEqual(1);
  });

  test('changes locale while keeping the current page', async () => {
    const user = userEvent.setup();
    renderNavbar();

    // Select from the first combobox available
    const combos = screen.getAllByRole('combobox', { name: 'Idioma' });
    await user.selectOptions(combos[0], 'en-US');

    expect(replace).toHaveBeenCalledWith('/shop', { locale: 'en-US' });
  });
});
