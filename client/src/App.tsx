import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./contexts/auth-context";
import { ThemeProvider } from "./components/ui/theme-provider";

import NotFound from "@/pages/not-found";
import Login from "@/pages/auth/login";
import Dashboard from "@/pages/dashboard";
import ProductsIndex from "@/pages/products/index";
import AddProduct from "@/pages/products/add";
import CategoriesIndex from "@/pages/categories/index";
import InventoryIndex from "@/pages/inventory/index";
import OrdersIndex from "@/pages/orders/index";
import CustomersIndex from "@/pages/customers/index";
import AnalyticsIndex from "@/pages/analytics/index";
import MarketingIndex from "@/pages/marketing/index";
import EmailCampaignsIndex from "@/pages/marketing/email/index";
import PromotionsIndex from "@/pages/marketing/promotions/index";
import SEOToolsIndex from "@/pages/marketing/seo/index";
import SuppliersIndex from "@/pages/suppliers/index";
import WarehouseIndex from "@/pages/warehouse/index";
import FinancialIndex from "@/pages/financial/index";
import PaymentsIndex from "@/pages/financial/payments/index";
import ReportsIndex from "@/pages/financial/reports/index";
import TaxIndex from "@/pages/financial/tax/index";
import SettingsIndex from "@/pages/settings/index";
import MainLayout from "@/components/layout/main-layout";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      
      {/* Protected routes with layout */}
      <Route path="/" component={() => <MainLayout><Dashboard /></MainLayout>} />
      <Route path="/dashboard" component={() => <MainLayout><Dashboard /></MainLayout>} />
      
      {/* Product Management */}
      <Route path="/products" component={() => <MainLayout><ProductsIndex /></MainLayout>} />
      <Route path="/products/add" component={() => <MainLayout><AddProduct /></MainLayout>} />
      <Route path="/categories" component={() => <MainLayout><CategoriesIndex /></MainLayout>} />
      <Route path="/inventory" component={() => <MainLayout><InventoryIndex /></MainLayout>} />
      
      {/* Order & Customer Management */}
      <Route path="/orders" component={() => <MainLayout><OrdersIndex /></MainLayout>} />
      <Route path="/customers" component={() => <MainLayout><CustomersIndex /></MainLayout>} />
      
      {/* Analytics */}
      <Route path="/analytics" component={() => <MainLayout><AnalyticsIndex /></MainLayout>} />
      
      {/* Marketing */}
      <Route path="/marketing" component={() => <MainLayout><MarketingIndex /></MainLayout>} />
      <Route path="/marketing/email" component={() => <MainLayout><EmailCampaignsIndex /></MainLayout>} />
      <Route path="/marketing/promotions" component={() => <MainLayout><PromotionsIndex /></MainLayout>} />
      <Route path="/marketing/seo" component={() => <MainLayout><SEOToolsIndex /></MainLayout>} />
      
      {/* Operations */}
      <Route path="/suppliers" component={() => <MainLayout><SuppliersIndex /></MainLayout>} />
      <Route path="/warehouse" component={() => <MainLayout><WarehouseIndex /></MainLayout>} />
      
      {/* Financial Management */}
      <Route path="/financial" component={() => <MainLayout><FinancialIndex /></MainLayout>} />
      <Route path="/financial/payments" component={() => <MainLayout><PaymentsIndex /></MainLayout>} />
      <Route path="/financial/reports" component={() => <MainLayout><ReportsIndex /></MainLayout>} />
      <Route path="/financial/tax" component={() => <MainLayout><TaxIndex /></MainLayout>} />
      
      {/* System */}
      <Route path="/settings" component={() => <MainLayout><SettingsIndex /></MainLayout>} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
