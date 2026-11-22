CREATE TYPE "public"."payment_status" AS ENUM('PENDING', 'PAID', 'FAILED', 'CANCELLED');--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "delivery_address" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "payment_provider" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "payment_status" "payment_status" DEFAULT 'PENDING' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "provider_bill_id" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "provider_url" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "paid_at" timestamp;--> statement-breakpoint
CREATE INDEX "orders_payment_status_idx" ON "orders" USING btree ("payment_status");--> statement-breakpoint
CREATE UNIQUE INDEX "orders_provider_bill_idx" ON "orders" USING btree ("provider_bill_id");