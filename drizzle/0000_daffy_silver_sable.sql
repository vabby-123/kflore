CREATE TYPE "public"."enquiry_source" AS ENUM('CONTACT_FORM', 'WHATSAPP_CART', 'WHATSAPP_PRODUCT');--> statement-breakpoint
CREATE TYPE "public"."enquiry_status" AS ENUM('NEW', 'CONTACTED', 'CONFIRMED', 'COMPLETED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('NEW', 'CONTACTED', 'CONFIRMED', 'COMPLETED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."product_status" AS ENUM('DRAFT', 'PUBLISHED');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('ADMIN', 'EDITOR');--> statement-breakpoint
CREATE TYPE "public"."stock_status" AS ENUM('IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK', 'MADE_TO_ORDER');--> statement-breakpoint
CREATE TABLE "about_page" (
	"id" text PRIMARY KEY DEFAULT 'about' NOT NULL,
	"family_florist" boolean DEFAULT true NOT NULL,
	"years_of_experience" integer,
	"founder_name" text DEFAULT 'Keshwini Ganesan',
	"story" text,
	"mission" text,
	"values" text[] DEFAULT '{}' NOT NULL,
	"image" text,
	"additional_images" text[] DEFAULT '{}' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"action" text NOT NULL,
	"entity" text NOT NULL,
	"entity_id" text,
	"details" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"image" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"status" "product_status" DEFAULT 'PUBLISHED' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "collections" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"image" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"status" "product_status" DEFAULT 'PUBLISHED' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact_settings" (
	"id" text PRIMARY KEY DEFAULT 'contact' NOT NULL,
	"business_name" text DEFAULT 'KFLORÉ' NOT NULL,
	"whatsapp" text,
	"phone" text,
	"email" text,
	"address" text,
	"google_maps_url" text,
	"opening_hours" text,
	"instagram" text,
	"facebook" text,
	"tiktok" text,
	"logo_url" text,
	"currency" text DEFAULT 'MYR' NOT NULL,
	"timezone" text DEFAULT 'Asia/Kuala_Lumpur' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "delivery_settings" (
	"id" text PRIMARY KEY DEFAULT 'delivery' NOT NULL,
	"areas" text DEFAULT 'Kuala Lumpur & Selangor' NOT NULL,
	"excluded_areas" text,
	"same_day_available" boolean DEFAULT true NOT NULL,
	"charges" text,
	"order_cut_off_time" text,
	"delivery_notes" text,
	"public_holiday_notes" text,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "enquiries" (
	"id" text PRIMARY KEY NOT NULL,
	"customer_name" text NOT NULL,
	"phone" text,
	"email" text,
	"message" text,
	"interested_product" text,
	"delivery_area" text,
	"delivery_date" timestamp,
	"estimated_value" numeric(10, 2),
	"source" "enquiry_source" DEFAULT 'CONTACT_FORM' NOT NULL,
	"status" "enquiry_status" DEFAULT 'NEW' NOT NULL,
	"internal_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "homepage" (
	"id" text PRIMARY KEY DEFAULT 'homepage' NOT NULL,
	"hero_heading_line1" text DEFAULT 'Each petal' NOT NULL,
	"hero_heading_line2" text DEFAULT 'tells a story.' NOT NULL,
	"hero_subtitle" text DEFAULT 'KFLORÉ creates timeless floral arrangements designed to make every occasion unforgettable.' NOT NULL,
	"hero_image" text,
	"hero_cta_primary_label" text DEFAULT 'EXPLORE COLLECTIONS' NOT NULL,
	"hero_cta_primary_href" text DEFAULT '/collections' NOT NULL,
	"hero_cta_secondary_label" text DEFAULT 'SHOP FLOWERS' NOT NULL,
	"hero_cta_secondary_href" text DEFAULT '/shop' NOT NULL,
	"about_heading" text DEFAULT 'WHERE FLOWERS
BECOME TIMELESS
EXPRESSIONS.' NOT NULL,
	"about_excerpt" text,
	"about_image" text,
	"instagram_enabled" boolean DEFAULT false NOT NULL,
	"instagram_handle" text,
	"testimonials_enabled" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" text PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"filename" text NOT NULL,
	"alt_text" text,
	"width" integer,
	"height" integer,
	"used_in" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"product_id" text,
	"name" text NOT NULL,
	"variant" text,
	"quantity" integer DEFAULT 1 NOT NULL,
	"price" numeric(10, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" text PRIMARY KEY NOT NULL,
	"enquiry_id" text,
	"customer_name" text NOT NULL,
	"phone" text,
	"email" text,
	"delivery_area" text,
	"status" "order_status" DEFAULT 'NEW' NOT NULL,
	"subtotal" numeric(10, 2) NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_collections" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"collection_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_images" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"url" text NOT NULL,
	"alt_text" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_variants" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"name" text NOT NULL,
	"sku" text,
	"price" numeric(10, 2),
	"stock" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" varchar(255) NOT NULL,
	"short_description" text,
	"description" text,
	"price" numeric(10, 2) NOT NULL,
	"compare_at_price" numeric(10, 2),
	"category_id" text,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"best_seller" boolean DEFAULT false NOT NULL,
	"status" "product_status" DEFAULT 'PUBLISHED' NOT NULL,
	"stock_status" "stock_status" DEFAULT 'IN_STOCK' NOT NULL,
	"occasion" text,
	"flower_type" text,
	"colour" text,
	"size" text,
	"delivery_eligible" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"role" "role" DEFAULT 'EDITOR' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_enquiry_id_enquiries_id_fk" FOREIGN KEY ("enquiry_id") REFERENCES "public"."enquiries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_collections" ADD CONSTRAINT "product_collections_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_collections" ADD CONSTRAINT "product_collections_collection_id_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_logs_created_idx" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "audit_logs_user_idx" ON "audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "collections_slug_idx" ON "collections" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "enquiries_status_idx" ON "enquiries" USING btree ("status");--> statement-breakpoint
CREATE INDEX "enquiries_created_idx" ON "enquiries" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "media_created_idx" ON "media" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "order_items_order_idx" ON "order_items" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "orders_status_idx" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "orders_created_idx" ON "orders" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "product_collections_uniq" ON "product_collections" USING btree ("product_id","collection_id");--> statement-breakpoint
CREATE INDEX "product_images_product_idx" ON "product_images" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_variants_product_idx" ON "product_variants" USING btree ("product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "products_slug_idx" ON "products" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "products_category_idx" ON "products" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "products_featured_idx" ON "products" USING btree ("featured");--> statement-breakpoint
CREATE INDEX "products_best_seller_idx" ON "products" USING btree ("best_seller");--> statement-breakpoint
CREATE INDEX "products_status_idx" ON "products" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");