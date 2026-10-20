import { Prisma, ProductStatus } from '@prisma/client';
import { prisma } from '../src/lib/prisma';

const categories = ['Calça', 'Camiseta', 'Moletom', 'Jaqueta', 'Calçado'];
const brands = ['Nike', 'Adidas', 'MCD'];
const variations = ['Preto', 'Branco', 'Cinza', 'Azul', 'Marrom', 'Verde'];

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function seedCatalogs() {
  for (const [index, name] of categories.entries()) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name, slug: slugify(name), position: index },
    });
  }
  for (const [index, name] of brands.entries()) {
    await prisma.brand.upsert({
      where: { name },
      update: {},
      create: { name, slug: slugify(name), position: index },
    });
  }
  for (const [index, name] of variations.entries()) {
    await prisma.variation.upsert({
      where: { name },
      update: {},
      create: { name, slug: slugify(name), position: index },
    });
  }
  console.log(
    `Catálogos: ${categories.length} categorias, ${brands.length} marcas e ${variations.length} variações.`
  );
}

async function main() {
  await seedCatalogs();

  const products = [
    {
      name: 'Camiseta Essencial Algodão',
      slug: 'camiseta-esencial-algodao',
      description: 'Camiseta básica de algodão para uso diário.',
      category: 'Camiseta',
      brand: 'MCD',
      variation: 'Branco',
      status: ProductStatus.ACTIVE,
      image:
        'https://images.pexels.com/photos/18257675/pexels-photo-18257675.jpeg?auto=compress&cs=tinysrgb&w=800',
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
      category: 'Camiseta',
      brand: 'MCD',
      variation: 'Preto',
      status: ProductStatus.ACTIVE,
      image:
        'https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg?auto=compress&cs=tinysrgb&w=800',
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
      category: 'Camiseta',
      brand: 'Adidas',
      variation: 'Cinza',
      status: ProductStatus.ACTIVE,
      image:
        'https://images.pexels.com/photos/6311588/pexels-photo-6311588.jpeg?auto=compress&cs=tinysrgb&w=800',
      variantLabel: 'Cinza / G',
      costPrice: 55.0,
      salePrice: 119.9,
      initialStock: 30,
      reorderPoint: 8,
    },
    {
      name: 'Camiseta Azul Básica',
      slug: 'camiseta-azul-basica',
      description: 'Camiseta azul básica, cor versátil.',
      category: 'Camiseta',
      brand: 'Nike',
      variation: 'Azul',
      status: ProductStatus.ACTIVE,
      image:
        'https://images.pexels.com/photos/13651809/pexels-photo-13651809.jpeg?auto=compress&cs=tinysrgb&w=800',
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
      category: 'Camiseta',
      brand: 'Adidas',
      variation: 'Verde',
      status: ProductStatus.ACTIVE,
      image:
        'https://images.pexels.com/photos/13400104/pexels-photo-13400104.jpeg?auto=compress&cs=tinysrgb&w=800',
      variantLabel: 'Verde / M',
      costPrice: 48.0,
      salePrice: 99.9,
      initialStock: 25,
      reorderPoint: 8,
    },
    {
      name: 'Moletom Cinza Conforto',
      slug: 'moletom-cinza-conforto',
      description: 'Moletom com capuz em tom cinza.',
      category: 'Moletom',
      brand: 'Nike',
      variation: 'Cinza',
      status: ProductStatus.ACTIVE,
      image:
        'https://images.pexels.com/photos/38575395/pexels-photo-38575395.jpeg?auto=compress&cs=tinysrgb&w=800',
      variantLabel: 'Cinza / G',
      costPrice: 90.0,
      salePrice: 199.9,
      initialStock: 18,
      reorderPoint: 5,
    },
    {
      name: 'Moletom Preto Urbano',
      slug: 'moletom-preto-urbano',
      description: 'Moletom preto de corte urbano.',
      category: 'Moletom',
      brand: 'MCD',
      variation: 'Preto',
      status: ProductStatus.ACTIVE,
      image:
        'https://images.pexels.com/photos/28701960/pexels-photo-28701960.jpeg?auto=compress&cs=tinysrgb&w=800',
      variantLabel: 'Preto / M',
      costPrice: 95.0,
      salePrice: 219.9,
      initialStock: 22,
      reorderPoint: 6,
    },
    {
      name: 'Calça Jeans Marrom',
      slug: 'calca-jeans-marrom',
      description: 'Calça jeans em tom marrom.',
      category: 'Calça',
      brand: 'Adidas',
      variation: 'Marrom',
      status: ProductStatus.ACTIVE,
      image:
        'https://images.pexels.com/photos/33041362/pexels-photo-33041362.jpeg?auto=compress&cs=tinysrgb&w=800',
      variantLabel: 'Marrom / 40',
      costPrice: 110.0,
      salePrice: 249.9,
      initialStock: 15,
      reorderPoint: 4,
    },
    {
      name: 'Calça Cargo Preta',
      slug: 'calca-cargo-preta',
      description: 'Calça cargo preta com bolsos laterais.',
      category: 'Calça',
      brand: 'Nike',
      variation: 'Preto',
      status: ProductStatus.ACTIVE,
      image:
        'https://images.pexels.com/photos/35043249/pexels-photo-35043249.jpeg?auto=compress&cs=tinysrgb&w=800',
      variantLabel: 'Preto / 42',
      costPrice: 105.0,
      salePrice: 239.9,
      initialStock: 12,
      reorderPoint: 4,
    },
    {
      name: 'Jaqueta Corta-Vento Azul',
      slug: 'jaqueta-corta-vento-azul',
      description: 'Jaqueta corta-vento leve em azul.',
      category: 'Jaqueta',
      brand: 'Adidas',
      variation: 'Azul',
      status: ProductStatus.ACTIVE,
      image:
        'https://images.pexels.com/photos/9502482/pexels-photo-9502482.jpeg?auto=compress&cs=tinysrgb&w=800',
      variantLabel: 'Azul / G',
      costPrice: 150.0,
      salePrice: 349.9,
      initialStock: 10,
      reorderPoint: 3,
    },
    {
      name: 'Jaqueta Jeans Verde',
      slug: 'jaqueta-jeans-verde',
      description: 'Jaqueta jeans em tom verde.',
      category: 'Jaqueta',
      brand: 'MCD',
      variation: 'Verde',
      status: ProductStatus.ACTIVE,
      image:
        'https://images.pexels.com/photos/14688296/pexels-photo-14688296.jpeg?auto=compress&cs=tinysrgb&w=800',
      variantLabel: 'Verde / M',
      costPrice: 145.0,
      salePrice: 329.9,
      initialStock: 8,
      reorderPoint: 3,
    },
    {
      name: 'Tênis Branco Clássico',
      slug: 'tenis-branco-classico',
      description: 'Tênis branco de couro, estilo clássico.',
      category: 'Calçado',
      brand: 'Nike',
      variation: 'Branco',
      status: ProductStatus.ACTIVE,
      image:
        'https://images.pexels.com/photos/18110858/pexels-photo-18110858.jpeg?auto=compress&cs=tinysrgb&w=800',
      variantLabel: 'Branco / 41',
      costPrice: 180.0,
      salePrice: 399.9,
      initialStock: 14,
      reorderPoint: 4,
    },
    {
      name: 'Tênis Preto Runner',
      slug: 'tenis-preto-runner',
      description: 'Tênis preto para corrida.',
      category: 'Calçado',
      brand: 'Adidas',
      variation: 'Preto',
      status: ProductStatus.ACTIVE,
      image:
        'https://images.pexels.com/photos/29096394/pexels-photo-29096394.jpeg?auto=compress&cs=tinysrgb&w=800',
      variantLabel: 'Preto / 42',
      costPrice: 190.0,
      salePrice: 419.9,
      initialStock: 16,
      reorderPoint: 5,
    },
    {
      name: 'Calçado Marrom Casual',
      slug: 'calcado-marrom-casual',
      description: 'Sapato casual marrom.',
      category: 'Calçado',
      brand: 'MCD',
      variation: 'Marrom',
      status: ProductStatus.ACTIVE,
      image:
        'https://images.pexels.com/photos/6961151/pexels-photo-6961151.jpeg?auto=compress&cs=tinysrgb&w=800',
      variantLabel: 'Marrom / 40',
      costPrice: 160.0,
      salePrice: 359.9,
      initialStock: 9,
      reorderPoint: 3,
    },
  ];

  for (const product of products) {
    const [category, brand, variation] = await Promise.all([
      prisma.category.findUnique({ where: { name: product.category } }),
      prisma.brand.findUnique({ where: { name: product.brand } }),
      prisma.variation.findUnique({ where: { name: product.variation } }),
    ]);

    const existing = await prisma.product.findUnique({
      where: { slug: product.slug },
      select: { id: true },
    });

    if (existing) {
      // Keep the demo catalog's images in sync with this file without
      // overwriting other fields that may have been edited in the admin.
      await prisma.product.update({
        where: { id: existing.id },
        data: { image: product.image },
      });
      console.log(`Produto atualizado (imagem): ${product.name}`);
      continue;
    }

    try {
      const created = await prisma.product.create({
        data: {
          name: product.name,
          slug: product.slug,
          description: product.description,
          categoryId: category?.id ?? null,
          brandId: brand?.id ?? null,
          variationId: variation?.id ?? null,
          status: product.status,
          image: product.image,
          variants: {
            create: {
              sku: `${slugify(product.name).toUpperCase()}-M`,
              barcode: null,
              label: product.variantLabel,
              attributes: {
                label: product.variantLabel,
                category: product.category,
                brand: product.brand,
                variation: product.variation,
              },
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
      console.log(
        `Produto criado: ${created.name} (SKU: ${created.variants[0].sku})`
      );
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        console.log(
          `Produto já existe (slug ou SKU duplicado): ${product.name}`
        );
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
