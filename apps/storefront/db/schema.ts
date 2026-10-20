import {
  pgTable,
  pgEnum,
  text,
  varchar,
  timestamp,
  integer,
  boolean,
  numeric,
  jsonb,
  primaryKey,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';

export const userRole = pgEnum('user_role', [
  'ADMIN',
  'INVENTORY_MANAGER',
  'USER',
]);
export const productStatus = pgEnum('product_status', [
  'DRAFT',
  'ACTIVE',
  'ARCHIVED',
]);
export const stockMovementType = pgEnum('stock_movement_type', [
  'INITIAL_STOCK',
  'RECEIPT',
  'SALE',
  'RETURN',
  'ADJUSTMENT',
  'RESERVATION',
  'RELEASE',
  'TRANSFER',
  'SYNC',
]);
export const integrationStatus = pgEnum('integration_status', [
  'ACTIVE',
  'PAUSED',
  'ERROR',
]);

export const userTable = pgTable(
  'user',
  {
    id: text('id')
      .primaryKey()
      .notNull()
      .$defaultFn(() => crypto.randomUUID()),
    name: text('name'),
    email: text('email').unique(),
    emailVerified: timestamp('email_verified', { precision: 3, mode: 'date' }),
    image: text('image'),
    passwordHash: text('password_hash'),
    role: userRole('role').notNull().default('USER'),
    createdAt: timestamp('created_at', { precision: 3, mode: 'date' })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { precision: 3, mode: 'date' })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('user_role_created_at_index').on(table.role, table.createdAt),
  ]
);

export const accountTable = pgTable(
  'account',
  {
    userId: text('user_id')
      .notNull()
      .references(() => userTable.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('provider_account_id').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (table) => [
    primaryKey({ columns: [table.provider, table.providerAccountId] }),
    index('account_user_id_index').on(table.userId),
  ]
);

export const sessionTable = pgTable(
  'session',
  {
    sessionToken: text('session_token').notNull().unique(),
    userId: text('user_id')
      .notNull()
      .references(() => userTable.id, { onDelete: 'cascade' }),
    expires: timestamp('expires', { precision: 3, mode: 'date' }).notNull(),
  },
  (table) => [index('session_user_id_index').on(table.userId)]
);

export const verificationTokenTable = pgTable(
  'verification_token',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull().unique(),
    expires: timestamp('expires', { precision: 3, mode: 'date' }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.identifier, table.token] })]
);

export const categoryTable = pgTable(
  'category',
  {
    id: text('id')
      .primaryKey()
      .notNull()
      .$defaultFn(() => crypto.randomUUID()),
    name: varchar('name', { length: 100 }).notNull().unique(),
    slug: varchar('slug', { length: 120 }).notNull().unique(),
    position: integer('position').notNull().default(0),
    active: boolean('active').notNull().default(true),
    createdAt: timestamp('created_at', { precision: 3, mode: 'date' })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { precision: 3, mode: 'date' })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('category_active_position_index').on(table.active, table.position),
  ]
);

export const brandTable = pgTable(
  'brand',
  {
    id: text('id')
      .primaryKey()
      .notNull()
      .$defaultFn(() => crypto.randomUUID()),
    name: varchar('name', { length: 100 }).notNull().unique(),
    slug: varchar('slug', { length: 120 }).notNull().unique(),
    position: integer('position').notNull().default(0),
    active: boolean('active').notNull().default(true),
    createdAt: timestamp('created_at', { precision: 3, mode: 'date' })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { precision: 3, mode: 'date' })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('brand_active_position_index').on(table.active, table.position),
  ]
);

export const variationTable = pgTable(
  'variation',
  {
    id: text('id')
      .primaryKey()
      .notNull()
      .$defaultFn(() => crypto.randomUUID()),
    name: varchar('name', { length: 100 }).notNull().unique(),
    slug: varchar('slug', { length: 120 }).notNull().unique(),
    position: integer('position').notNull().default(0),
    active: boolean('active').notNull().default(true),
    createdAt: timestamp('created_at', { precision: 3, mode: 'date' })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { precision: 3, mode: 'date' })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('variation_active_position_index').on(table.active, table.position),
  ]
);

export const productTable = pgTable(
  'product',
  {
    id: text('id')
      .primaryKey()
      .notNull()
      .$defaultFn(() => crypto.randomUUID()),
    name: varchar('name', { length: 180 }).notNull(),
    slug: varchar('slug', { length: 200 }).notNull().unique(),
    description: text('description'),
    categoryId: text('category_id').references(() => categoryTable.id, {
      onDelete: 'set null',
    }),
    brandId: text('brand_id').references(() => brandTable.id, {
      onDelete: 'set null',
    }),
    variationId: text('variation_id').references(() => variationTable.id, {
      onDelete: 'set null',
    }),
    status: productStatus('status').notNull().default('DRAFT'),
    image: text('image'),
    createdAt: timestamp('created_at', { precision: 3, mode: 'date' })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { precision: 3, mode: 'date' })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('product_status_category_id_index').on(
      table.status,
      table.categoryId
    ),
    index('product_brand_id_index').on(table.brandId),
    index('product_variation_id_index').on(table.variationId),
    index('product_updated_at_index').on(table.updatedAt),
  ]
);

