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
  type DashboardMetrics,
  users, products, categories, customers, orders, orderItems,
  suppliers, inventory, locations, emailCampaigns, purchaseOrders,
  orderStatusHistory, customerInteractions
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

  // Location management
  getLocations(): Promise<Location[]>;
  createLocation(location: InsertLocation): Promise<Location>;

  // Email campaigns
  getEmailCampaigns(): Promise<EmailCampaign[]>;
  createEmailCampaign(campaign: InsertEmailCampaign): Promise<EmailCampaign>;
  updateEmailCampaign(id: string, updates: Partial<InsertEmailCampaign>): Promise<EmailCampaign | undefined>;

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
    
    const rawUser = rawInsertResult.rows[0];
    console.log(`[Auth] Raw insert successful: isActive=${rawUser.is_active}`);
    
    return {
      id: uuidBytesToString(rawUser.id),
      email: rawUser.email,
      firstName: rawUser.first_name, 
      lastName: rawUser.last_name,
      role: rawUser.role,
      isActive: rawUser.is_active,
      permissions: {},
      lastLogin: null,
      createdAt: rawUser.created_at,
      updatedAt: rawUser.updated_at
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
    const user = await this.getUserByEmail(email);
    if (!user) {
      console.log(`[Auth] User not found for email: ${email}`);
      return null;
    }
    
    console.log(`[Auth] User found: id=${user.id}, isActive=${user.isActive}`);
    
    // Check if user is active
    if (!user.isActive) {
      console.log(`[Auth] User account is inactive for email: ${email}`);
      return null;
    }
    
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

  // Category management
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(asc(categories.sortOrder));
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
        customerName: sql`CONCAT(${customers.firstName}, ' ', ${customers.lastName})`.as('customerName'),
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
        status: order.status,
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
}

export const storage = new DatabaseStorage();
