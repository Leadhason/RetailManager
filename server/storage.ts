import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, desc, asc, and, or, gte, lte, count, sum, sql } from "drizzle-orm";
import bcrypt from "bcrypt";
import {
  type User, type InsertUser,
  type Product, type InsertProduct,
  type Category, type InsertCategory,
  type Customer, type InsertCustomer,
  type Order, type InsertOrder,
  type OrderItem, type InsertOrderItem,
  type Supplier, type InsertSupplier,
  type Inventory, type InsertInventory,
  type Location, type InsertLocation,
  type EmailCampaign, type InsertEmailCampaign,
  type PurchaseOrder, type InsertPurchaseOrder,
  type InventoryMovement, type InsertInventoryMovement,
  type ReorderRule, type InsertReorderRule,
  type Transaction, type InsertTransaction,
  type Receipt, type InsertReceipt,
  type TaxRecord, type InsertTaxRecord,
  type DashboardMetrics,
  users, products, categories, customers, orders, orderItems,
  suppliers, inventory, locations, emailCampaigns, purchaseOrders,
  inventoryMovements, reorderRules, orderStatusHistory, customerInteractions,
  transactions, receipts, taxRecords
} from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable must be set");
}

const sql_client = neon(process.env.DATABASE_URL);
const db = drizzle(sql_client);

// UUID normalization helper for fixing byte array serialization issue
function uuidBytesToString(v: unknown): string {
  if (typeof v === 'string') {
    // If it's already a string, check if it's comma-separated bytes
    if (v.includes(',')) {
      // Convert comma-separated bytes to UUID string
      const bytes = v.split(',').map(x => parseInt(x.trim()));
      if (bytes.length === 16) {
        const hex = bytes.map(x => x.toString(16).padStart(2, '0')).join('');
        return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
      }
    }
    return v; // Return as-is if already proper UUID format
  }
  
  // Handle Uint8Array or regular arrays
  const b = v instanceof Uint8Array ? Array.from(v) : Array.isArray(v) ? v : null;
  if (!b || b.length !== 16) {
    throw new Error(`Invalid UUID format: ${JSON.stringify(v)}`);
  }
  
  const hex = b.map(x => x.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}

export interface IStorage {
  // User management
  getUsers(): Promise<User[]>;
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  verifyPassword(email: string, password: string): Promise<User | null>;

  // Product management
  getProducts(limit?: number, offset?: number): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  getProductBySku(sku: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
  searchProducts(query: string): Promise<Product[]>;
  getProductsByCategory(categoryId: string, limit?: number, offset?: number): Promise<Product[]>;

  // Category management
  getCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, updates: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<boolean>;

  // Customer management
  getCustomers(limit?: number, offset?: number): Promise<Customer[]>;
  getCustomer(id: string): Promise<Customer | undefined>;
  getCustomerByEmail(email: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, updates: Partial<InsertCustomer>): Promise<Customer | undefined>;
  deleteCustomer(id: string): Promise<boolean>;

  // Order management
  getOrders(limit?: number, offset?: number): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  getOrdersByCustomer(customerId: string): Promise<Order[]>;
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  updateOrder(id: string, updates: Partial<InsertOrder>): Promise<Order | undefined>;
  updateOrderStatus(id: string, status: string, comment?: string, changedBy?: string): Promise<boolean>;
  getOrderItems(orderId: string): Promise<OrderItem[]>;

  // Supplier management
  getSuppliers(): Promise<Supplier[]>;
  getSupplier(id: string): Promise<Supplier | undefined>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: string, updates: Partial<InsertSupplier>): Promise<Supplier | undefined>;
  deleteSupplier(id: string): Promise<boolean>;

  // Inventory management
  getInventory(locationId?: string): Promise<Inventory[]>;
  getProductInventory(productId: string): Promise<Inventory[]>;
  updateInventory(productId: string, locationId: string, updates: Partial<InsertInventory>): Promise<Inventory | undefined>;
  getLowStockItems(threshold?: number): Promise<Inventory[]>;

  // Inventory movements for audit trail
  getInventoryMovements(productId?: string, locationId?: string, limit?: number): Promise<InventoryMovement[]>;
  createInventoryMovement(movement: InsertInventoryMovement): Promise<InventoryMovement>;
  adjustStock(productId: string, locationId: string, quantity: number, reason: string, userId?: string): Promise<boolean>;

  // Reorder rules management
  getReorderRules(productId?: string, locationId?: string): Promise<ReorderRule[]>;
  createReorderRule(rule: InsertReorderRule): Promise<ReorderRule>;
  updateReorderRule(id: string, updates: Partial<InsertReorderRule>): Promise<ReorderRule | undefined>;
  deleteReorderRule(id: string): Promise<boolean>;

  // Advanced inventory features
  getReorderSuggestions(): Promise<Array<{
    productId: string;
    productName: string;
    sku: string;
    currentStock: number;
    suggestedQuantity: number;
    priority: 'low' | 'medium' | 'high';
    reason: string;
    supplierId?: string;
    supplierName?: string;
  }>>;
  
  // Bulk operations
  bulkImportProducts(products: InsertProduct[]): Promise<{ success: number; errors: Array<{ row: number; error: string }> }>;
  bulkImportInventory(inventoryItems: Array<{ sku: string; locationCode: string; quantity: number; }>): Promise<{ success: number; errors: Array<{ row: number; error: string }> }>;
  exportInventoryData(locationId?: string): Promise<Array<{
    sku: string;
    productName: string;
    categoryName: string;
    locationName: string;
    quantityOnHand: number;
    quantityReserved: number;
    reorderLevel: number;
    costPrice: number;
    sellingPrice: number;
  }>>;

  // Location management
  getLocations(): Promise<Location[]>;
  createLocation(location: InsertLocation): Promise<Location>;

  // Email campaigns
  getEmailCampaigns(): Promise<EmailCampaign[]>;
  createEmailCampaign(campaign: InsertEmailCampaign): Promise<EmailCampaign>;
  updateEmailCampaign(id: string, updates: Partial<InsertEmailCampaign>): Promise<EmailCampaign | undefined>;

  // Financial management - Transactions
  getTransactions(limit?: number, offset?: number, filters?: {
    startDate?: Date;
    endDate?: Date;
    status?: string;
    paymentMethod?: string;
    customerId?: string;
    orderId?: string;
  }): Promise<Transaction[]>;
  getTransaction(id: string): Promise<Transaction | undefined>;
  getTransactionsByOrder(orderId: string): Promise<Transaction[]>;
  getTransactionsByCustomer(customerId: string): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: string, updates: Partial<InsertTransaction>): Promise<Transaction | undefined>;
  updateTransactionStatus(id: string, status: string, failureReason?: string): Promise<boolean>;

  // Financial management - Receipts
  getReceipts(limit?: number, offset?: number, filters?: {
    startDate?: Date;
    endDate?: Date;
    status?: string;
    customerId?: string;
    orderId?: string;
  }): Promise<Receipt[]>;
  getReceipt(id: string): Promise<Receipt | undefined>;
  getReceiptByTransaction(transactionId: string): Promise<Receipt | undefined>;
  getReceiptsByCustomer(customerId: string): Promise<Receipt[]>;
  createReceipt(receipt: InsertReceipt): Promise<Receipt>;
  updateReceipt(id: string, updates: Partial<InsertReceipt>): Promise<Receipt | undefined>;
  markReceiptViewed(id: string): Promise<boolean>;

  // Financial management - Tax Records
  getTaxRecords(period?: string, taxType?: string): Promise<TaxRecord[]>;
  getTaxRecord(id: string): Promise<TaxRecord | undefined>;
  createTaxRecord(taxRecord: InsertTaxRecord): Promise<TaxRecord>;
  updateTaxRecord(id: string, updates: Partial<InsertTaxRecord>): Promise<TaxRecord | undefined>;
  deleteTaxRecord(id: string): Promise<boolean>;

  // Financial analytics
  getPaymentSummary(startDate?: Date, endDate?: Date): Promise<{
    totalRevenue: number;
    totalTransactions: number;
    successfulPayments: number;
    failedPayments: number;
    totalFees: number;
    netRevenue: number;
    averageOrderValue: number;
    paymentMethodBreakdown: Array<{
      method: string;
      count: number;
      amount: number;
    }>;
  }>;

  // Dashboard metrics
  getDashboardMetrics(): Promise<DashboardMetrics>;
}