export const productVariantTable = pgTable(
  'product_variant',
  {
    id: text('id')
      .primaryKey()
      .notNull()
      .$defaultFn(() => crypto.randomUUID()),
    productId: text('product_id')
      .notNull()
      .references(() => productTable.id, { onDelete: 'cascade' }),
    sku: varchar('sku', { length: 100 }).notNull().unique(),
    barcode: varchar('barcode', { length: 100 }).unique(),
    label: varchar('label', { length: 120 }),
    attributes: jsonb('attributes'),
    costPrice: numeric('cost_price', { precision: 12, scale: 2 }).notNull(),
    salePrice: numeric('sale_price', { precision: 12, scale: 2 }).notNull(),
    createdAt: timestamp('created_at', { precision: 3, mode: 'date' })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { precision: 3, mode: 'date' })
      .notNull()
      .defaultNow(),
  },
  (table) => [index('product_variant_product_id_index').on(table.productId)]
);

export const inventoryItemTable = pgTable(
  'inventory_item',
  {
    id: text('id')
      .primaryKey()
      .notNull()
      .$defaultFn(() => crypto.randomUUID()),
    variantId: text('variant_id')
      .notNull()
      .unique()
      .references(() => productVariantTable.id, { onDelete: 'cascade' }),
    onHand: integer('on_hand').notNull().default(0),
    reserved: integer('reserved').notNull().default(0),
    reorderPoint: integer('reorder_point').notNull().default(0),
    updatedAt: timestamp('updated_at', { precision: 3, mode: 'date' })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('inventory_item_on_hand_reorder_point_index').on(
      table.onHand,
      table.reorderPoint
    ),
  ]
);

export const stockMovementTable = pgTable(
  'stock_movement',
  {
    id: text('id')
      .primaryKey()
      .notNull()
      .$defaultFn(() => crypto.randomUUID()),
    variantId: text('variant_id')
      .notNull()
      .references(() => productVariantTable.id, { onDelete: 'cascade' }),
    actorId: text('actor_id').references(() => userTable.id, {
      onDelete: 'set null',
    }),
    type: stockMovementType('type').notNull(),
    quantity: integer('quantity').notNull(),
    reference: varchar('reference', { length: 180 }),
    note: varchar('note', { length: 500 }),
    externalSource: varchar('external_source', { length: 80 }),
    externalEventId: varchar('external_event_id', { length: 180 }),
    occurredAt: timestamp('occurred_at', { precision: 3, mode: 'date' })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex('stock_movement_external_source_external_event_id_unique').on(
      table.externalSource,
      table.externalEventId
    ),
    index('stock_movement_variant_id_occurred_at_index').on(
      table.variantId,
      table.occurredAt
    ),
    index('stock_movement_type_occurred_at_index').on(
      table.type,
      table.occurredAt
    ),
  ]
);

export const integrationChannelTable = pgTable(
  'integration_channel',
  {
    id: text('id')
      .primaryKey()
      .notNull()
      .$defaultFn(() => crypto.randomUUID()),
    name: varchar('name', { length: 120 }).notNull(),
    provider: varchar('provider', { length: 80 }).notNull(),
    status: integrationStatus('status').notNull().default('PAUSED'),
    settings: jsonb('settings'),
    createdAt: timestamp('created_at', { precision: 3, mode: 'date' })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { precision: 3, mode: 'date' })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex('integration_channel_provider_name_unique').on(
      table.provider,
      table.name
    ),
    index('integration_channel_status_index').on(table.status),
  ]
);

export const productExternalMappingTable = pgTable(
  'product_external_mapping',
  {
    id: text('id')
      .primaryKey()
      .notNull()
      .$defaultFn(() => crypto.randomUUID()),
    channelId: text('channel_id')
      .notNull()
      .references(() => integrationChannelTable.id, { onDelete: 'cascade' }),
    variantId: text('variant_id')
      .notNull()
      .references(() => productVariantTable.id, { onDelete: 'cascade' }),
    externalProductId: varchar('external_product_id', {
      length: 180,
    }).notNull(),
    externalVariantId: varchar('external_variant_id', {
      length: 180,
    }).notNull(),
    externalSku: varchar('external_sku', { length: 100 }),
    lastSyncedAt: timestamp('last_synced_at', { precision: 3, mode: 'date' }),
    lastSyncError: text('last_sync_error'),
    createdAt: timestamp('created_at', { precision: 3, mode: 'date' })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { precision: 3, mode: 'date' })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex('product_external_mapping_channel_id_variant_id_unique').on(
      table.channelId,
      table.variantId
    ),
    uniqueIndex(
      'product_external_mapping_channel_id_external_variant_id_unique'
    ).on(table.channelId, table.externalVariantId),
    index('product_external_mapping_external_product_id_index').on(
      table.externalProductId
    ),
  ]
);
