import { pgTable, unique, uuid, varchar, jsonb, text, numeric, integer, timestamp, boolean, foreignKey, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const customerType = pgEnum("customer_type", ['retail', 'wholesale', 'vip'])
export const orderStatus = pgEnum("order_status", ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'])
export const paymentStatus = pgEnum("payment_status", ['pending', 'paid', 'failed', 'refunded'])
export const productStatus = pgEnum("product_status", ['active', 'inactive', 'draft', 'discontinued'])
export const userRole = pgEnum("user_role", ['super_admin', 'store_manager', 'staff', 'view_only'])


export const customers = pgTable("customers", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	email: varchar({ length: 255 }),
	phone: varchar({ length: 20 }),
	firstName: varchar("first_name", { length: 100 }),
	lastName: varchar("last_name", { length: 100 }),
	company: varchar({ length: 200 }),
	customerType: customerType("customer_type").default('retail'),
	defaultBillingAddress: jsonb("default_billing_address"),
	defaultShippingAddress: jsonb("default_shipping_address"),
	additionalAddresses: jsonb("additional_addresses").default([]),
	preferences: jsonb().default({}),
	notes: text(),
	tags: jsonb().default([]),
	totalSpent: numeric("total_spent", { precision: 10, scale:  2 }).default('0'),
	orderCount: integer("order_count").default(0),
	averageOrderValue: numeric("average_order_value", { precision: 10, scale:  2 }).default('0'),
	lastOrderAt: timestamp("last_order_at", { mode: 'string' }),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	unique("customers_email_unique").on(table.email),
]);

export const emailCampaigns = pgTable("email_campaigns", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	subject: varchar({ length: 255 }).notNull(),
	content: text().notNull(),
	htmlContent: text("html_content"),
	recipientCount: integer("recipient_count").default(0),
	sentCount: integer("sent_count").default(0),
	openCount: integer("open_count").default(0),
	clickCount: integer("click_count").default(0),
	status: varchar({ length: 50 }).default('draft'),
	scheduledAt: timestamp("scheduled_at", { mode: 'string' }),
	sentAt: timestamp("sent_at", { mode: 'string' }),
	createdBy: uuid("created_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "email_campaigns_created_by_users_id_fk"
		}),
]);

export const products = pgTable("products", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	slug: varchar({ length: 255 }).notNull(),
	description: text(),
	shortDescription: text("short_description"),
	sku: varchar({ length: 100 }),
	barcode: varchar({ length: 100 }),
	categoryId: uuid("category_id"),
	supplierId: uuid("supplier_id"),
	brand: varchar({ length: 100 }),
	costPrice: numeric("cost_price", { precision: 10, scale:  2 }),
	sellingPrice: numeric("selling_price", { precision: 10, scale:  2 }),
	msrp: numeric({ precision: 10, scale:  2 }),
	weight: numeric({ precision: 8, scale:  2 }),
	dimensions: jsonb(),
	images: jsonb().default([]),
	variants: jsonb().default([]),
	specifications: jsonb().default({}),
	metaTitle: varchar("meta_title", { length: 255 }),
	metaDescription: text("meta_description"),
	seoKeywords: jsonb("seo_keywords").default([]),
	status: productStatus().default('active'),
	isFeatured: boolean("is_featured").default(false),
	tags: jsonb().default([]),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [categories.id],
			name: "products_category_id_categories_id_fk"
		}),
	foreignKey({
			columns: [table.supplierId],
			foreignColumns: [suppliers.id],
			name: "products_supplier_id_suppliers_id_fk"
		}),
	unique("products_slug_unique").on(table.slug),
	unique("products_sku_unique").on(table.sku),
]);

export const inventory = pgTable("inventory", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	productId: uuid("product_id").notNull(),
	locationId: uuid("location_id").notNull(),
	quantityOnHand: integer("quantity_on_hand").default(0).notNull(),
	quantityReserved: integer("quantity_reserved").default(0).notNull(),
	reorderLevel: integer("reorder_level").default(10),
	reorderQuantity: integer("reorder_quantity").default(50),
	lastCountedAt: timestamp("last_counted_at", { mode: 'string' }),
	binLocation: varchar("bin_location", { length: 50 }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	foreignKey({
			columns: [table.locationId],
			foreignColumns: [locations.id],
			name: "inventory_location_id_locations_id_fk"
		}),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "inventory_product_id_products_id_fk"
		}),
]);

