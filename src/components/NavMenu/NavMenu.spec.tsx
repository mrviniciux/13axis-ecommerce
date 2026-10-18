import { render, screen } from '@testing-library/react';
import NavMenu from './NavMenu';

test('renders its children', () => {
  render(<NavMenu>NavMenu content</NavMenu>);

  expect(screen.getByText('NavMenu content')).toBeInTheDocument();
});
