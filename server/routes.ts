import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { AuthService } from "./services/auth";
import { EmailService } from "./services/email";
import { uploadProductImage, deleteProductImages } from "./supabase";
import { 
  insertUserSchema, insertProductSchema, insertCategorySchema,
  insertCustomerSchema, insertOrderSchema, insertSupplierSchema,
  insertInventorySchema, insertLocationSchema, insertEmailCampaignSchema,
  insertInventoryMovementSchema, insertReorderRuleSchema,
  insertTransactionSchema, insertReceiptSchema, insertTaxRecordSchema,
  locations
} from "@shared/schema";
import { z } from "zod";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, sql } from "drizzle-orm";
import multer from "multer";

// Middleware for authentication
const authenticate = async (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: "Authentication token required" });
  }

  const user = await AuthService.getUserFromToken(token);
  if (!user) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  req.user = user;
  next();
};

// Middleware for role-based authorization
const authorize = (requiredRole: string) => {
  return (req: any, res: any, next: any) => {
    if (!AuthService.hasPermission(req.user.role, requiredRole)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    next();
  };
};

// Configure multer for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 4 // Max 4 files
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const result = await AuthService.login(email, password);
      if (!result) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      res.json({
        message: "Login successful",
        user: {
          id: result.user.id,
          email: result.user.email,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          role: result.user.role
        },
        token: result.token
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/auth/me", authenticate, async (req: any, res) => {
    res.json({
      id: req.user.id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      role: req.user.role
    });
  });

  app.post("/api/auth/logout", authenticate, async (req, res) => {
    res.json({ message: "Logout successful" });
  });

  // Secured registration endpoint - requires super_admin authorization
  app.post("/api/auth/register", authenticate, authorize("super_admin"), async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Prevent auto-assigning super_admin role unless explicitly set by existing super_admin
      if (!userData.role) {
        userData.role = "staff";
      }
      
      const user = await storage.createUser(userData);
      
      res.status(201).json({
        message: "User registered successfully",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  // Dashboard routes
  app.get("/api/dashboard/metrics", authenticate, async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Dashboard metrics error:", error);
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });

  // User management routes
  app.get("/api/users", authenticate, authorize("store_manager"), async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users.map(user => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      })));
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/users", authenticate, authorize("super_admin"), async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      
      res.status(201).json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Create user error:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.put("/api/users/:id", authenticate, authorize("super_admin"), async (req, res) => {
    try {
      const updates = insertUserSchema.partial().parse(req.body);
      const user = await storage.updateUser(req.params.id, updates);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Update user error:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.delete("/api/users/:id", authenticate, authorize("super_admin"), async (req, res) => {
    try {
      const success = await storage.deleteUser(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Product routes
  app.get("/api/products", authenticate, async (req, res) => {
    try {
      const { limit = 50, offset = 0, search } = req.query;
      
      let products;
      if (search) {
        products = await storage.searchProducts(search as string);
      } else {
        products = await storage.getProducts(Number(limit), Number(offset));
      }
      
      res.json(products);
    } catch (error) {
      console.error("Get products error:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", authenticate, async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Get product error:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.get("/api/categories/:id/products", authenticate, async (req, res) => {
    try {
      const { limit = 50, offset = 0 } = req.query;
      const products = await storage.getProductsByCategory(
        req.params.id, 
        Number(limit), 
        Number(offset)
      );
      res.json(products);
    } catch (error) {
      console.error("Get products by category error:", error);
      res.status(500).json({ message: "Failed to fetch products by category" });
    }
  });

  // Product image upload endpoint
  app.post("/api/products/upload-images", authenticate, authorize("staff"), upload.array('images', 4), async (req: any, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No images uploaded" });
      }

      if (req.files.length < 2) {
        return res.status(400).json({ message: "At least 2 images are required" });
      }

      if (req.files.length > 4) {
        return res.status(400).json({ message: "Maximum 4 images allowed" });
      }

      const productId = req.body.productId || `temp-${Date.now()}`;
      const imageUrls: string[] = [];

      // Upload each image to Supabase
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        
        // Convert buffer to File-like object for Supabase
        const blob = new Blob([file.buffer], { type: file.mimetype });
        const uploadFile = new File([blob], file.originalname, { type: file.mimetype });
        
        try {
          const imageUrl = await uploadProductImage(uploadFile, productId, i);
          imageUrls.push(imageUrl);
        } catch (uploadError) {
          console.error(`Error uploading image ${i}:`, uploadError);
          return res.status(500).json({ 
            message: `Failed to upload image ${i + 1}: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}` 
          });
        }
      }

      res.json({ 
        message: "Images uploaded successfully", 
        productId,
        imageUrls 
      });
    } catch (error) {
      console.error("Image upload error:", error);
      res.status(500).json({ message: "Failed to upload images" });
    }
  });

  app.post("/api/products", authenticate, authorize("staff"), async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Create product error:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.put("/api/products/:id", authenticate, authorize("staff"), async (req, res) => {
    try {
      const updates = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(req.params.id, updates);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Update product error:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", authenticate, authorize("store_manager"), async (req, res) => {
    try {
      const success = await storage.deleteProduct(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Delete product error:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Category routes
  app.get("/api/categories", authenticate, async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Get categories error:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", authenticate, authorize("staff"), async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Create category error:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  app.put("/api/categories/:id", authenticate, authorize("staff"), async (req, res) => {
    try {
      const updates = insertCategorySchema.partial().parse(req.body);
      const category = await storage.updateCategory(req.params.id, updates);
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Update category error:", error);
      res.status(500).json({ message: "Failed to update category" });
    }
  });

  app.delete("/api/categories/:id", authenticate, authorize("store_manager"), async (req, res) => {
    try {
      const success = await storage.deleteCategory(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json({ message: "Category deleted successfully" });
    } catch (error) {
      console.error("Delete category error:", error);
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Customer routes
  app.get("/api/customers", authenticate, async (req, res) => {
    try {
      const { limit = 50, offset = 0 } = req.query;
      const customers = await storage.getCustomers(Number(limit), Number(offset));
      res.json(customers);
    } catch (error) {
      console.error("Get customers error:", error);
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.get("/api/customers/:id", authenticate, async (req, res) => {
    try {
      const customer = await storage.getCustomer(req.params.id);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      console.error("Get customer error:", error);
      res.status(500).json({ message: "Failed to fetch customer" });
    }
  });

  app.post("/api/customers", authenticate, authorize("staff"), async (req, res) => {
    try {
      const customerData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(customerData);
      
      // Send welcome email
      if (customer.email && customer.firstName) {
        await EmailService.sendWelcomeEmail(customer.email, customer.firstName);
      }
      
      res.status(201).json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Create customer error:", error);
      res.status(500).json({ message: "Failed to create customer" });
    }
  });

  app.put("/api/customers/:id", authenticate, authorize("staff"), async (req, res) => {
    try {
      const updates = insertCustomerSchema.partial().parse(req.body);
      const customer = await storage.updateCustomer(req.params.id, updates);
      
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      res.json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Update customer error:", error);
      res.status(500).json({ message: "Failed to update customer" });
    }
  });

  app.delete("/api/customers/:id", authenticate, authorize("store_manager"), async (req, res) => {
    try {
      const success = await storage.deleteCustomer(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json({ message: "Customer deleted successfully" });
    } catch (error) {
      console.error("Delete customer error:", error);
      res.status(500).json({ message: "Failed to delete customer" });
    }
  });

  // Order routes
  app.get("/api/orders", authenticate, async (req, res) => {
    try {
      const { limit = 50, offset = 0 } = req.query;
      const orders = await storage.getOrders(Number(limit), Number(offset));
      res.json(orders);
    } catch (error) {
      console.error("Get orders error:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", authenticate, async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      const orderItems = await storage.getOrderItems(order.id);
      res.json({ ...order, items: orderItems });
    } catch (error) {
      console.error("Get order error:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.post("/api/orders", authenticate, authorize("staff"), async (req, res) => {
    try {
      const { order: orderData, items } = req.body;
      const validatedOrder = insertOrderSchema.parse(orderData);
      
      const order = await storage.createOrder(validatedOrder, items || []);
      
      // Send order confirmation email
      if (order.customerId) {
        const customer = await storage.getCustomer(order.customerId);
        if (customer?.email && customer.firstName) {
          await EmailService.sendOrderConfirmation(
            customer.email,
            customer.firstName,
            order.orderNumber,
            Number(order.totalAmount)
          );
        }
      }
      
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Create order error:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.put("/api/orders/:id/status", authenticate, authorize("staff"), async (req: any, res) => {
    try {
      const { status, comment } = req.body;
      const success = await storage.updateOrderStatus(
        req.params.id, 
        status, 
        comment, 
        req.user.id
      );
      
      if (!success) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      res.json({ message: "Order status updated successfully" });
    } catch (error) {
      console.error("Update order status error:", error);
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  app.delete("/api/orders/:id", authenticate, authorize("store_manager"), async (req: any, res) => {
    try {
      // Cancel order by updating status to 'cancelled'
      const success = await storage.updateOrderStatus(
        req.params.id, 
        "cancelled", 
        "Order cancelled by administrator", 
        req.user.id
      );
      
      if (!success) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      res.json({ message: "Order cancelled successfully" });
    } catch (error) {
      console.error("Cancel order error:", error);
      res.status(500).json({ message: "Failed to cancel order" });
    }
  });

  // Supplier routes
  app.get("/api/suppliers", authenticate, async (req, res) => {
    try {
      const suppliers = await storage.getSuppliers();
      res.json(suppliers);
    } catch (error) {
      console.error("Get suppliers error:", error);
      res.status(500).json({ message: "Failed to fetch suppliers" });
    }
  });

  app.post("/api/suppliers", authenticate, authorize("staff"), async (req, res) => {
    try {
      const supplierData = insertSupplierSchema.parse(req.body);
      const supplier = await storage.createSupplier(supplierData);
      res.status(201).json(supplier);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Create supplier error:", error);
      res.status(500).json({ message: "Failed to create supplier" });
    }
  });

  app.put("/api/suppliers/:id", authenticate, authorize("staff"), async (req, res) => {
    try {
      const updates = insertSupplierSchema.partial().parse(req.body);
      const supplier = await storage.updateSupplier(req.params.id, updates);
      
      if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      
      res.json(supplier);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Update supplier error:", error);
      res.status(500).json({ message: "Failed to update supplier" });
    }
  });

  app.delete("/api/suppliers/:id", authenticate, authorize("store_manager"), async (req, res) => {
    try {
      const success = await storage.deleteSupplier(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      res.json({ message: "Supplier deleted successfully" });
    } catch (error) {
      console.error("Delete supplier error:", error);
      res.status(500).json({ message: "Failed to delete supplier" });
    }
  });

  // Inventory routes
  app.get("/api/inventory", authenticate, async (req, res) => {
    try {
      const { locationId } = req.query;
      const inventory = await storage.getInventory(locationId as string);
      res.json(inventory);
    } catch (error) {
      console.error("Get inventory error:", error);
      res.status(500).json({ message: "Failed to fetch inventory" });
    }
  });

  app.get("/api/inventory/low-stock", authenticate, async (req, res) => {
    try {
      const { threshold = 10 } = req.query;
      const lowStockItems = await storage.getLowStockItems(Number(threshold));
      res.json(lowStockItems);
    } catch (error) {
      console.error("Get low stock items error:", error);
      res.status(500).json({ message: "Failed to fetch low stock items" });
    }
  });

  app.put("/api/inventory/:productId/:locationId", authenticate, authorize("staff"), async (req, res) => {
    try {
      const updates = insertInventorySchema.partial().parse(req.body);
      const inventory = await storage.updateInventory(
        req.params.productId,
        req.params.locationId,
        updates
      );
      
      if (!inventory) {
        return res.status(404).json({ message: "Inventory record not found" });
      }
      
      res.json(inventory);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Update inventory error:", error);
      res.status(500).json({ message: "Failed to update inventory" });
    }
  });

  // Advanced Inventory Management Routes

  // Inventory movements (audit trail)
  app.get("/api/inventory/movements", authenticate, async (req, res) => {
    try {
      const { productId, locationId, limit = 100 } = req.query;
      const movements = await storage.getInventoryMovements(
        productId as string, 
        locationId as string, 
        Number(limit)
      );
      res.json(movements);
    } catch (error) {
      console.error("Get inventory movements error:", error);
      res.status(500).json({ message: "Failed to fetch inventory movements" });
    }
  });

  // Stock adjustments
  app.post("/api/inventory/adjust", authenticate, authorize("staff"), async (req, res) => {
    try {
      const { productId, locationId, quantity, reason } = req.body;
      
      if (!productId || !locationId || quantity === undefined || !reason) {
        return res.status(400).json({ 
          message: "Product ID, location ID, quantity, and reason are required" 
        });
      }

      const success = await storage.adjustStock(
        productId, 
        locationId, 
        Number(quantity), 
        reason, 
        (req as any).user.id
      );

      if (!success) {
        return res.status(400).json({ message: "Failed to adjust stock" });
      }

      res.json({ message: "Stock adjusted successfully" });
    } catch (error) {
      console.error("Stock adjustment error:", error);
      res.status(500).json({ message: "Failed to adjust stock" });
    }
  });

  // Reorder rules CRUD
  app.get("/api/inventory/reorder-rules", authenticate, async (req, res) => {
    try {
      const { productId, locationId } = req.query;
      const rules = await storage.getReorderRules(productId as string, locationId as string);
      res.json(rules);
    } catch (error) {
      console.error("Get reorder rules error:", error);
      res.status(500).json({ message: "Failed to fetch reorder rules" });
    }
  });

  app.post("/api/inventory/reorder-rules", authenticate, authorize("store_manager"), async (req, res) => {
    try {
      const ruleData = insertReorderRuleSchema.parse(req.body);
      const rule = await storage.createReorderRule(ruleData);
      res.status(201).json(rule);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Create reorder rule error:", error);
      res.status(500).json({ message: "Failed to create reorder rule" });
    }
  });

  app.put("/api/inventory/reorder-rules/:id", authenticate, authorize("store_manager"), async (req, res) => {
    try {
      const updates = insertReorderRuleSchema.partial().parse(req.body);
      const rule = await storage.updateReorderRule(req.params.id, updates);
      
      if (!rule) {
        return res.status(404).json({ message: "Reorder rule not found" });
      }
      
      res.json(rule);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Update reorder rule error:", error);
      res.status(500).json({ message: "Failed to update reorder rule" });
    }
  });

  app.delete("/api/inventory/reorder-rules/:id", authenticate, authorize("store_manager"), async (req, res) => {
    try {
      const success = await storage.deleteReorderRule(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Reorder rule not found" });
      }
      res.json({ message: "Reorder rule deleted successfully" });
    } catch (error) {
      console.error("Delete reorder rule error:", error);
      res.status(500).json({ message: "Failed to delete reorder rule" });
    }
  });

  // Reorder suggestions
  app.get("/api/inventory/reorder-suggestions", authenticate, async (req, res) => {
    try {
      const suggestions = await storage.getReorderSuggestions();
      res.json(suggestions);
    } catch (error) {
      console.error("Get reorder suggestions error:", error);
      res.status(500).json({ message: "Failed to fetch reorder suggestions" });
    }
  });

  // Bulk operations
  app.post("/api/inventory/bulk-import/products", authenticate, authorize("store_manager"), async (req, res) => {
    try {
      const { products } = req.body;
      
      if (!Array.isArray(products)) {
        return res.status(400).json({ message: "Products array is required" });
      }

      const result = await storage.bulkImportProducts(products);
      res.json({
        message: `Imported ${result.success} products successfully`,
        success: result.success,
        errors: result.errors
      });
    } catch (error) {
      console.error("Bulk import products error:", error);
      res.status(500).json({ message: "Failed to import products" });
    }
  });

  app.post("/api/inventory/bulk-import/inventory", authenticate, authorize("store_manager"), async (req, res) => {
    try {
      const { inventoryItems } = req.body;
      
      if (!Array.isArray(inventoryItems)) {
        return res.status(400).json({ message: "Inventory items array is required" });
      }

      const result = await storage.bulkImportInventory(inventoryItems);
      res.json({
        message: `Imported ${result.success} inventory items successfully`,
        success: result.success,
        errors: result.errors
      });
    } catch (error) {
      console.error("Bulk import inventory error:", error);
      res.status(500).json({ message: "Failed to import inventory" });
    }
  });

  app.get("/api/inventory/export", authenticate, async (req, res) => {
    try {
      const { locationId } = req.query;
      const data = await storage.exportInventoryData(locationId as string);
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=inventory-export.json');
      res.json(data);
    } catch (error) {
      console.error("Export inventory error:", error);
      res.status(500).json({ message: "Failed to export inventory data" });
    }
  });

  // Location routes
  app.get("/api/locations", authenticate, async (req, res) => {
    try {
      const locations = await storage.getLocations();
      res.json(locations);
    } catch (error) {
      console.error("Get locations error:", error);
      res.status(500).json({ message: "Failed to fetch locations" });
    }
  });

  app.post("/api/locations", authenticate, authorize("store_manager"), async (req, res) => {
    try {
      const locationData = insertLocationSchema.parse(req.body);
      const location = await storage.createLocation(locationData);
      res.status(201).json(location);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Create location error:", error);
      res.status(500).json({ message: "Failed to create location" });
    }
  });

  app.delete("/api/locations/:id", authenticate, authorize("store_manager"), async (req, res) => {
    try {
      // Use the database instance from storage for consistency
      const db = drizzle(neon(process.env.DATABASE_URL!));
      
      // Soft delete by setting isActive to false
      const success = await db.update(locations)
        .set({ isActive: false })
        .where(eq(locations.id, req.params.id));
      
      if (success.rowCount === 0) {
        return res.status(404).json({ message: "Location not found" });
      }
      
      res.json({ message: "Location deleted successfully" });
    } catch (error) {
      console.error("Delete location error:", error);
      res.status(500).json({ message: "Failed to delete location" });
    }
  });

  // Email campaign routes
  app.get("/api/email-campaigns", authenticate, authorize("staff"), async (req, res) => {
    try {
      const campaigns = await storage.getEmailCampaigns();
      res.json(campaigns);
    } catch (error) {
      console.error("Get email campaigns error:", error);
      res.status(500).json({ message: "Failed to fetch email campaigns" });
    }
  });

  app.post("/api/email-campaigns", authenticate, authorize("staff"), async (req: any, res) => {
    try {
      const campaignData = insertEmailCampaignSchema.parse({
        ...req.body,
        createdBy: req.user.id
      });
      const campaign = await storage.createEmailCampaign(campaignData);
      res.status(201).json(campaign);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Create email campaign error:", error);
      res.status(500).json({ message: "Failed to create email campaign" });
    }
  });

  app.put("/api/email-campaigns/:id", authenticate, authorize("staff"), async (req, res) => {
    try {
      const updates = insertEmailCampaignSchema.partial().parse(req.body);
      const campaign = await storage.updateEmailCampaign(req.params.id, updates);
      
      if (!campaign) {
        return res.status(404).json({ message: "Email campaign not found" });
      }
      
      res.json(campaign);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Update email campaign error:", error);
      res.status(500).json({ message: "Failed to update email campaign" });
    }
  });

  // Financial routes - Transactions
  app.get("/api/financial/transactions", authenticate, authorize("staff"), async (req, res) => {
    try {
      const { 
        limit = 50, 
        offset = 0, 
        startDate, 
        endDate, 
        status, 
        paymentMethod, 
        customerId, 
        orderId 
      } = req.query;
      
      const filters: any = {};
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);
      if (status) filters.status = status as string;
      if (paymentMethod) filters.paymentMethod = paymentMethod as string;
      if (customerId) filters.customerId = customerId as string;
      if (orderId) filters.orderId = orderId as string;
      
      const transactions = await storage.getTransactions(
        Number(limit), 
        Number(offset), 
        Object.keys(filters).length > 0 ? filters : undefined
      );
      res.json(transactions);
    } catch (error) {
      console.error("Get transactions error:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.get("/api/financial/transactions/:id", authenticate, authorize("staff"), async (req, res) => {
    try {
      const transaction = await storage.getTransaction(req.params.id);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      res.json(transaction);
    } catch (error) {
      console.error("Get transaction error:", error);
      res.status(500).json({ message: "Failed to fetch transaction" });
    }
  });

  app.get("/api/financial/transactions/order/:orderId", authenticate, authorize("staff"), async (req, res) => {
    try {
      const transactions = await storage.getTransactionsByOrder(req.params.orderId);
      res.json(transactions);
    } catch (error) {
      console.error("Get order transactions error:", error);
      res.status(500).json({ message: "Failed to fetch order transactions" });
    }
  });

  app.post("/api/financial/transactions", authenticate, authorize("staff"), async (req, res) => {
    try {
      const transactionData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(transactionData);
      res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Create transaction error:", error);
      res.status(500).json({ message: "Failed to create transaction" });
    }
  });

  app.put("/api/financial/transactions/:id", authenticate, authorize("staff"), async (req, res) => {
    try {
      const updates = insertTransactionSchema.partial().parse(req.body);
      const transaction = await storage.updateTransaction(req.params.id, updates);
      
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      res.json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Update transaction error:", error);
      res.status(500).json({ message: "Failed to update transaction" });
    }
  });

  // Financial routes - Receipts
  app.get("/api/financial/receipts", authenticate, authorize("staff"), async (req, res) => {
    try {
      const { 
        limit = 50, 
        offset = 0, 
        startDate, 
        endDate, 
        status, 
        customerId, 
        orderId 
      } = req.query;
      
      const filters: any = {};
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);
      if (status) filters.status = status as string;
      if (customerId) filters.customerId = customerId as string;
      if (orderId) filters.orderId = orderId as string;
      
      const receipts = await storage.getReceipts(
        Number(limit), 
        Number(offset), 
        Object.keys(filters).length > 0 ? filters : undefined
      );
      res.json(receipts);
    } catch (error) {
      console.error("Get receipts error:", error);
      res.status(500).json({ message: "Failed to fetch receipts" });
    }
  });

  app.get("/api/financial/receipts/:id", authenticate, authorize("staff"), async (req, res) => {
    try {
      const receipt = await storage.getReceipt(req.params.id);
      if (!receipt) {
        return res.status(404).json({ message: "Receipt not found" });
      }
      res.json(receipt);
    } catch (error) {
      console.error("Get receipt error:", error);
      res.status(500).json({ message: "Failed to fetch receipt" });
    }
  });

  app.get("/api/financial/receipts/transaction/:transactionId", authenticate, authorize("staff"), async (req, res) => {
    try {
      const receipt = await storage.getReceiptByTransaction(req.params.transactionId);
      if (!receipt) {
        return res.status(404).json({ message: "Receipt not found for transaction" });
      }
      res.json(receipt);
    } catch (error) {
      console.error("Get transaction receipt error:", error);
      res.status(500).json({ message: "Failed to fetch transaction receipt" });
    }
  });

  app.post("/api/financial/receipts", authenticate, authorize("staff"), async (req, res) => {
    try {
      const receiptData = insertReceiptSchema.parse(req.body);
      const receipt = await storage.createReceipt(receiptData);
      res.status(201).json(receipt);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Create receipt error:", error);
      res.status(500).json({ message: "Failed to create receipt" });
    }
  });

  app.put("/api/financial/receipts/:id/viewed", authenticate, authorize("staff"), async (req, res) => {
    try {
      const success = await storage.markReceiptViewed(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Receipt not found" });
      }
      res.json({ message: "Receipt marked as viewed" });
    } catch (error) {
      console.error("Mark receipt viewed error:", error);
      res.status(500).json({ message: "Failed to mark receipt as viewed" });
    }
  });

  // Financial routes - Tax Records
  app.get("/api/financial/tax-records", authenticate, authorize("staff"), async (req, res) => {
    try {
      const { period, taxType } = req.query;
      const taxRecords = await storage.getTaxRecords(
        period as string, 
        taxType as string
      );
      res.json(taxRecords);
    } catch (error) {
      console.error("Get tax records error:", error);
      res.status(500).json({ message: "Failed to fetch tax records" });
    }
  });

  app.get("/api/financial/tax-records/:id", authenticate, authorize("staff"), async (req, res) => {
    try {
      const taxRecord = await storage.getTaxRecord(req.params.id);
      if (!taxRecord) {
        return res.status(404).json({ message: "Tax record not found" });
      }
      res.json(taxRecord);
    } catch (error) {
      console.error("Get tax record error:", error);
      res.status(500).json({ message: "Failed to fetch tax record" });
    }
  });

  app.post("/api/financial/tax-records", authenticate, authorize("staff"), async (req: any, res) => {
    try {
      const taxRecordData = insertTaxRecordSchema.parse({
        ...req.body,
        createdBy: req.user.id
      });
      const taxRecord = await storage.createTaxRecord(taxRecordData);
      res.status(201).json(taxRecord);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Create tax record error:", error);
      res.status(500).json({ message: "Failed to create tax record" });
    }
  });

  app.put("/api/financial/tax-records/:id", authenticate, authorize("staff"), async (req, res) => {
    try {
      const updates = insertTaxRecordSchema.partial().parse(req.body);
      const taxRecord = await storage.updateTaxRecord(req.params.id, updates);
      
      if (!taxRecord) {
        return res.status(404).json({ message: "Tax record not found" });
      }
      
      res.json(taxRecord);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Update tax record error:", error);
      res.status(500).json({ message: "Failed to update tax record" });
    }
  });

  app.delete("/api/financial/tax-records/:id", authenticate, authorize("store_manager"), async (req, res) => {
    try {
      const success = await storage.deleteTaxRecord(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Tax record not found" });
      }
      res.json({ message: "Tax record deleted successfully" });
    } catch (error) {
      console.error("Delete tax record error:", error);
      res.status(500).json({ message: "Failed to delete tax record" });
    }
  });

  // Financial analytics and summaries
  app.get("/api/financial/summary", authenticate, authorize("staff"), async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;
      
      const summary = await storage.getPaymentSummary(start, end);
      res.json(summary);
    } catch (error) {
      console.error("Get financial summary error:", error);
      res.status(500).json({ message: "Failed to fetch financial summary" });
    }
  });

  app.get("/api/financial/payment-summary", authenticate, authorize("staff"), async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;
      
      const summary = await storage.getPaymentSummary(start, end);
      res.json(summary);
    } catch (error) {
      console.error("Get payment summary error:", error);
      res.status(500).json({ message: "Failed to fetch payment summary" });
    }
  });

  // Transaction status update endpoint
  app.patch("/api/financial/transactions/:id/status", authenticate, authorize("staff"), async (req, res) => {
    try {
      const { status, failureReason } = req.body;
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      const success = await storage.updateTransactionStatus(req.params.id, status, failureReason);
      if (!success) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      res.json({ message: "Transaction status updated successfully" });
    } catch (error) {
      console.error("Update transaction status error:", error);
      res.status(500).json({ message: "Failed to update transaction status" });
    }
  });

  // Health check route
  app.get("/api/health", (req, res) => {
    res.json({ status: "OK", timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);
  return httpServer;
}
