export const colorOptions = [
  { value: 'black', swatch: '#171717' },
  { value: 'blue', swatch: '#254a75' },
  { value: 'gray', swatch: '#888888' },
  { value: 'green', swatch: '#526c57' },
  { value: 'brown', swatch: '#6f4e37' },
  { value: 'white', swatch: '#ffffff' },
] as const;

export const sizeOptions = ['P', 'M', 'G', 'GG'] as const;

export const fallbackColorSwatch = '#d995a5';

export type ColorOption = (typeof colorOptions)[number];
export type ColorValue = ColorOption['value'];
export type SizeValue = (typeof sizeOptions)[number];

export function getColorSwatch(color: string) {
  return (
    colorOptions.find((option) => option.value === color)?.swatch ??
    fallbackColorSwatch
  );
}
