import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ThemeToggle from './ThemeToggle';

// Stub useTheme so tests don't need the full ThemeProvider tree
const mockSetTheme = jest.fn();
let mockResolved: 'light' | 'dark' = 'light';

jest.mock('@/components/ThemeProvider', () => ({
  useTheme: () => ({ resolvedTheme: mockResolved, setTheme: mockSetTheme }),
}));

describe('ThemeToggle (icon variant)', () => {
  beforeEach(() => {
    mockResolved = 'light';
    mockSetTheme.mockClear();
  });

  it('shows Moon icon and dark-mode label when theme is light', () => {
    render(
      <ThemeToggle lightLabel="Switch to light" darkLabel="Switch to dark" />
    );
    expect(
      screen.getByRole('button', { name: /switch to dark/i })
    ).toBeInTheDocument();
  });

  it('shows Sun icon and light-mode label when theme is dark', () => {
    mockResolved = 'dark';
    render(
      <ThemeToggle lightLabel="Switch to light" darkLabel="Switch to dark" />
    );
    expect(
      screen.getByRole('button', { name: /switch to light/i })
    ).toBeInTheDocument();
  });

  it('calls setTheme with dark when clicked in light mode', async () => {
    render(
      <ThemeToggle lightLabel="Switch to light" darkLabel="Switch to dark" />
    );
    await userEvent.click(screen.getByRole('button'));
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });
});
