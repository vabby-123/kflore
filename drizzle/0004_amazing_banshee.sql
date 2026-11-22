ALTER TABLE "orders" ADD COLUMN "delivery_date" timestamp;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "delivery_time_slot" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "card_message" text;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "payment_tng_qr_image" text;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "payment_duitnow_qr_image" text;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "payment_maybank_qr_image" text;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "payment_bank_details" text;