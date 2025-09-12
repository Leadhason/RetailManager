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

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sku: string | null;
  sellingPrice: string | null;
  status: string;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  totalAmount: string;
  createdAt: string;
  customer?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface Customer {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  company: string | null;
  customerType: string;
  totalSpent: string;
  orderCount: number;
  createdAt: string;
}
