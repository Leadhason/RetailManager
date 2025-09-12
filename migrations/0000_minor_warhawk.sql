-- Current sql file was generated after introspecting the database
-- Migration uncommented and ready to execute
CREATE TYPE "public"."customer_type" AS ENUM('retail', 'wholesale', 'vip');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'paid', 'failed', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."product_status" AS ENUM('active', 'inactive', 'draft', 'discontinued');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('super_admin', 'store_manager', 'staff', 'view_only');--> statement-breakpoint
CREATE TABLE "customers" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "email" varchar(255),
        "phone" varchar(20),
        "first_name" varchar(100),
        "last_name" varchar(100),
        "company" varchar(200),
        "customer_type" "customer_type" DEFAULT 'retail',
        "default_billing_address" jsonb,
        "default_shipping_address" jsonb,
        "additional_addresses" jsonb DEFAULT '[]'::jsonb,
        "preferences" jsonb DEFAULT '{}'::jsonb,
        "notes" text,
        "tags" jsonb DEFAULT '[]'::jsonb,
        "total_spent" numeric(10, 2) DEFAULT '0',
        "order_count" integer DEFAULT 0,
        "average_order_value" numeric(10, 2) DEFAULT '0',
        "last_order_at" timestamp,
        "is_active" boolean DEFAULT true,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "customers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "email_campaigns" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "name" varchar(255) NOT NULL,
        "subject" varchar(255) NOT NULL,
        "content" text NOT NULL,
        "html_content" text,
        "recipient_count" integer DEFAULT 0,
        "sent_count" integer DEFAULT 0,
        "open_count" integer DEFAULT 0,
        "click_count" integer DEFAULT 0,
        "status" varchar(50) DEFAULT 'draft',
        "scheduled_at" timestamp,
        "sent_at" timestamp,
        "created_by" uuid,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "products" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "name" varchar(255) NOT NULL,
        "slug" varchar(255) NOT NULL,
        "description" text,
        "short_description" text,
        "sku" varchar(100),
        "barcode" varchar(100),
        "category_id" uuid,
        "supplier_id" uuid,
        "brand" varchar(100),
        "cost_price" numeric(10, 2),
        "selling_price" numeric(10, 2),
        "msrp" numeric(10, 2),
        "weight" numeric(8, 2),
        "dimensions" jsonb,
        "images" jsonb DEFAULT '[]'::jsonb,
        "variants" jsonb DEFAULT '[]'::jsonb,
        "specifications" jsonb DEFAULT '{}'::jsonb,
        "meta_title" varchar(255),
        "meta_description" text,
        "seo_keywords" jsonb DEFAULT '[]'::jsonb,
        "status" "product_status" DEFAULT 'active',
        "is_featured" boolean DEFAULT false,
        "tags" jsonb DEFAULT '[]'::jsonb,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "products_slug_unique" UNIQUE("slug"),
        CONSTRAINT "products_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE "inventory" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "product_id" uuid NOT NULL,
        "location_id" uuid NOT NULL,
        "quantity_on_hand" integer DEFAULT 0 NOT NULL,
        "quantity_reserved" integer DEFAULT 0 NOT NULL,
        "reorder_level" integer DEFAULT 10,
        "reorder_quantity" integer DEFAULT 50,
        "last_counted_at" timestamp,
        "bin_location" varchar(50),
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "orders" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "order_number" varchar(100) NOT NULL,
        "customer_id" uuid,
        "status" "order_status" DEFAULT 'pending',
        "payment_status" "payment_status" DEFAULT 'pending',
        "fulfillment_status" varchar(50) DEFAULT 'unfulfilled',
        "subtotal" numeric(10, 2) NOT NULL,
        "tax_amount" numeric(10, 2) DEFAULT '0',
        "shipping_amount" numeric(10, 2) DEFAULT '0',
        "discount_amount" numeric(10, 2) DEFAULT '0',
        "total_amount" numeric(10, 2) NOT NULL,
        "currency" varchar(3) DEFAULT 'GHS',
        "billing_address" jsonb NOT NULL,
        "shipping_address" jsonb NOT NULL,
        "payment_method" varchar(50),
        "payment_reference" varchar(100),
        "notes" text,
        "internal_notes" text,
        "tags" jsonb DEFAULT '[]'::jsonb,
        "source" varchar(50) DEFAULT 'online',
        "assigned_to" uuid,
        "shipped_at" timestamp,
        "delivered_at" timestamp,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "orders_order_number_unique" UNIQUE("order_number")
);
--> statement-breakpoint
CREATE TABLE "order_status_history" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "order_id" uuid NOT NULL,
        "status" varchar(50) NOT NULL,
        "comment" text,
        "changed_by" uuid,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "locations" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "name" varchar(255) NOT NULL,
        "code" varchar(50) NOT NULL,
        "address" jsonb,
        "type" varchar(50) DEFAULT 'warehouse',
        "is_active" boolean DEFAULT true,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "locations_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "categories" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "name" varchar(255) NOT NULL,
        "slug" varchar(255) NOT NULL,
        "description" text,
        "parent_id" uuid,
        "image" text,
        "is_active" boolean DEFAULT true,
        "sort_order" integer DEFAULT 0,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "order_items" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "order_id" uuid NOT NULL,
        "product_id" uuid NOT NULL,
        "variant_id" varchar(100),
        "quantity" integer NOT NULL,
        "unit_price" numeric(10, 2) NOT NULL,
        "total_price" numeric(10, 2) NOT NULL,
        "product_name" varchar(255) NOT NULL,
        "product_sku" varchar(100),
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "purchase_orders" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "po_number" varchar(100) NOT NULL,
        "supplier_id" uuid NOT NULL,
        "status" varchar(50) DEFAULT 'draft',
        "subtotal" numeric(10, 2) NOT NULL,
        "tax_amount" numeric(10, 2) DEFAULT '0',
        "total_amount" numeric(10, 2) NOT NULL,
        "expected_delivery_date" timestamp,
        "delivered_at" timestamp,
        "notes" text,
        "created_by" uuid,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "purchase_orders_po_number_unique" UNIQUE("po_number")
);
--> statement-breakpoint
CREATE TABLE "suppliers" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "name" varchar(255) NOT NULL,
        "email" varchar(255),
        "phone" varchar(20),
        "address" jsonb,
        "contact_person" varchar(255),
        "payment_terms" varchar(100),
        "lead_time_days" integer,
        "is_active" boolean DEFAULT true,
        "rating" numeric(3, 2),
        "notes" text,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "customer_interactions" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "customer_id" uuid NOT NULL,
        "type" varchar(50) NOT NULL,
        "subject" varchar(255),
        "content" text,
        "channel" varchar(50),
        "staff_member" uuid,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "users" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "email" varchar(255) NOT NULL,
        "password" text NOT NULL,
        "first_name" varchar(100),
        "last_name" varchar(100),
        "role" "user_role" DEFAULT 'staff' NOT NULL,
        "permissions" jsonb DEFAULT '{}'::jsonb,
        "is_active" boolean DEFAULT true,
        "last_login" timestamp,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "email_campaigns" ADD CONSTRAINT "email_campaigns_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_changed_by_users_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_interactions" ADD CONSTRAINT "customer_interactions_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_interactions" ADD CONSTRAINT "customer_interactions_staff_member_users_id_fk" FOREIGN KEY ("staff_member") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;