export const orders = pgTable("orders", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	orderNumber: varchar("order_number", { length: 100 }).notNull(),
	customerId: uuid("customer_id"),
	status: orderStatus().default('pending'),
	paymentStatus: paymentStatus("payment_status").default('pending'),
	fulfillmentStatus: varchar("fulfillment_status", { length: 50 }).default('unfulfilled'),
	subtotal: numeric({ precision: 10, scale:  2 }).notNull(),
	taxAmount: numeric("tax_amount", { precision: 10, scale:  2 }).default('0'),
	shippingAmount: numeric("shipping_amount", { precision: 10, scale:  2 }).default('0'),
	discountAmount: numeric("discount_amount", { precision: 10, scale:  2 }).default('0'),
	totalAmount: numeric("total_amount", { precision: 10, scale:  2 }).notNull(),
	currency: varchar({ length: 3 }).default('GHS'),
	billingAddress: jsonb("billing_address").notNull(),
	shippingAddress: jsonb("shipping_address").notNull(),
	paymentMethod: varchar("payment_method", { length: 50 }),
	paymentReference: varchar("payment_reference", { length: 100 }),
	notes: text(),
	internalNotes: text("internal_notes"),
	tags: jsonb().default([]),
	source: varchar({ length: 50 }).default('online'),
	assignedTo: uuid("assigned_to"),
	shippedAt: timestamp("shipped_at", { mode: 'string' }),
	deliveredAt: timestamp("delivered_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	foreignKey({
			columns: [table.assignedTo],
			foreignColumns: [users.id],
			name: "orders_assigned_to_users_id_fk"
		}),
	foreignKey({
			columns: [table.customerId],
			foreignColumns: [customers.id],
			name: "orders_customer_id_customers_id_fk"
		}),
	unique("orders_order_number_unique").on(table.orderNumber),
]);

export const orderStatusHistory = pgTable("order_status_history", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	orderId: uuid("order_id").notNull(),
	status: varchar({ length: 50 }).notNull(),
	comment: text(),
	changedBy: uuid("changed_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	foreignKey({
			columns: [table.changedBy],
			foreignColumns: [users.id],
			name: "order_status_history_changed_by_users_id_fk"
		}),
	foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "order_status_history_order_id_orders_id_fk"
		}),
]);

export const locations = pgTable("locations", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	code: varchar({ length: 50 }).notNull(),
	address: jsonb(),
	type: varchar({ length: 50 }).default('warehouse'),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	unique("locations_code_unique").on(table.code),
]);

export const categories = pgTable("categories", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	slug: varchar({ length: 255 }).notNull(),
	description: text(),
	parentId: uuid("parent_id"),
	image: text(),
	isActive: boolean("is_active").default(true),
	sortOrder: integer("sort_order").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	unique("categories_slug_unique").on(table.slug),
]);

export const orderItems = pgTable("order_items", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	orderId: uuid("order_id").notNull(),
	productId: uuid("product_id").notNull(),
	variantId: varchar("variant_id", { length: 100 }),
	quantity: integer().notNull(),
	unitPrice: numeric("unit_price", { precision: 10, scale:  2 }).notNull(),
	totalPrice: numeric("total_price", { precision: 10, scale:  2 }).notNull(),
	productName: varchar("product_name", { length: 255 }).notNull(),
	productSku: varchar("product_sku", { length: 100 }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "order_items_order_id_orders_id_fk"
		}),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "order_items_product_id_products_id_fk"
		}),
]);

export const purchaseOrders = pgTable("purchase_orders", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	poNumber: varchar("po_number", { length: 100 }).notNull(),
	supplierId: uuid("supplier_id").notNull(),
	status: varchar({ length: 50 }).default('draft'),
	subtotal: numeric({ precision: 10, scale:  2 }).notNull(),
	taxAmount: numeric("tax_amount", { precision: 10, scale:  2 }).default('0'),
	totalAmount: numeric("total_amount", { precision: 10, scale:  2 }).notNull(),
	expectedDeliveryDate: timestamp("expected_delivery_date", { mode: 'string' }),
	deliveredAt: timestamp("delivered_at", { mode: 'string' }),
	notes: text(),
	createdBy: uuid("created_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "purchase_orders_created_by_users_id_fk"
		}),
	foreignKey({
			columns: [table.supplierId],
			foreignColumns: [suppliers.id],
			name: "purchase_orders_supplier_id_suppliers_id_fk"
		}),
	unique("purchase_orders_po_number_unique").on(table.poNumber),
]);

export const suppliers = pgTable("suppliers", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }),
	phone: varchar({ length: 20 }),
	address: jsonb(),
	contactPerson: varchar("contact_person", { length: 255 }),
	paymentTerms: varchar("payment_terms", { length: 100 }),
	leadTimeDays: integer("lead_time_days"),
	isActive: boolean("is_active").default(true),
	rating: numeric({ precision: 3, scale:  2 }),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
});

export const customerInteractions = pgTable("customer_interactions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	customerId: uuid("customer_id").notNull(),
	type: varchar({ length: 50 }).notNull(),
	subject: varchar({ length: 255 }),
	content: text(),
	channel: varchar({ length: 50 }),
	staffMember: uuid("staff_member"),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	foreignKey({
			columns: [table.customerId],
			foreignColumns: [customers.id],
			name: "customer_interactions_customer_id_customers_id_fk"
		}),
	foreignKey({
			columns: [table.staffMember],
			foreignColumns: [users.id],
			name: "customer_interactions_staff_member_users_id_fk"
		}),
]);

export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	email: varchar({ length: 255 }).notNull(),
	password: text().notNull(),
	firstName: varchar("first_name", { length: 100 }),
	lastName: varchar("last_name", { length: 100 }),
	role: userRole().default('staff').notNull(),
	permissions: jsonb().default({}),
	isActive: boolean("is_active").default(true),
	lastLogin: timestamp("last_login", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	unique("users_email_unique").on(table.email),
]);
