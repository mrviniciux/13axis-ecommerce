import { render, screen } from '@testing-library/react';
import LanguageSelect from './LanguageSelect';

test('renders its children', () => {
  render(<LanguageSelect>LanguageSelect content</LanguageSelect>);

  expect(screen.getByText('LanguageSelect content')).toBeInTheDocument();
});
