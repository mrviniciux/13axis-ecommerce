CREATE TYPE "integration_status" AS ENUM('ACTIVE', 'PAUSED', 'ERROR');--> statement-breakpoint
CREATE TYPE "product_status" AS ENUM('DRAFT', 'ACTIVE', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "stock_movement_type" AS ENUM('INITIAL_STOCK', 'RECEIPT', 'SALE', 'RETURN', 'ADJUSTMENT', 'RESERVATION', 'RELEASE', 'TRANSFER', 'SYNC');--> statement-breakpoint
CREATE TYPE "user_role" AS ENUM('ADMIN', 'INVENTORY_MANAGER', 'USER');--> statement-breakpoint
CREATE TABLE "account" (
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"provider" text,
	"provider_account_id" text,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "account_pkey" PRIMARY KEY("provider","provider_account_id")
);
--> statement-breakpoint
CREATE TABLE "brand" (
	"id" text PRIMARY KEY,
	"name" varchar(100) NOT NULL UNIQUE,
	"slug" varchar(120) NOT NULL UNIQUE,
	"position" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp(3) DEFAULT now() NOT NULL,
	"updated_at" timestamp(3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "category" (
	"id" text PRIMARY KEY,
	"name" varchar(100) NOT NULL UNIQUE,
	"slug" varchar(120) NOT NULL UNIQUE,
	"position" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp(3) DEFAULT now() NOT NULL,
	"updated_at" timestamp(3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "integration_channel" (
	"id" text PRIMARY KEY,
	"name" varchar(120) NOT NULL,
	"provider" varchar(80) NOT NULL,
	"status" "integration_status" DEFAULT 'PAUSED'::"integration_status" NOT NULL,
	"settings" jsonb,
	"created_at" timestamp(3) DEFAULT now() NOT NULL,
	"updated_at" timestamp(3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_item" (
	"id" text PRIMARY KEY,
	"variant_id" text NOT NULL UNIQUE,
	"on_hand" integer DEFAULT 0 NOT NULL,
	"reserved" integer DEFAULT 0 NOT NULL,
	"reorder_point" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp(3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_external_mapping" (
	"id" text PRIMARY KEY,
	"channel_id" text NOT NULL,
	"variant_id" text NOT NULL,
	"external_product_id" varchar(180) NOT NULL,
	"external_variant_id" varchar(180) NOT NULL,
	"external_sku" varchar(100),
	"last_synced_at" timestamp(3),
	"last_sync_error" text,
	"created_at" timestamp(3) DEFAULT now() NOT NULL,
	"updated_at" timestamp(3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product" (
	"id" text PRIMARY KEY,
	"name" varchar(180) NOT NULL,
	"slug" varchar(200) NOT NULL UNIQUE,
	"description" text,
	"category_id" text,
	"brand_id" text,
	"variation_id" text,
	"status" "product_status" DEFAULT 'DRAFT'::"product_status" NOT NULL,
	"image" text,
	"created_at" timestamp(3) DEFAULT now() NOT NULL,
	"updated_at" timestamp(3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_variant" (
	"id" text PRIMARY KEY,
	"product_id" text NOT NULL,
	"sku" varchar(100) NOT NULL UNIQUE,
	"barcode" varchar(100) UNIQUE,
	"label" varchar(120),
	"attributes" jsonb,
	"cost_price" numeric(12,2) NOT NULL,
	"sale_price" numeric(12,2) NOT NULL,
	"created_at" timestamp(3) DEFAULT now() NOT NULL,
	"updated_at" timestamp(3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"session_token" text NOT NULL UNIQUE,
	"user_id" text NOT NULL,
	"expires" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stock_movement" (
	"id" text PRIMARY KEY,
	"variant_id" text NOT NULL,
	"actor_id" text,
	"type" "stock_movement_type" NOT NULL,
	"quantity" integer NOT NULL,
	"reference" varchar(180),
	"note" varchar(500),
	"external_source" varchar(80),
	"external_event_id" varchar(180),
	"occurred_at" timestamp(3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY,
	"name" text,
	"email" text UNIQUE,
	"email_verified" timestamp(3),
	"image" text,
	"password_hash" text,
	"role" "user_role" DEFAULT 'USER'::"user_role" NOT NULL,
	"created_at" timestamp(3) DEFAULT now() NOT NULL,
	"updated_at" timestamp(3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "variation" (
	"id" text PRIMARY KEY,
	"name" varchar(100) NOT NULL UNIQUE,
	"slug" varchar(120) NOT NULL UNIQUE,
	"position" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp(3) DEFAULT now() NOT NULL,
	"updated_at" timestamp(3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification_token" (
	"identifier" text,
	"token" text UNIQUE,
	"expires" timestamp(3) NOT NULL,
	CONSTRAINT "verification_token_pkey" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
CREATE INDEX "account_user_id_index" ON "account" ("user_id");--> statement-breakpoint
CREATE INDEX "brand_active_position_index" ON "brand" ("active","position");--> statement-breakpoint
CREATE INDEX "category_active_position_index" ON "category" ("active","position");--> statement-breakpoint
CREATE UNIQUE INDEX "integration_channel_provider_name_unique" ON "integration_channel" ("provider","name");--> statement-breakpoint
CREATE INDEX "integration_channel_status_index" ON "integration_channel" ("status");--> statement-breakpoint
CREATE INDEX "inventory_item_on_hand_reorder_point_index" ON "inventory_item" ("on_hand","reorder_point");--> statement-breakpoint
CREATE UNIQUE INDEX "product_external_mapping_channel_id_variant_id_unique" ON "product_external_mapping" ("channel_id","variant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "product_external_mapping_channel_id_external_variant_id_unique" ON "product_external_mapping" ("channel_id","external_variant_id");--> statement-breakpoint
CREATE INDEX "product_external_mapping_external_product_id_index" ON "product_external_mapping" ("external_product_id");--> statement-breakpoint
CREATE INDEX "product_status_category_id_index" ON "product" ("status","category_id");--> statement-breakpoint
CREATE INDEX "product_brand_id_index" ON "product" ("brand_id");--> statement-breakpoint
CREATE INDEX "product_variation_id_index" ON "product" ("variation_id");--> statement-breakpoint
CREATE INDEX "product_updated_at_index" ON "product" ("updated_at");--> statement-breakpoint
CREATE INDEX "product_variant_product_id_index" ON "product_variant" ("product_id");--> statement-breakpoint
CREATE INDEX "session_user_id_index" ON "session" ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "stock_movement_external_source_external_event_id_unique" ON "stock_movement" ("external_source","external_event_id");--> statement-breakpoint
CREATE INDEX "stock_movement_variant_id_occurred_at_index" ON "stock_movement" ("variant_id","occurred_at");--> statement-breakpoint
CREATE INDEX "stock_movement_type_occurred_at_index" ON "stock_movement" ("type","occurred_at");--> statement-breakpoint
CREATE INDEX "user_role_created_at_index" ON "user" ("role","created_at");--> statement-breakpoint
CREATE INDEX "variation_active_position_index" ON "variation" ("active","position");--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "inventory_item" ADD CONSTRAINT "inventory_item_variant_id_product_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variant"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "product_external_mapping" ADD CONSTRAINT "product_external_mapping_channel_id_integration_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "integration_channel"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "product_external_mapping" ADD CONSTRAINT "product_external_mapping_variant_id_product_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variant"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_category_id_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_brand_id_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brand"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_variation_id_variation_id_fkey" FOREIGN KEY ("variation_id") REFERENCES "variation"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "product_variant" ADD CONSTRAINT "product_variant_product_id_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "stock_movement" ADD CONSTRAINT "stock_movement_variant_id_product_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variant"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "stock_movement" ADD CONSTRAINT "stock_movement_actor_id_user_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "user"("id") ON DELETE SET NULL;