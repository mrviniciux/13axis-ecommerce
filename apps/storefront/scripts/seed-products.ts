import { prisma } from '../src/lib/prisma';
import { Prisma, ProductStatus } from '@prisma/client';

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function main() {
  const products = [
    {
      name: 'Camiseta Essencial Algodão',
      slug: 'camiseta-esencial-algodao',
      description: 'Camiseta básica de algodão para uso diário.',
      category: 'Camisetas',
      brand: '13Axis',
      status: ProductStatus.ACTIVE,
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80',
      variantLabel: 'Branco / M',
      costPrice: 35.0,
      salePrice: 79.9,
      initialStock: 50,
      reorderPoint: 10,
    },
    {
      name: 'Camiseta Preta Clássica',
      slug: 'camiseta-preta-classica',
      description: 'Camiseta preta clássica, corte tradicional.',
      category: 'Camisetas',
      brand: '13Axis',
      status: ProductStatus.ACTIVE,
      image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=80',
      variantLabel: 'Preto / M',
      costPrice: 40.0,
      salePrice: 89.9,
      initialStock: 40,
      reorderPoint: 10,
    },
    {
      name: 'Camiseta Oversized Grafite',
      slug: 'camiseta-oversized-grafite',
      description: 'Camiseta oversized em tom grafite.',
      category: 'Camisetas',
      brand: '13Axis',
      status: ProductStatus.ACTIVE,
      image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80',
      variantLabel: 'Grafite / G',
      costPrice: 55.0,
      salePrice: 119.9,
      initialStock: 30,
      reorderPoint: 8,
    },
    {
      name: 'Camiseta Rosa Suave',
      slug: 'camiseta-rosa-suave',
      description: 'Camiseta rosa suave, estilo delicado.',
      category: 'Camisetas',
      brand: '13Axis',
      status: ProductStatus.ACTIVE,
      image: 'https://images.pexels.com/photos/6311392/pexels-photo-6311392.jpeg?auto=compress&cs=tinysrgb&w=800',
      variantLabel: 'Rosa / P',
      costPrice: 45.0,
      salePrice: 94.9,
      initialStock: 35,
      reorderPoint: 8,
    },
    {
      name: 'Camiseta Azul Básica',
      slug: 'camiseta-azul-basica',
      description: 'Camiseta azul básica, cor versátil.',
      category: 'Camisetas',
      brand: '13Axis',
      status: ProductStatus.ACTIVE,
      image: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=800&q=80',
      variantLabel: 'Azul / G',
      costPrice: 40.0,
      salePrice: 84.9,
      initialStock: 45,
      reorderPoint: 10,
    },
    {
      name: 'Camiseta Verde Terroso',
      slug: 'camiseta-verde-terroso',
      description: 'Camiseta verde terroso, estilo natural.',
      category: 'Camisetas',
      brand: '13Axis',
      status: ProductStatus.ACTIVE,
      image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80',
      variantLabel: 'Verde / M',
      costPrice: 48.0,
      salePrice: 99.9,
      initialStock: 25,
      reorderPoint: 8,
    },
    {
      name: 'Camiseta Branca Everyday',
      slug: 'camiseta-branca-everyday',
      description: 'Camiseta branca para uso cotidiano.',
      category: 'Camisetas',
      brand: '13Axis',
      status: ProductStatus.ACTIVE,
      image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80',
      variantLabel: 'Branco / P',
      costPrice: 32.0,
      salePrice: 69.9,
      initialStock: 60,
      reorderPoint: 12,
    },
    {
      name: 'Camiseta Preta Urbana',
      slug: 'camiseta-preta-urbana',
      description: 'Camiseta preta com estilo urbano.',
      category: 'Camisetas',
      brand: '13Axis',
      status: ProductStatus.ACTIVE,
      image: 'https://images.unsplash.com/photo-1627225924765-552d49cf47ad?auto=format&fit=crop&w=800&q=80',
      variantLabel: 'Preto / G',
      costPrice: 50.0,
      salePrice: 109.9,
      initialStock: 20,
      reorderPoint: 8,
    },
  ];

  for (const product of products) {
    try {
      const created = await prisma.product.create({
        data: {
          name: product.name,
          slug: product.slug,
          description: product.description,
          category: product.category,
          brand: product.brand,
          status: product.status,
          image: product.image,
          variants: {
            create: {
              sku: `${slugify(product.name).toUpperCase()}-M`,
              barcode: null,
              label: product.variantLabel,
              attributes: { label: product.variantLabel },
              costPrice: product.costPrice,
              salePrice: product.salePrice,
              inventory: {
                create: {
                  onHand: product.initialStock,
                  reorderPoint: product.reorderPoint,
                },
              },
              movements:
                product.initialStock > 0
                  ? {
                      create: {
                        type: 'INITIAL_STOCK',
                        quantity: product.initialStock,
                        note: 'Saldo inicial no cadastro do produto',
                      },
                    }
                  : undefined,
            },
          },
        },
        include: { variants: { include: { inventory: true } } },
      });
      console.log(`Produto criado: ${created.name} (SKU: ${created.variants[0].sku})`);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        console.log(`Produto já existe (SKU duplicado): ${product.name}`);
      } else {
        throw error;
      }
    }
  }

  console.log('Seed concluído!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });