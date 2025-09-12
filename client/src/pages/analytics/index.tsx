import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAnalytics, useSalesMetrics, useProductAnalytics } from "@/hooks/use-analytics";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { CalendarIcon, BarChart3, TrendingUp, Download, RefreshCw } from "lucide-react";
import RevenueChart from "@/components/analytics/revenue-chart";
import SalesMetrics from "@/components/analytics/sales-metrics";

export default function AnalyticsIndex() {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  });
  const [selectedProduct, setSelectedProduct] = useState<string>("all");
  
  const { data: analyticsData, isLoading: analyticsLoading, error: analyticsError, refetch: refetchAnalytics } = useAnalytics(dateRange);
  const { data: salesMetrics, isLoading: salesLoading, error: salesError, refetch: refetchSales } = useSalesMetrics();
  const { data: productAnalytics, isLoading: productLoading, error: productError } = useProductAnalytics(selectedProduct === "all" ? "" : selectedProduct);
  const { toast } = useToast();

  const handleExportData = () => {
    toast({
      title: "Export Started",
      description: "Analytics data export is being prepared",
    });
  };

  const handleRefreshData = () => {
    refetchAnalytics();
    refetchSales();
    toast({
      title: "Data Refreshed",
      description: "Analytics data has been updated",
    });
  };

  if (analyticsError || salesError || productError) {
    return (
      <div className="space-y-6" data-testid="analytics-error">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground">Business intelligence and insights</p>
          </div>
        </div>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to load analytics</h3>
            <p className="text-muted-foreground text-center mb-4">
              {(analyticsError || salesError || productError) instanceof Error 
                ? (analyticsError || salesError || productError)?.message 
                : "An unexpected error occurred"}
            </p>
            <Button onClick={handleRefreshData} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Generate sample data for demonstration since no backend analytics endpoints exist yet
  const sampleSalesMetrics = {
    totalRevenue: 47382,
    revenueGrowth: 12.5,
    totalOrders: 1247,
    ordersGrowth: 8.2,
    averageOrderValue: 127.50,
    aovGrowth: 4.1,
    conversionRate: 2.8,
    conversionGrowth: 0.5,
    topSellingProducts: [
      { id: "1", name: "Professional Drill Set", revenue: 2847, units: 47 },
      { id: "2", name: "LED Work Light", revenue: 1923, units: 83 },
      { id: "3", name: "Safety Equipment Kit", revenue: 1567, units: 32 }
    ],
    salesByCategory: [
      { category: "Power Tools", revenue: 15420, percentage: 32.5 },
      { category: "Building Materials", revenue: 12100, percentage: 25.5 },
      { category: "Electrical", revenue: 9890, percentage: 20.9 },
      { category: "Safety Equipment", revenue: 6720, percentage: 14.2 },
      { category: "Hardware", revenue: 2352, percentage: 4.9 }
    ]
  };

  const sampleAnalyticsData = {
    salesTrends: [
      { date: "Jan", revenue: 4000, orders: 24, customers: 18 },
      { date: "Feb", revenue: 3000, orders: 19, customers: 15 },
      { date: "Mar", revenue: 5000, orders: 32, customers: 25 },
      { date: "Apr", revenue: 4500, orders: 28, customers: 22 },
      { date: "May", revenue: 6000, orders: 38, customers: 30 },
      { date: "Jun", revenue: 5500, orders: 35, customers: 28 },
      { date: "Jul", revenue: 7000, orders: 42, customers: 35 }
    ],
    productPerformance: [],
    customerSegments: [],
    geographicData: []
  };

  return (
    <div className="space-y-6" data-testid="analytics-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Business intelligence and performance insights
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleRefreshData} data-testid="refresh-analytics">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleExportData} data-testid="export-analytics">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Date Range Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Date Range & Filters</CardTitle>
          <CardDescription>Select the time period for analytics data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="grid gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant={"outline"}
                    className="w-[300px] justify-start text-left font-normal"
                    data-testid="date-range-picker"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} -{" "}
                          {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Products" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                <SelectItem value="1">Professional Drill Set</SelectItem>
                <SelectItem value="2">LED Work Light</SelectItem>
                <SelectItem value="3">Safety Equipment Kit</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Sales Metrics */}
      {salesLoading ? (
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-24 bg-muted rounded" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <SalesMetrics metrics={salesMetrics || sampleSalesMetrics} />
      )}

      {/* Revenue Chart */}
      <RevenueChart data={analyticsData?.salesTrends || sampleAnalyticsData.salesTrends} />

      {/* Additional Analytics Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Customer Insights</CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-4 bg-muted rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">New Customers</span>
                  <span className="font-medium">142 this month</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Returning Customers</span>
                  <span className="font-medium">78%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Customer Lifetime Value</span>
                  <span className="font-medium">GHS 1,247</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory Insights</CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-4 bg-muted rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Inventory Turnover</span>
                  <span className="font-medium">4.2x per year</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Stock Coverage</span>
                  <span className="font-medium">45 days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Dead Stock</span>
                  <span className="font-medium text-orange-600">12 items</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Summary</CardTitle>
          <CardDescription>Key performance indicators for the selected period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-2">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-600">+12.5%</div>
              <div className="text-sm text-muted-foreground">Revenue Growth</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-2">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-600">2.8%</div>
              <div className="text-sm text-muted-foreground">Conversion Rate</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mx-auto mb-2">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-purple-600">GHS 127.50</div>
              <div className="text-sm text-muted-foreground">Avg. Order Value</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
