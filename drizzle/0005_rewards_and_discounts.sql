CREATE TABLE "reward_ledger" (
	"id" text PRIMARY KEY NOT NULL,
	"member_id" text NOT NULL,
	"points" integer NOT NULL,
	"reason" text NOT NULL,
	"order_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reward_members" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"points" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "delivery_settings" ALTER COLUMN "areas" SET DEFAULT 'Kuala Lumpur & Klang Valley';--> statement-breakpoint
ALTER TABLE "site_settings" ALTER COLUMN "announcement_message" SET DEFAULT 'Same-Day Delivery • Kuala Lumpur & Klang Valley';--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "discount_code" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "discount_amount" numeric(10, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "reward_ledger" ADD CONSTRAINT "reward_ledger_member_id_reward_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."reward_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reward_ledger" ADD CONSTRAINT "reward_ledger_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "reward_ledger_member_idx" ON "reward_ledger" USING btree ("member_id");--> statement-breakpoint
CREATE UNIQUE INDEX "reward_ledger_order_reason_idx" ON "reward_ledger" USING btree ("order_id","reason");--> statement-breakpoint
CREATE UNIQUE INDEX "reward_members_email_idx" ON "reward_members" USING btree ("email");