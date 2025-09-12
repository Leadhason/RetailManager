import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { AuthService } from "./services/auth";
import { EmailService } from "./services/email";
import { 
  insertUserSchema, insertProductSchema, insertCategorySchema,
  insertCustomerSchema, insertOrderSchema, insertSupplierSchema,
  insertInventorySchema, insertLocationSchema, insertEmailCampaignSchema
} from "@shared/schema";
import { z } from "zod";

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

  // Temporary registration endpoint for testing (remove in production)
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // For testing, allow creating admin users
      if (!userData.role) {
        userData.role = "super_admin";
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

  app.put("/api/orders/:id/status", authenticate, authorize("staff"), async (req, res) => {
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

  app.post("/api/email-campaigns", authenticate, authorize("staff"), async (req, res) => {
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

  // Health check route
  app.get("/api/health", (req, res) => {
    res.json({ status: "OK", timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);
  return httpServer;
}
