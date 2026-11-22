CREATE TABLE "hero_slides" (
	"id" text PRIMARY KEY NOT NULL,
	"eyebrow" text,
	"title" text NOT NULL,
	"subtitle" text,
	"image" text NOT NULL,
	"mobile_image" text,
	"primary_cta_label" text,
	"primary_cta_href" text,
	"secondary_cta_label" text,
	"secondary_cta_href" text,
	"overlay_opacity" integer DEFAULT 35 NOT NULL,
	"text_position" text DEFAULT 'left' NOT NULL,
	"object_position" text DEFAULT 'center' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "homepage_sections" (
	"key" text PRIMARY KEY NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "journal_articles" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" varchar(255) NOT NULL,
	"category" text,
	"excerpt" text,
	"body" text,
	"image" text,
	"status" "product_status" DEFAULT 'DRAFT' NOT NULL,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "newsletter_subscribers" (
	"id" text PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "signature_picks" (
	"id" text PRIMARY KEY NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"product_id" text,
	"eyebrow" text DEFAULT 'KFLORÉ SIGNATURE' NOT NULL,
	"title" text,
	"description" text,
	"occasion" text,
	"palette" text,
	"featured_flowers" text,
	"image_override" text,
	"cta_text" text DEFAULT 'DISCOVER THE SIGNATURE' NOT NULL,
	"start_date" timestamp,
	"end_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" text PRIMARY KEY DEFAULT 'site' NOT NULL,
	"announcement_enabled" boolean DEFAULT true NOT NULL,
	"announcement_message" text DEFAULT 'Same-Day Delivery • Kuala Lumpur & Selangor' NOT NULL,
	"announcement_href" text,
	"announcement_bg" text DEFAULT '#5A1725' NOT NULL,
	"announcement_fg" text DEFAULT '#F5F0E8' NOT NULL,
	"footer_statement" text DEFAULT 'Thoughtfully arranged flowers for life''s meaningful moments.' NOT NULL,
	"footer_cta_label" text DEFAULT 'TALK TO US' NOT NULL,
	"newsletter_heading" text DEFAULT 'Stay in Bloom' NOT NULL,
	"newsletter_text" text DEFAULT 'Receive new collection launches, seasonal flowers and special moments from KFLORÉ.' NOT NULL,
	"featured_heading" text DEFAULT 'Elegance in Bloom' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "collections" ADD COLUMN "hero_image" text;--> statement-breakpoint
ALTER TABLE "collections" ADD COLUMN "tagline" text;--> statement-breakpoint
ALTER TABLE "collections" ADD COLUMN "type" text DEFAULT 'OCCASION' NOT NULL;--> statement-breakpoint
ALTER TABLE "collections" ADD COLUMN "featured" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "collections" ADD COLUMN "homepage_position" integer;--> statement-breakpoint
ALTER TABLE "media" ADD COLUMN "thumbnail_url" text;--> statement-breakpoint
ALTER TABLE "signature_picks" ADD CONSTRAINT "signature_picks_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "hero_slides_active_sort_idx" ON "hero_slides" USING btree ("active","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "journal_articles_slug_idx" ON "journal_articles" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "journal_articles_status_idx" ON "journal_articles" USING btree ("status","published_at");--> statement-breakpoint
CREATE UNIQUE INDEX "newsletter_subscribers_email_idx" ON "newsletter_subscribers" USING btree ("email");--> statement-breakpoint
CREATE INDEX "signature_picks_enabled_idx" ON "signature_picks" USING btree ("enabled","start_date");--> statement-breakpoint
CREATE INDEX "collections_type_idx" ON "collections" USING btree ("type");--> statement-breakpoint
CREATE INDEX "collections_featured_idx" ON "collections" USING btree ("featured");--> statement-breakpoint
CREATE INDEX "products_created_idx" ON "products" USING btree ("created_at");