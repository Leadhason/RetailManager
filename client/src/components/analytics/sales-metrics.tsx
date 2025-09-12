import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package } from "lucide-react";

interface SalesMetricsProps {
  metrics: {
    totalRevenue: number;
    revenueGrowth: number;
    totalOrders: number;
    ordersGrowth: number;
    averageOrderValue: number;
    aovGrowth: number;
    conversionRate: number;
    conversionGrowth: number;
    topSellingProducts: Array<{
      id: string;
      name: string;
      revenue: number;
      units: number;
    }>;
    salesByCategory: Array<{
      category: string;
      revenue: number;
      percentage: number;
    }>;
  };
}

export default function SalesMetrics({ metrics }: SalesMetricsProps) {
  const formatGrowth = (growth: number) => {
    const isPositive = growth >= 0;
    return {
      value: `${isPositive ? '+' : ''}${growth.toFixed(1)}%`,
      icon: isPositive ? TrendingUp : TrendingDown,
      color: isPositive ? "text-green-600" : "text-red-600"
    };
  };

  const revenueGrowth = formatGrowth(metrics.revenueGrowth);
  const ordersGrowth = formatGrowth(metrics.ordersGrowth);
  const aovGrowth = formatGrowth(metrics.aovGrowth);
  const conversionGrowth = formatGrowth(metrics.conversionGrowth);

  return (
    <div className="space-y-6" data-testid="sales-metrics">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">GHS {metrics.totalRevenue.toLocaleString()}</div>
            <div className={`flex items-center text-sm ${revenueGrowth.color}`}>
              <revenueGrowth.icon className="mr-1 h-3 w-3" />
              {revenueGrowth.value} from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalOrders.toLocaleString()}</div>
            <div className={`flex items-center text-sm ${ordersGrowth.color}`}>
              <ordersGrowth.icon className="mr-1 h-3 w-3" />
              {ordersGrowth.value} from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">GHS {metrics.averageOrderValue.toFixed(2)}</div>
            <div className={`flex items-center text-sm ${aovGrowth.color}`}>
              <aovGrowth.icon className="mr-1 h-3 w-3" />
              {aovGrowth.value} from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.conversionRate.toFixed(1)}%</div>
            <div className={`flex items-center text-sm ${conversionGrowth.color}`}>
              <conversionGrowth.icon className="mr-1 h-3 w-3" />
              {conversionGrowth.value} from last month
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Selling Products & Sales by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.topSellingProducts.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.units} units sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">GHS {product.revenue.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.salesByCategory.map((category, index) => (
                <div key={category.category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{category.category}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">
                        {category.percentage.toFixed(1)}%
                      </span>
                      <span className="font-medium">
                        GHS {category.revenue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${category.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
