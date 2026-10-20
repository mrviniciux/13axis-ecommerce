import { z } from 'zod';

export const productImageSchema = z
  .string()
  .max(2_800_000)
  .refine((image) => {
    if (/^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/.test(image)) {
      return true;
    }
    try {
      const url = new URL(image);
      return url.protocol === 'https:' || url.protocol === 'http:';
    } catch {
      return false;
    }
  }, 'Envie uma imagem PNG, JPEG ou WebP válida.')
  .nullable()
  .optional();

export function getProductImageUrl(
  image: string | null,
  productId: string,
  updatedAt?: Date | string
) {
  if (!image?.startsWith('data:image/')) return image;
  const version = updatedAt ? new Date(updatedAt).getTime().toString() : '';
  return `/api/products/${productId}/image${version ? `?v=${version}` : ''}`;
}
