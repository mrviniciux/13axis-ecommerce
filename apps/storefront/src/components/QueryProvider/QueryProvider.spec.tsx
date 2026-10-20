import { render, screen } from '@testing-library/react';
import { useQuery } from '@tanstack/react-query';
import QueryProvider from './QueryProvider';

// DevTools use browser APIs unavailable in jsdom
jest.mock('@tanstack/react-query-devtools', () => ({
  ReactQueryDevtools: () => null,
}));

describe('QueryProvider', () => {
  it('renders children', () => {
    render(<QueryProvider>hello query</QueryProvider>);
    expect(screen.getByText('hello query')).toBeInTheDocument();
  });

  it('provides a QueryClient to descendants', async () => {
    function Consumer() {
      const { data, status } = useQuery({
        queryKey: ['test'],
        queryFn: () => Promise.resolve('ok'),
      });
      return <span>{status === 'success' ? data : status}</span>;
    }

    render(
      <QueryProvider>
        <Consumer />
      </QueryProvider>
    );

    // Initially pending
    expect(screen.getByText('pending')).toBeInTheDocument();
  });
});