export class DatabaseStorage implements IStorage {
  // User management
  async getUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    
    if (!result || result.length === 0) {
      return undefined;
    }
    
    const user = result[0];
    // Normalize UUID format
    return {
      ...user,
      id: uuidBytesToString(user.id)
    };
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      // Normalize email for consistent lookup
      const normalizedEmail = email.toLowerCase().trim();
      const result = await db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1);
      
      if (!result || result.length === 0) {
        return undefined;
      }
      
      const user = result[0];
      // Normalize UUID format
      return {
        ...user,
        id: uuidBytesToString(user.id)
      };
    } catch (error: any) {
      // Handle Neon null-row mapping error
      if (error.message?.includes('Cannot read properties of null')) {
        return undefined;
      }
      throw error;
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const normalizedEmail = user.email.toLowerCase().trim();
    
    // WORKAROUND: Use raw SQL to bypass Drizzle ORM isActive=true bug
    const rawInsertResult = await db.execute(sql`
      INSERT INTO users (email, password, first_name, last_name, role, is_active)
      VALUES (${normalizedEmail}, ${hashedPassword}, ${user.firstName || ''}, ${user.lastName || ''}, ${user.role || 'staff'}, true)
      RETURNING id, email, first_name, last_name, role, is_active, created_at, updated_at
    `);
    
    if (!rawInsertResult.rows || rawInsertResult.rows.length === 0) {
      throw new Error('Failed to create user - no rows returned');
    }
    
    const rawUser = rawInsertResult.rows[0] as any;
    console.log(`[Auth] Raw insert successful: isActive=${rawUser.is_active}`);
    
    return {
      id: uuidBytesToString(rawUser.id),
      email: rawUser.email as string,
      password: hashedPassword,
      firstName: rawUser.first_name as string, 
      lastName: rawUser.last_name as string,
      role: rawUser.role as "super_admin" | "store_manager" | "staff" | "view_only",
      isActive: rawUser.is_active as boolean,
      permissions: {},
      lastLogin: null,
      createdAt: rawUser.created_at as Date,
      updatedAt: rawUser.updated_at as Date
    };
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }
    const result = await db.update(users)
      .set({ ...updates, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(users.id, id))
      .returning();
    
    if (!result || result.length === 0) {
      return undefined;
    }
    
    return result[0];
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return result.rowCount > 0;
  }

  async verifyPassword(email: string, password: string): Promise<User | null> {
    console.log(`[Auth] Verifying password for email: ${email}`);
    console.log(`[Auth] Received password: "${password}" (length: ${password.length})`);
    const user = await this.getUserByEmail(email);
    if (!user) {
      console.log(`[Auth] User not found for email: ${email}`);
      return null;
    }
    
    console.log(`[Auth] User found: id=${user.id}, isActive=${user.isActive}`);
    console.log(`[Auth] Stored password hash: ${user.password}`);
    
    // Check if user is active
    if (!user.isActive) {
      console.log(`[Auth] User account is inactive for email: ${email}`);
      return null;
    }
    
    // Test with a known password hash to verify bcrypt is working
    console.log(`[Auth] Testing bcrypt with "admin123"...`);
    const testHash = await bcrypt.hash("admin123", 10);
    const testResult = await bcrypt.compare("admin123", testHash);
    console.log(`[Auth] Test bcrypt result: ${testResult}`);
    
    const isValid = await bcrypt.compare(password, user.password);
    console.log(`[Auth] Password verification result: ${isValid}`);
    if (!isValid) return null;
    
    // Update last login
    await db.update(users)
      .set({ lastLogin: sql`CURRENT_TIMESTAMP` })
      .where(eq(users.id, user.id));
    
    console.log(`[Auth] Login successful for email: ${email}`);
    return user;
  }

  // Product management
  async getProducts(limit = 50, offset = 0): Promise<Product[]> {
    return await db.select().from(products)
      .orderBy(desc(products.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
    
    if (!result || result.length === 0) {
      return undefined;
    }
    
    return result[0];
  }

  async getProductBySku(sku: string): Promise<Product | undefined> {
    const result = await db.select().from(products).where(eq(products.sku, sku)).limit(1);
    
    if (!result || result.length === 0) {
      return undefined;
    }
    
    return result[0];
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const result = await db.insert(products).values(product).returning();
    
    if (!result || result.length === 0) {
      throw new Error('Failed to create product - no result returned from database');
    }
    
    return result[0];
  }

  async updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const result = await db.update(products)
      .set({ ...updates, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(products.id, id))
      .returning();
    
    if (!result || result.length === 0) {
      return undefined;
    }
    
    return result[0];
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return result.rowCount > 0;
  }

  async searchProducts(query: string): Promise<Product[]> {
    return await db.select().from(products)
      .where(
        or(
          sql`${products.name} ILIKE ${`%${query}%`}`,
          sql`${products.sku} ILIKE ${`%${query}%`}`,
          sql`${products.description} ILIKE ${`%${query}%`}`
        )
      )
      .limit(20);
  }

  async getProductsByCategory(categoryId: string, limit = 50, offset = 0): Promise<Product[]> {
    return await db.select().from(products)
      .where(eq(products.categoryId, categoryId))
      .orderBy(desc(products.createdAt))
      .limit(limit)
      .offset(offset);
  }

  // Category management
  async getCategories(): Promise<Category[]> {
    const categoriesWithCount = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        description: categories.description,
        parentId: categories.parentId,
        image: categories.image,
        isActive: categories.isActive,
        sortOrder: categories.sortOrder,
        createdAt: categories.createdAt,
        updatedAt: categories.updatedAt,
        productCount: sql<number>`COALESCE(COUNT(${products.id}), 0)`
      })
      .from(categories)
      .leftJoin(products, eq(products.categoryId, categories.id))
      .groupBy(
        categories.id,
        categories.name,
        categories.slug,
        categories.description,
        categories.parentId,
        categories.image,
        categories.isActive,
        categories.sortOrder,
        categories.createdAt,
        categories.updatedAt
      )
      .orderBy(asc(categories.sortOrder));

    return categoriesWithCount;
  }

  async getCategory(id: string): Promise<Category | undefined> {
    const result = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
    return result[0];
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const result = await db.insert(categories).values(category).returning();
    return result[0];
  }

  async updateCategory(id: string, updates: Partial<InsertCategory>): Promise<Category | undefined> {
    const result = await db.update(categories)
      .set({ ...updates, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(categories.id, id))
      .returning();
    return result[0];
  }

  async deleteCategory(id: string): Promise<boolean> {
    const result = await db.delete(categories).where(eq(categories.id, id));
    return result.rowCount > 0;
  }

  // Customer management
  async getCustomers(limit = 50, offset = 0): Promise<Customer[]> {
    return await db.select().from(customers)
      .orderBy(desc(customers.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getCustomer(id: string): Promise<Customer | undefined> {
    const result = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
    return result[0];
  }

  async getCustomerByEmail(email: string): Promise<Customer | undefined> {
    const result = await db.select().from(customers).where(eq(customers.email, email)).limit(1);
    return result[0];
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const result = await db.insert(customers).values(customer).returning();
    return result[0];
  }

  async updateCustomer(id: string, updates: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const result = await db.update(customers)
      .set({ ...updates, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(customers.id, id))
      .returning();
    return result[0];
  }

  async deleteCustomer(id: string): Promise<boolean> {
    const result = await db.delete(customers).where(eq(customers.id, id));
    return result.rowCount > 0;
  }

  // Order management
  async getOrders(limit = 50, offset = 0): Promise<Order[]> {
    return await db.select().from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    return result[0];
  }

  async getOrdersByCustomer(customerId: string): Promise<Order[]> {
    return await db.select().from(orders)
      .where(eq(orders.customerId, customerId))
      .orderBy(desc(orders.createdAt));
  }

  async createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    const result = await db.transaction(async (tx) => {
      const [newOrder] = await tx.insert(orders).values(order).returning();
      
      if (items.length > 0) {
        const orderItemsWithOrderId = items.map(item => ({
          ...item,
          orderId: newOrder.id
        }));
        await tx.insert(orderItems).values(orderItemsWithOrderId);
      }
      
      return newOrder;
    });
    
    return result;
  }

  async updateOrder(id: string, updates: Partial<InsertOrder>): Promise<Order | undefined> {
    const result = await db.update(orders)
      .set({ ...updates, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(orders.id, id))
      .returning();
    return result[0];
  }

  async updateOrderStatus(id: string, status: string, comment?: string, changedBy?: string): Promise<boolean> {
    const result = await db.transaction(async (tx) => {
      await tx.update(orders)
        .set({ status: status as any, updatedAt: sql`CURRENT_TIMESTAMP` })
        .where(eq(orders.id, id));
      
      await tx.insert(orderStatusHistory).values({
        orderId: id,
        status,
        comment,
        changedBy
      });
      
      return true;
    });
    
    return result;
  }

  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  // Supplier management
  async getSuppliers(): Promise<Supplier[]> {
    return await db.select().from(suppliers).orderBy(asc(suppliers.name));
  }

  async getSupplier(id: string): Promise<Supplier | undefined> {
    const result = await db.select().from(suppliers).where(eq(suppliers.id, id)).limit(1);
    return result[0];
  }

  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    const result = await db.insert(suppliers).values(supplier).returning();
    return result[0];
  }

  async updateSupplier(id: string, updates: Partial<InsertSupplier>): Promise<Supplier | undefined> {
    const result = await db.update(suppliers)
      .set({ ...updates, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(suppliers.id, id))
      .returning();
    return result[0];
  }

  async deleteSupplier(id: string): Promise<boolean> {
    const result = await db.delete(suppliers).where(eq(suppliers.id, id));
    return result.rowCount > 0;
  }

  // Inventory management
  async getInventory(locationId?: string): Promise<Inventory[]> {
    const query = db.select().from(inventory);
    if (locationId) {
      return await query.where(eq(inventory.locationId, locationId));
    }
    return await query;
  }

  async getProductInventory(productId: string): Promise<Inventory[]> {
    return await db.select().from(inventory).where(eq(inventory.productId, productId));
  }

  async updateInventory(productId: string, locationId: string, updates: Partial<InsertInventory>): Promise<Inventory | undefined> {
    const result = await db.update(inventory)
      .set({ ...updates, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(and(eq(inventory.productId, productId), eq(inventory.locationId, locationId)))
      .returning();
    return result[0];
  }

  async getLowStockItems(threshold = 10): Promise<Inventory[]> {
    return await db.select().from(inventory)
      .where(sql`(${inventory.quantityOnHand} - ${inventory.quantityReserved}) <= ${threshold}`);
  }

  // Inventory movements for audit trail
  async getInventoryMovements(productId?: string, locationId?: string, limit?: number): Promise<InventoryMovement[]> {
    const conditions = [];
    
    if (productId) {
      conditions.push(eq(inventoryMovements.productId, productId));
    }
    if (locationId) {
      conditions.push(eq(inventoryMovements.locationId, locationId));
    }
    
    let query = db.select().from(inventoryMovements);
    
    if (conditions.length > 0) {
      query = query.where(conditions.length === 1 ? conditions[0] : and(...conditions));
    }
    
    query = query.orderBy(desc(inventoryMovements.createdAt));
    
    if (limit) {
      query = query.limit(limit);
    }
    
    return await query;
  }

  async createInventoryMovement(movement: InsertInventoryMovement): Promise<InventoryMovement> {
    const result = await db.insert(inventoryMovements).values(movement).returning();
    return result[0];
  }

  async adjustStock(productId: string, locationId: string, quantity: number, reason: string, userId?: string): Promise<boolean> {
    try {
      // Atomic stock adjustment with audit trail using CTE (Common Table Expression)
      const result = await db.execute(sql`
        WITH stock_update AS (
          UPDATE inventory 
          SET 
            quantity_on_hand = GREATEST(0, quantity_on_hand + ${quantity}),
            updated_at = CURRENT_TIMESTAMP
          WHERE product_id = ${productId} AND location_id = ${locationId}
          RETURNING 
            product_id,
            location_id,
            LAG(quantity_on_hand) OVER() as previous_quantity,
            quantity_on_hand as new_quantity
        ),
        movement_insert AS (
          INSERT INTO inventory_movements (
            product_id, location_id, type, quantity, 
            previous_quantity, new_quantity, reason, performed_by
          )
          SELECT 
            product_id, location_id, 'adjustment', ${quantity},
            COALESCE(previous_quantity, 0), new_quantity, ${reason}, ${userId}
          FROM stock_update
          RETURNING id
        )
        SELECT 
          (SELECT COUNT(*) FROM stock_update) as updated_rows,
          (SELECT COUNT(*) FROM movement_insert) as movement_rows
      `);

      const updateResult = result.rows[0] as { updated_rows: number; movement_rows: number };
      
      if (updateResult.updated_rows === 0) {
        throw new Error('Inventory record not found or not updated');
      }
      
      return updateResult.updated_rows > 0 && updateResult.movement_rows > 0;
    } catch (error) {
      console.error('Error adjusting stock:', error);
      return false;
    }
  }

  // Reorder rules management
  async getReorderRules(productId?: string, locationId?: string): Promise<ReorderRule[]> {
    const conditions = [eq(reorderRules.isActive, true)];
    
    if (productId) {
      conditions.push(eq(reorderRules.productId, productId));
    }
    if (locationId) {
      conditions.push(eq(reorderRules.locationId, locationId));
    }
    
    return await db.select().from(reorderRules).where(and(...conditions));
  }

  async createReorderRule(rule: InsertReorderRule): Promise<ReorderRule> {
    const result = await db.insert(reorderRules).values(rule).returning();
    return result[0];
  }

  async updateReorderRule(id: string, updates: Partial<InsertReorderRule>): Promise<ReorderRule | undefined> {
    const result = await db.update(reorderRules)
      .set({ ...updates, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(reorderRules.id, id))
      .returning();
    return result[0];
  }

  async deleteReorderRule(id: string): Promise<boolean> {
    const result = await db.delete(reorderRules).where(eq(reorderRules.id, id)).returning();
    return result.length > 0;
  }

  // Advanced inventory features
  async getReorderSuggestions(): Promise<Array<{
    productId: string;
    productName: string;
    sku: string;
    currentStock: number;
    suggestedQuantity: number;
    priority: 'low' | 'medium' | 'high';
    reason: string;
    supplierId?: string;
    supplierName?: string;
  }>> {
    // Get products that are below reorder level
    const lowStockQuery = await db.select({
      productId: inventory.productId,
      productName: products.name,
      sku: products.sku,
      currentStock: sql`(${inventory.quantityOnHand} - ${inventory.quantityReserved})`.as('currentStock'),
      reorderLevel: inventory.reorderLevel,
      reorderQuantity: inventory.reorderQuantity,
      supplierId: products.supplierId,
      supplierName: suppliers.name
    })
    .from(inventory)
    .innerJoin(products, eq(inventory.productId, products.id))
    .leftJoin(suppliers, eq(products.supplierId, suppliers.id))
    .where(sql`(${inventory.quantityOnHand} - ${inventory.quantityReserved}) <= ${inventory.reorderLevel}`);

    return lowStockQuery.map(item => ({
      productId: item.productId,
      productName: item.productName,
      sku: item.sku || '',
      currentStock: Number(item.currentStock),
      suggestedQuantity: item.reorderQuantity || 50,
      priority: (Number(item.currentStock) === 0 ? 'high' : 
               Number(item.currentStock) <= (item.reorderLevel || 0) / 2 ? 'medium' : 'low') as 'low' | 'medium' | 'high',
      reason: Number(item.currentStock) === 0 ? 'Out of stock' : 'Below reorder level',
      supplierId: item.supplierId || undefined,
      supplierName: item.supplierName || undefined
    }));
  }

  // Bulk operations
  async bulkImportProducts(productList: InsertProduct[]): Promise<{ success: number; errors: Array<{ row: number; error: string }> }> {
    const results = { success: 0, errors: [] as Array<{ row: number; error: string }> };
    
    for (let i = 0; i < productList.length; i++) {
      try {
        await db.insert(products).values(productList[i]);
        results.success++;
      } catch (error: any) {
        results.errors.push({ row: i + 1, error: error.message });
      }
    }
    
    return results;
  }

  async bulkImportInventory(inventoryItems: Array<{ sku: string; locationCode: string; quantity: number; }>): Promise<{ success: number; errors: Array<{ row: number; error: string }> }> {
    const results = { success: 0, errors: [] as Array<{ row: number; error: string }> };
    
    for (let i = 0; i < inventoryItems.length; i++) {
      try {
        const item = inventoryItems[i];
        
        // Find product by SKU
        const product = await db.select({ id: products.id })
          .from(products)
          .where(eq(products.sku, item.sku))
          .limit(1);
        
        if (!product.length) {
          results.errors.push({ row: i + 1, error: `Product with SKU ${item.sku} not found` });
          continue;
        }

        // Find location by code
        const location = await db.select({ id: locations.id })
          .from(locations)
          .where(eq(locations.code, item.locationCode))
          .limit(1);
        
        if (!location.length) {
          results.errors.push({ row: i + 1, error: `Location with code ${item.locationCode} not found` });
          continue;
        }

        // Update or create inventory record
        const existing = await db.select()
          .from(inventory)
          .where(and(eq(inventory.productId, product[0].id), eq(inventory.locationId, location[0].id)))
          .limit(1);

        if (existing.length) {
          await db.update(inventory)
            .set({ quantityOnHand: item.quantity, updatedAt: sql`CURRENT_TIMESTAMP` })
            .where(and(eq(inventory.productId, product[0].id), eq(inventory.locationId, location[0].id)));
        } else {
          await db.insert(inventory).values({
            productId: product[0].id,
            locationId: location[0].id,
            quantityOnHand: item.quantity
          });
        }
        
        results.success++;
      } catch (error: any) {
        results.errors.push({ row: i + 1, error: error.message });
      }
    }
    
    return results;
  }

  async exportInventoryData(locationId?: string): Promise<Array<{
    sku: string;
    productName: string;
    categoryName: string;
    locationName: string;
    quantityOnHand: number;
    quantityReserved: number;
    reorderLevel: number;
    costPrice: number;
    sellingPrice: number;
  }>> {
    let query = db.select({
      sku: products.sku,
      productName: products.name,
      categoryName: categories.name,
      locationName: locations.name,
      quantityOnHand: inventory.quantityOnHand,
      quantityReserved: inventory.quantityReserved,
      reorderLevel: inventory.reorderLevel,
      costPrice: products.costPrice,
      sellingPrice: products.sellingPrice
    })
    .from(inventory)
    .innerJoin(products, eq(inventory.productId, products.id))
    .innerJoin(locations, eq(inventory.locationId, locations.id))
    .leftJoin(categories, eq(products.categoryId, categories.id));

    if (locationId) {
      query = query.where(eq(inventory.locationId, locationId));
    }

    const result = await query;
    
    return result.map(item => ({
      sku: item.sku || '',
      productName: item.productName,
      categoryName: item.categoryName || '',
      locationName: item.locationName,
      quantityOnHand: item.quantityOnHand,
      quantityReserved: item.quantityReserved,
      reorderLevel: item.reorderLevel || 0,
      costPrice: Number(item.costPrice || 0),
      sellingPrice: Number(item.sellingPrice || 0)
    }));
  }

  // Location management
  async getLocations(): Promise<Location[]> {
    return await db.select().from(locations).where(eq(locations.isActive, true));
  }

  async createLocation(location: InsertLocation): Promise<Location> {
    const result = await db.insert(locations).values(location).returning();
    return result[0];
  }

  // Email campaigns
  async getEmailCampaigns(): Promise<EmailCampaign[]> {
    return await db.select().from(emailCampaigns).orderBy(desc(emailCampaigns.createdAt));
  }

  async createEmailCampaign(campaign: InsertEmailCampaign): Promise<EmailCampaign> {
    const result = await db.insert(emailCampaigns).values(campaign).returning();
    return result[0];
  }

  async updateEmailCampaign(id: string, updates: Partial<InsertEmailCampaign>): Promise<EmailCampaign | undefined> {
    const result = await db.update(emailCampaigns)
      .set({ ...updates, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(emailCampaigns.id, id))
      .returning();
    return result[0];
  }

  // Dashboard metrics
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const [
      revenueResult,
      ordersCountResult,
      customersCountResult,
      lowStockResult,
      recentOrdersResult,
      topProductsResult
    ] = await Promise.all([
      // Total revenue
      db.select({ revenue: sum(orders.totalAmount) })
        .from(orders)
        .where(gte(orders.createdAt, sql`CURRENT_DATE - INTERVAL '30 days'`)),
      
      // Total orders count
      db.select({ count: count() })
        .from(orders)
        .where(gte(orders.createdAt, sql`CURRENT_DATE - INTERVAL '30 days'`)),
      
      // Active customers count
      db.select({ count: count() })
        .from(customers)
        .where(eq(customers.isActive, true)),
      
      // Low stock items
      db.select({ count: count() })
        .from(inventory)
        .where(sql`(${inventory.quantityOnHand} - ${inventory.quantityReserved}) <= ${inventory.reorderLevel}`),
      
      // Recent orders
      db.select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        customerName: sql<string>`CONCAT(COALESCE(${customers.firstName}, ''), ' ', COALESCE(${customers.lastName}, ''))`.as('customerName'),
        totalAmount: orders.totalAmount,
        status: orders.status,
        createdAt: orders.createdAt
      })
        .from(orders)
        .leftJoin(customers, eq(orders.customerId, customers.id))
        .orderBy(desc(orders.createdAt))
        .limit(5),
      
      // Top products (placeholder - would need more complex query with order items)
      db.select({
        id: products.id,
        name: products.name,
        category: categories.name,
        sellingPrice: products.sellingPrice
      })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .where(eq(products.isFeatured, true))
        .limit(5)
    ]);

    return {
      totalRevenue: Number(revenueResult[0]?.revenue || 0),
      totalOrders: ordersCountResult[0]?.count || 0,
      activeCustomers: customersCountResult[0]?.count || 0,
      lowStockItems: lowStockResult[0]?.count || 0,
      recentOrders: recentOrdersResult.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName || 'Guest',
        totalAmount: Number(order.totalAmount),
        status: order.status || 'pending',
        createdAt: order.createdAt?.toISOString() || ''
      })),
      topProducts: topProductsResult.map(product => ({
        id: product.id,
        name: product.name,
        category: product.category || 'Uncategorized',
        sales: Number(product.sellingPrice || 0),
        units: 0 // Would need actual sales data
      })),
      salesData: [] // Would implement with actual sales aggregation
    };
  }

  // Financial management - Transactions
  async getTransactions(limit = 50, offset = 0, filters?: {
    startDate?: Date;
    endDate?: Date;
    status?: string;
    paymentMethod?: string;
    customerId?: string;
    orderId?: string;
  }): Promise<Transaction[]> {
    const conditions = [];
    
    if (filters?.startDate) {
      conditions.push(gte(transactions.createdAt, filters.startDate));
    }
    if (filters?.endDate) {
      conditions.push(lte(transactions.createdAt, filters.endDate));
    }
    if (filters?.status) {
      conditions.push(eq(transactions.status, filters.status as any));
    }
    if (filters?.paymentMethod) {
      conditions.push(eq(transactions.paymentMethod, filters.paymentMethod));
    }
    if (filters?.customerId) {
      conditions.push(eq(transactions.customerId, filters.customerId));
    }
    if (filters?.orderId) {
      conditions.push(eq(transactions.orderId, filters.orderId));
    }
    
    let query = db.select().from(transactions);
    
    if (conditions.length > 0) {
      query = query.where(conditions.length === 1 ? conditions[0] : and(...conditions));
    }
    
    return await query
      .orderBy(desc(transactions.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getTransaction(id: string): Promise<Transaction | undefined> {
    const result = await db.select().from(transactions).where(eq(transactions.id, id)).limit(1);
    return result[0];
  }

  async getTransactionsByOrder(orderId: string): Promise<Transaction[]> {
    return await db.select().from(transactions)
      .where(eq(transactions.orderId, orderId))
      .orderBy(desc(transactions.createdAt));
  }

  async getTransactionsByCustomer(customerId: string): Promise<Transaction[]> {
    return await db.select().from(transactions)
      .where(eq(transactions.customerId, customerId))
      .orderBy(desc(transactions.createdAt));
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const result = await db.insert(transactions).values(transaction).returning();
    return result[0];
  }

  async updateTransaction(id: string, updates: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const result = await db.update(transactions)
      .set({ ...updates, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(transactions.id, id))
      .returning();
    return result[0];
  }

  async updateTransactionStatus(id: string, status: string, failureReason?: string): Promise<boolean> {
    const updates: any = { 
      status: status as any, 
      updatedAt: sql`CURRENT_TIMESTAMP` 
    };
    
    if (status === 'completed') {
      updates.processedAt = sql`CURRENT_TIMESTAMP`;
    }
    
    if (failureReason) {
      updates.failureReason = failureReason;
    }

    const result = await db.update(transactions)
      .set(updates)
      .where(eq(transactions.id, id));
    
    return result.rowCount > 0;
  }

  // Financial management - Receipts
  async getReceipts(limit = 50, offset = 0, filters?: {
    startDate?: Date;
    endDate?: Date;
    status?: string;
    customerId?: string;
    orderId?: string;
  }): Promise<Receipt[]> {
    const conditions = [];
    
    if (filters?.startDate) {
      conditions.push(gte(receipts.createdAt, filters.startDate));
    }
    if (filters?.endDate) {
      conditions.push(lte(receipts.createdAt, filters.endDate));
    }
    if (filters?.status) {
      conditions.push(eq(receipts.status, filters.status as any));
    }
    if (filters?.customerId) {
      conditions.push(eq(receipts.customerId, filters.customerId));
    }
    if (filters?.orderId) {
      conditions.push(eq(receipts.orderId, filters.orderId));
    }
    
    let query = db.select().from(receipts);
    
    if (conditions.length > 0) {
      query = query.where(conditions.length === 1 ? conditions[0] : and(...conditions));
    }
    
    return await query
      .orderBy(desc(receipts.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getReceipt(id: string): Promise<Receipt | undefined> {
    const result = await db.select().from(receipts).where(eq(receipts.id, id)).limit(1);
    return result[0];
  }

  async getReceiptByTransaction(transactionId: string): Promise<Receipt | undefined> {
    const result = await db.select().from(receipts)
      .where(eq(receipts.transactionId, transactionId))
      .limit(1);
    return result[0];
  }

  async getReceiptsByCustomer(customerId: string): Promise<Receipt[]> {
    return await db.select().from(receipts)
      .where(eq(receipts.customerId, customerId))
      .orderBy(desc(receipts.createdAt));
  }

  async createReceipt(receipt: InsertReceipt): Promise<Receipt> {
    const result = await db.insert(receipts).values(receipt).returning();
    return result[0];
  }

  async updateReceipt(id: string, updates: Partial<InsertReceipt>): Promise<Receipt | undefined> {
    const result = await db.update(receipts)
      .set(updates)
      .where(eq(receipts.id, id))
      .returning();
    return result[0];
  }

  async markReceiptViewed(id: string): Promise<boolean> {
    const result = await db.update(receipts)
      .set({ 
        status: 'viewed',
        viewedAt: sql`CURRENT_TIMESTAMP` 
      })
      .where(eq(receipts.id, id));
    
    return result.rowCount > 0;
  }

  // Financial management - Tax Records
  async getTaxRecords(period?: string, taxType?: string): Promise<TaxRecord[]> {
    const conditions = [];
    
    if (period) {
      conditions.push(eq(taxRecords.period, period));
    }
    if (taxType) {
      conditions.push(eq(taxRecords.taxType, taxType as any));
    }
    
    let query = db.select().from(taxRecords);
    
    if (conditions.length > 0) {
      query = query.where(conditions.length === 1 ? conditions[0] : and(...conditions));
    }
    
    return await query.orderBy(desc(taxRecords.createdAt));
  }

  async getTaxRecord(id: string): Promise<TaxRecord | undefined> {
    const result = await db.select().from(taxRecords).where(eq(taxRecords.id, id)).limit(1);
    return result[0];
  }

  async createTaxRecord(taxRecord: InsertTaxRecord): Promise<TaxRecord> {
    const result = await db.insert(taxRecords).values(taxRecord).returning();
    return result[0];
  }

  async updateTaxRecord(id: string, updates: Partial<InsertTaxRecord>): Promise<TaxRecord | undefined> {
    const result = await db.update(taxRecords)
      .set({ ...updates, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(taxRecords.id, id))
      .returning();
    return result[0];
  }

  async deleteTaxRecord(id: string): Promise<boolean> {
    const result = await db.delete(taxRecords).where(eq(taxRecords.id, id));
    return result.rowCount > 0;
  }

  // Financial analytics
  async getPaymentSummary(startDate?: Date, endDate?: Date): Promise<{
    totalRevenue: number;
    totalTransactions: number;
    successfulPayments: number;
    failedPayments: number;
    totalFees: number;
    netRevenue: number;
    averageOrderValue: number;
    paymentMethodBreakdown: Array<{
      method: string;
      count: number;
      amount: number;
    }>;
  }> {
    const dateConditions = [];
    
    if (startDate) {
      dateConditions.push(gte(transactions.createdAt, startDate));
    }
    if (endDate) {
      dateConditions.push(lte(transactions.createdAt, endDate));
    }
    
    const dateFilter = dateConditions.length > 0 ? and(...dateConditions) : undefined;
    
    const [summaryResults, paymentMethodResults] = await Promise.all([
      // Summary metrics
      db.select({
        totalRevenue: sum(transactions.amount),
        totalTransactions: count(),
        successfulPayments: sql<number>`COUNT(CASE WHEN ${transactions.status} = 'completed' THEN 1 END)`,
        failedPayments: sql<number>`COUNT(CASE WHEN ${transactions.status} = 'failed' THEN 1 END)`,
        totalFees: sum(transactions.fees),
        netAmount: sum(transactions.netAmount)
      })
        .from(transactions)
        .where(dateFilter),
      
      // Payment method breakdown
      db.select({
        method: transactions.paymentMethod,
        count: count(),
        amount: sum(transactions.amount)
      })
        .from(transactions)
        .where(and(
          eq(transactions.status, 'completed'),
          dateFilter
        ))
        .groupBy(transactions.paymentMethod)
    ]);

    const summary = summaryResults[0];
    
    return {
      totalRevenue: Number(summary?.totalRevenue || 0),
      totalTransactions: summary?.totalTransactions || 0,
      successfulPayments: Number(summary?.successfulPayments || 0),
      failedPayments: Number(summary?.failedPayments || 0),
      totalFees: Number(summary?.totalFees || 0),
      netRevenue: Number(summary?.netAmount || 0),
      averageOrderValue: summary?.totalTransactions ? 
        Number(summary.totalRevenue || 0) / summary.totalTransactions : 0,
      paymentMethodBreakdown: paymentMethodResults.map(result => ({
        method: result.method || 'Unknown',
        count: result.count || 0,
        amount: Number(result.amount || 0)
      }))
    };
  }
}

export const storage = new DatabaseStorage();
