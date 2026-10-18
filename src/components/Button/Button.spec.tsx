import { fireEvent, render, screen } from '@testing-library/react';
import Button from './Button';

test('renders the label and invokes the click handler', () => {
  const onClick = jest.fn();
  render(<Button text="Click me" onClick={onClick} />);

  fireEvent.click(screen.getByRole('button', { name: 'Click me' }));

  expect(onClick).toHaveBeenCalledTimes(1);
});
