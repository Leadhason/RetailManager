import React from "react";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import KPICards from "@/components/dashboard/kpi-cards";
import SalesChart from "@/components/dashboard/sales-chart";
import TopProducts from "@/components/dashboard/top-products";
import RecentOrders from "@/components/dashboard/recent-orders";
import Alerts from "@/components/dashboard/alerts";
import QuickActions from "@/components/dashboard/quick-actions";

export default function Dashboard() {
  const { data: metrics, isLoading, error } = useDashboardData();

  if (isLoading) {
    return (
      <div className="space-y-6" data-testid="dashboard-loading">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-80 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-80 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64" data-testid="dashboard-error">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-destructive mb-2">Failed to load dashboard data</p>
            <p className="text-sm text-muted-foreground">
              {error instanceof Error ? error.message : "An unexpected error occurred"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-64" data-testid="dashboard-no-data">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No dashboard data available</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8" data-testid="dashboard">
      {/* KPI Cards */}
      <KPICards metrics={metrics} />

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChart data={metrics.salesData} />
        <TopProducts products={metrics.topProducts} />
      </div>

      {/* Recent Orders and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentOrders orders={metrics.recentOrders} />
        </div>
        <Alerts />
      </div>

      {/* Quick Actions */}
      <QuickActions />
    </div>
  );
}
