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
import OrdersIndex from "@/pages/orders/index";
import CustomersIndex from "@/pages/customers/index";
import AnalyticsIndex from "@/pages/analytics/index";
import MarketingIndex from "@/pages/marketing/index";
import SuppliersIndex from "@/pages/suppliers/index";
import WarehouseIndex from "@/pages/warehouse/index";
import FinancialIndex from "@/pages/financial/index";
import SettingsIndex from "@/pages/settings/index";
import MainLayout from "@/components/layout/main-layout";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      
      {/* Protected routes with layout */}
      <Route path="/" component={() => <MainLayout><Dashboard /></MainLayout>} />
      <Route path="/dashboard" component={() => <MainLayout><Dashboard /></MainLayout>} />
      <Route path="/products" component={() => <MainLayout><ProductsIndex /></MainLayout>} />
      <Route path="/products/add" component={() => <MainLayout><AddProduct /></MainLayout>} />
      <Route path="/orders" component={() => <MainLayout><OrdersIndex /></MainLayout>} />
      <Route path="/customers" component={() => <MainLayout><CustomersIndex /></MainLayout>} />
      <Route path="/analytics" component={() => <MainLayout><AnalyticsIndex /></MainLayout>} />
      <Route path="/marketing" component={() => <MainLayout><MarketingIndex /></MainLayout>} />
      <Route path="/suppliers" component={() => <MainLayout><SuppliersIndex /></MainLayout>} />
      <Route path="/warehouse" component={() => <MainLayout><WarehouseIndex /></MainLayout>} />
      <Route path="/financial" component={() => <MainLayout><FinancialIndex /></MainLayout>} />
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
