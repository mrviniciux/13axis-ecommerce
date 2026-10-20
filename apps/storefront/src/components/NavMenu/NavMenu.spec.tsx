import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NavMenu from './NavMenu';

test('renders its children when opened', async () => {
  const user = userEvent.setup();
  render(<NavMenu title="Menu">NavMenu content</NavMenu>);

  await user.click(screen.getByRole('button', { name: /Menu/ }));

  expect(await screen.findByText('NavMenu content')).toBeInTheDocument();
});
