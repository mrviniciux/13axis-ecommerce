export const products = [
  {
    id: 'essential-cotton',
    image:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80',
    price: 79.9,
    color: 'white',
    sizes: ['P', 'M', 'G', 'GG'],
  },
  {
    id: 'classic-black',
    image:
      'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=80',
    price: 89.9,
    color: 'black',
    sizes: ['P', 'M', 'G'],
  },
  {
    id: 'oversized-graphite',
    image:
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80',
    price: 119.9,
    color: 'gray',
    sizes: ['M', 'G', 'GG'],
  },
  {
    id: 'soft-pink',
    image:
      'https://images.pexels.com/photos/6311392/pexels-photo-6311392.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 94.9,
    color: 'brown',
    sizes: ['P', 'M', 'G'],
  },
  {
    id: 'navy-basic',
    image:
      'https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=800&q=80',
    price: 84.9,
    color: 'blue',
    sizes: ['P', 'M', 'G', 'GG'],
  },
  {
    id: 'earthy-green',
    image:
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80',
    price: 99.9,
    color: 'green',
    sizes: ['M', 'G', 'GG'],
  },
  {
    id: 'everyday-white',
    image:
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80',
    price: 69.9,
    color: 'white',
    sizes: ['P', 'M', 'G'],
  },
  {
    id: 'urban-black',
    image:
      'https://images.unsplash.com/photo-1627225924765-552d49cf47ad?auto=format&fit=crop&w=800&q=80',
    price: 109.9,
    color: 'black',
    sizes: ['M', 'G', 'GG'],
  },
] as const;

export type Product = (typeof products)[number];
