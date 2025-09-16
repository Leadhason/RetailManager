import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, integer, timestamp, boolean, jsonb, uuid, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum("user_role", ["super_admin", "store_manager", "staff", "view_only"]);
export const orderStatusEnum = pgEnum("order_status", ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"]);
export const paymentStatusEnum = pgEnum("payment_status", ["pending", "paid", "failed", "refunded"]);
export const productStatusEnum = pgEnum("product_status", ["active", "inactive", "draft", "discontinued"]);
export const customerTypeEnum = pgEnum("customer_type", ["retail", "wholesale", "vip"]);
export const transactionTypeEnum = pgEnum("transaction_type", ["payment", "refund", "fee", "adjustment"]);
export const transactionStatusEnum = pgEnum("transaction_status", ["pending", "processing", "completed", "failed", "cancelled"]);
export const receiptStatusEnum = pgEnum("receipt_status", ["generated", "sent", "viewed"]);
export const taxTypeEnum = pgEnum("tax_type", ["VAT", "Income Tax", "PAYE", "NHIL", "GETFUND"]);

// Users table for admin authentication
export const users = pgTable("users", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  role: userRoleEnum("role").notNull().default("staff"),
  permissions: jsonb("permissions").default({}),
  isActive: boolean("is_active").default(true),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

// Categories
export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  parentId: uuid("parent_id"),
  image: text("image"),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

// Suppliers
export const suppliers = pgTable("suppliers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  address: jsonb("address"),
  contactPerson: varchar("contact_person", { length: 255 }),
  paymentTerms: varchar("payment_terms", { length: 100 }),
  leadTime: integer("lead_time_days"),
  isActive: boolean("is_active").default(true),
  rating: decimal("rating", { precision: 3, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

// Products
export const products = pgTable("products", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  shortDescription: text("short_description"),
  sku: varchar("sku", { length: 100 }).unique(),
  barcode: varchar("barcode", { length: 100 }),
  categoryId: uuid("category_id").references(() => categories.id),
  supplierId: uuid("supplier_id").references(() => suppliers.id),
  brand: varchar("brand", { length: 100 }),
  costPrice: decimal("cost_price", { precision: 10, scale: 2 }),
  sellingPrice: decimal("selling_price", { precision: 10, scale: 2 }),
  msrp: decimal("msrp", { precision: 10, scale: 2 }),
  weight: decimal("weight", { precision: 8, scale: 2 }),
  dimensions: jsonb("dimensions"),
  images: jsonb("images").default([]),
  variants: jsonb("variants").default([]),
  specifications: jsonb("specifications").default({}),
  metaTitle: varchar("meta_title", { length: 255 }),
  metaDescription: text("meta_description"),
  seoKeywords: jsonb("seo_keywords").default([]),
  status: productStatusEnum("status").default("active"),
  isFeatured: boolean("is_featured").default(false),
  tags: jsonb("tags").default([]),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

// Inventory locations
export const locations = pgTable("locations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  address: jsonb("address"),
  type: varchar("type", { length: 50 }).default("warehouse"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`)
});

// Inventory
export const inventory = pgTable("inventory", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: uuid("product_id").references(() => products.id).notNull(),
  locationId: uuid("location_id").references(() => locations.id).notNull(),
  quantityOnHand: integer("quantity_on_hand").notNull().default(0),
  quantityReserved: integer("quantity_reserved").notNull().default(0),
  reorderLevel: integer("reorder_level").default(10),
  reorderQuantity: integer("reorder_quantity").default(50),
  lastCountedAt: timestamp("last_counted_at"),
  binLocation: varchar("bin_location", { length: 50 }),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

// Customers
export const customers = pgTable("customers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email", { length: 255 }).unique(),
  phone: varchar("phone", { length: 20 }),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  company: varchar("company", { length: 200 }),
  customerType: customerTypeEnum("customer_type").default("retail"),
  defaultBillingAddress: jsonb("default_billing_address"),
  defaultShippingAddress: jsonb("default_shipping_address"),
  additionalAddresses: jsonb("additional_addresses").default([]),
  preferences: jsonb("preferences").default({}),
  notes: text("notes"),
  tags: jsonb("tags").default([]),
  totalSpent: decimal("total_spent", { precision: 10, scale: 2 }).default("0"),
  orderCount: integer("order_count").default(0),
  averageOrderValue: decimal("average_order_value", { precision: 10, scale: 2 }).default("0"),
  lastOrderAt: timestamp("last_order_at"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

// Orders
export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  orderNumber: varchar("order_number", { length: 100 }).unique().notNull(),
  customerId: uuid("customer_id").references(() => customers.id),
  status: orderStatusEnum("status").default("pending"),
  paymentStatus: paymentStatusEnum("payment_status").default("pending"),
  fulfillmentStatus: varchar("fulfillment_status", { length: 50 }).default("unfulfilled"),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).default("0"),
  shippingAmount: decimal("shipping_amount", { precision: 10, scale: 2 }).default("0"),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default("0"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("GHS"),
  billingAddress: jsonb("billing_address").notNull(),
  shippingAddress: jsonb("shipping_address").notNull(),
  paymentMethod: varchar("payment_method", { length: 50 }),
  paymentReference: varchar("payment_reference", { length: 100 }),
  notes: text("notes"),
  internalNotes: text("internal_notes"),
  tags: jsonb("tags").default([]),
  source: varchar("source", { length: 50 }).default("online"),
  assignedTo: uuid("assigned_to").references(() => users.id),
  shippedAt: timestamp("shipped_at"),
  deliveredAt: timestamp("delivered_at"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

// Order items
export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: uuid("order_id").references(() => orders.id).notNull(),
  productId: uuid("product_id").references(() => products.id).notNull(),
  variantId: varchar("variant_id", { length: 100 }),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  productName: varchar("product_name", { length: 255 }).notNull(),
  productSku: varchar("product_sku", { length: 100 }),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`)
});

// Order status history
export const orderStatusHistory = pgTable("order_status_history", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: uuid("order_id").references(() => orders.id).notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  comment: text("comment"),
  changedBy: uuid("changed_by").references(() => users.id),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`)
});

// Customer interactions
export const customerInteractions = pgTable("customer_interactions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: uuid("customer_id").references(() => customers.id).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  subject: varchar("subject", { length: 255 }),
  content: text("content"),
  channel: varchar("channel", { length: 50 }),
  staffMember: uuid("staff_member").references(() => users.id),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`)
});

// Email campaigns
export const emailCampaigns = pgTable("email_campaigns", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  content: text("content").notNull(),
  htmlContent: text("html_content"),
  recipientCount: integer("recipient_count").default(0),
  sentCount: integer("sent_count").default(0),
  openCount: integer("open_count").default(0),
  clickCount: integer("click_count").default(0),
  status: varchar("status", { length: 50 }).default("draft"),
  scheduledAt: timestamp("scheduled_at"),
  sentAt: timestamp("sent_at"),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

// Purchase orders
export const purchaseOrders = pgTable("purchase_orders", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  poNumber: varchar("po_number", { length: 100 }).unique().notNull(),
  supplierId: uuid("supplier_id").references(() => suppliers.id).notNull(),
  status: varchar("status", { length: 50 }).default("draft"),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).default("0"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  expectedDeliveryDate: timestamp("expected_delivery_date"),
  deliveredAt: timestamp("delivered_at"),
  notes: text("notes"),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

// Inventory movements/stock adjustments for audit trail
export const inventoryMovements = pgTable("inventory_movements", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: uuid("product_id").references(() => products.id).notNull(),
  locationId: uuid("location_id").references(() => locations.id).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'adjustment', 'sale', 'purchase', 'transfer', 'count'
  quantity: integer("quantity").notNull(), // positive for increase, negative for decrease
  previousQuantity: integer("previous_quantity").notNull(),
  newQuantity: integer("new_quantity").notNull(),
  reason: varchar("reason", { length: 100 }),
  reference: varchar("reference", { length: 100 }), // order ID, PO ID, transfer ID, etc.
  notes: text("notes"),
  performedBy: uuid("performed_by").references(() => users.id),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`)
}, (table) => ({
  // Performance indexes
  productLocationIdx: sql`CREATE INDEX IF NOT EXISTS idx_inventory_movements_product_location ON inventory_movements (product_id, location_id)`,
  createdAtIdx: sql`CREATE INDEX IF NOT EXISTS idx_inventory_movements_created_at ON inventory_movements (created_at DESC)`,
  typeIdx: sql`CREATE INDEX IF NOT EXISTS idx_inventory_movements_type ON inventory_movements (type)`
}));

// Advanced reorder rules for complex reordering logic
export const reorderRules = pgTable("reorder_rules", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: uuid("product_id").references(() => products.id).notNull(),
  locationId: uuid("location_id").references(() => locations.id),
  minLevel: integer("min_level").notNull(),
  maxLevel: integer("max_level").notNull(),
  reorderQuantity: integer("reorder_quantity").notNull(),
  leadTimeDays: integer("lead_time_days").default(7),
  seasonalMultiplier: decimal("seasonal_multiplier", { precision: 3, scale: 2 }).default("1.0"),
  isActive: boolean("is_active").default(true),
  priority: integer("priority").default(1), // 1=low, 2=medium, 3=high
  supplierId: uuid("supplier_id").references(() => suppliers.id),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
}, (table) => ({
  // Performance indexes  
  productLocationActiveIdx: sql`CREATE INDEX IF NOT EXISTS idx_reorder_rules_product_location_active ON reorder_rules (product_id, location_id, is_active)`,
  isActiveIdx: sql`CREATE INDEX IF NOT EXISTS idx_reorder_rules_active ON reorder_rules (is_active) WHERE is_active = true`,
  // Unique constraints: one global rule per product, one location-specific rule per product+location
  globalRuleUnique: sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_reorder_rules_global ON reorder_rules (product_id) WHERE location_id IS NULL`,
  locationRuleUnique: sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_reorder_rules_location ON reorder_rules (product_id, location_id) WHERE location_id IS NOT NULL`
}));

// Payment Transactions
export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: uuid("order_id").references(() => orders.id),
  customerId: uuid("customer_id").references(() => customers.id),
  type: transactionTypeEnum("type").notNull(),
  status: transactionStatusEnum("status").default("pending"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("GHS"),
  paymentMethod: varchar("payment_method", { length: 50 }).notNull(),
  paymentProvider: varchar("payment_provider", { length: 50 }),
  reference: varchar("reference", { length: 100 }).unique().notNull(),
  externalReference: varchar("external_reference", { length: 100 }),
  gatewayResponse: jsonb("gateway_response"),
  fees: decimal("fees", { precision: 10, scale: 2 }).default("0"),
  netAmount: decimal("net_amount", { precision: 10, scale: 2 }),
  notes: text("notes"),
  failureReason: text("failure_reason"),
  refundedAmount: decimal("refunded_amount", { precision: 10, scale: 2 }).default("0"),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

// Payment Receipts
export const receipts = pgTable("receipts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  transactionId: uuid("transaction_id").references(() => transactions.id).notNull(),
  orderId: uuid("order_id").references(() => orders.id).notNull(),
  customerId: uuid("customer_id").references(() => customers.id).notNull(),
  receiptNumber: varchar("receipt_number", { length: 100 }).unique().notNull(),
  status: receiptStatusEnum("status").default("generated"),
  receiptData: jsonb("receipt_data").notNull(), // Contains full receipt details
  pdfPath: text("pdf_path"),
  emailSentAt: timestamp("email_sent_at"),
  viewedAt: timestamp("viewed_at"),
  printedAt: timestamp("printed_at"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`)
});

// Tax Records
export const taxRecords = pgTable("tax_records", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  period: varchar("period", { length: 50 }).notNull(), // e.g., "2024-01", "Q1-2024"
  taxType: taxTypeEnum("tax_type").notNull(),
  status: varchar("status", { length: 20 }).default("pending"), // pending, filed, paid, overdue
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paidAmount: decimal("paid_amount", { precision: 10, scale: 2 }).default("0"),
  dueDate: timestamp("due_date").notNull(),
  filedDate: timestamp("filed_date"),
  paidDate: timestamp("paid_date"),
  taxCalculation: jsonb("tax_calculation"), // Detailed breakdown
  filingReference: varchar("filing_reference", { length: 100 }),
  notes: text("notes"),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true, lastLogin: true });
export const insertCategorySchema = createInsertSchema(categories).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSupplierSchema = createInsertSchema(suppliers).omit({ id: true, createdAt: true, updatedAt: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true, updatedAt: true });
export const insertLocationSchema = createInsertSchema(locations).omit({ id: true, createdAt: true });
export const insertInventorySchema = createInsertSchema(inventory).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCustomerSchema = createInsertSchema(customers).omit({ id: true, createdAt: true, updatedAt: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true, updatedAt: true });
export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ id: true, createdAt: true });
export const insertEmailCampaignSchema = createInsertSchema(emailCampaigns).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPurchaseOrderSchema = createInsertSchema(purchaseOrders).omit({ id: true, createdAt: true, updatedAt: true });
export const insertInventoryMovementSchema = createInsertSchema(inventoryMovements).omit({ id: true, createdAt: true });
export const insertReorderRuleSchema = createInsertSchema(reorderRules).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, createdAt: true, updatedAt: true });
export const insertReceiptSchema = createInsertSchema(receipts).omit({ id: true, createdAt: true });
export const insertTaxRecordSchema = createInsertSchema(taxRecords).omit({ id: true, createdAt: true, updatedAt: true });

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type Supplier = typeof suppliers.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;
export type InsertLocation = z.infer<typeof insertLocationSchema>;
export type Location = typeof locations.$inferSelect;
export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type Inventory = typeof inventory.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customers.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertEmailCampaign = z.infer<typeof insertEmailCampaignSchema>;
export type EmailCampaign = typeof emailCampaigns.$inferSelect;
export type InsertPurchaseOrder = z.infer<typeof insertPurchaseOrderSchema>;
export type PurchaseOrder = typeof purchaseOrders.$inferSelect;
export type InsertInventoryMovement = z.infer<typeof insertInventoryMovementSchema>;
export type InventoryMovement = typeof inventoryMovements.$inferSelect;
export type InsertReorderRule = z.infer<typeof insertReorderRuleSchema>;
export type ReorderRule = typeof reorderRules.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertReceipt = z.infer<typeof insertReceiptSchema>;
export type Receipt = typeof receipts.$inferSelect;
export type InsertTaxRecord = z.infer<typeof insertTaxRecordSchema>;
export type TaxRecord = typeof taxRecords.$inferSelect;

// Dashboard metrics type
export interface DashboardMetrics {
  totalRevenue: number;
  totalOrders: number;
  activeCustomers: number;
  lowStockItems: number;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    customerName: string;
    totalAmount: number;
    status: string;
    createdAt: string;
  }>;
  topProducts: Array<{
    id: string;
    name: string;
    category: string;
    sales: number;
    units: number;
  }>;
  salesData: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
}
