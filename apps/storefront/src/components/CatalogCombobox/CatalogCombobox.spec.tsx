import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ComponentProps } from 'react';
import CatalogCombobox from './CatalogCombobox';

const options = [
  { id: 'variation-1', name: 'Branco' },
  { id: 'variation-2', name: 'Preto' },
];

const originalFetch = globalThis.fetch;

describe('CatalogCombobox', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    if (originalFetch) {
      globalThis.fetch = originalFetch;
    } else {
      Reflect.deleteProperty(globalThis, 'fetch');
    }
  });

  function renderCombobox(
    overrides: Partial<ComponentProps<typeof CatalogCombobox>> = {}
  ) {
    return render(
      <CatalogCombobox
        label="Variação"
        name="variationId"
        resource="variations"
        options={options}
        placeholder="Busque ou cadastre uma variação"
        {...overrides}
      />
    );
  }

  it('filters without distinguishing case and does not offer duplicates', () => {
    renderCombobox();
    const input = screen.getByLabelText('Variação');

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'BRanco' } });

    expect(screen.getByRole('option', { name: 'Branco' })).toBeInTheDocument();
    expect(screen.queryByText(/Cadastrar/)).not.toBeInTheDocument();
  });

  it('ignores accents when matching an existing name', () => {
    renderCombobox({
      label: 'Categoria',
      name: 'categoryId',
      resource: 'categories',
      options: [{ id: 'category-1', name: 'Calça' }],
    });
    const input = screen.getByLabelText('Categoria');

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'calca' } });

    expect(screen.getByRole('option', { name: 'Calça' })).toBeInTheDocument();
    expect(screen.queryByText(/Cadastrar/)).not.toBeInTheDocument();
  });

  it('offers to create a new record when no option matches', async () => {
    const onCreated = jest.fn();
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        item: {
          id: 'variation-3',
          name: 'Branco Off-White',
          active: true,
        },
      }),
    } as Response);
    globalThis.fetch = fetchMock;

    renderCombobox({ onCreated });
    const input = screen.getByLabelText('Variação');

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'Branco Off-White' } });

    expect(
      screen.getByRole('option', { name: /Cadastrar "Branco Off-White"/ })
    ).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Branco' })).toBeNull();

    fireEvent.click(
      screen.getByRole('option', { name: /Cadastrar "Branco Off-White"/ })
    );

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/admin/catalog/variations',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'Branco Off-White' }),
        })
      )
    );
    await waitFor(() =>
      expect(onCreated).toHaveBeenCalledWith({
        id: 'variation-3',
        name: 'Branco Off-White',
      })
    );
    expect(document.querySelector('input[type="hidden"]')).toHaveValue(
      'variation-3'
    );
    expect(input).toHaveValue('Branco Off-White');
  });

  it('does not offer creation for a single character', () => {
    renderCombobox();
    const input = screen.getByLabelText('Variação');

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'Z' } });

    expect(screen.queryByText(/Cadastrar/)).not.toBeInTheDocument();
    expect(screen.getByText('Nenhum resultado.')).toBeInTheDocument();
  });

  it('selects an existing option and submits its id', () => {
    renderCombobox();
    const input = screen.getByLabelText('Variação');

    fireEvent.focus(input);
    fireEvent.click(screen.getByRole('option', { name: 'Preto' }));

    expect(document.querySelector('input[type="hidden"]')).toHaveValue(
      'variation-2'
    );
    expect(input).toHaveValue('Preto');
  });
});
