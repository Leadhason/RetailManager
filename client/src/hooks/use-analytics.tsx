import { useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/lib/api";

export interface AnalyticsData {
  salesTrends: Array<{
    date: string;
    revenue: number;
    orders: number;
    customers: number;
  }>;
  productPerformance: Array<{
    productId: string;
    name: string;
    revenue: number;
    units: number;
    growth: number;
  }>;
  customerSegments: Array<{
    segment: string;
    count: number;
    revenue: number;
    percentage: number;
  }>;
  geographicData: Array<{
    region: string;
    revenue: number;
    orders: number;
  }>;
}

export function useAnalytics(dateRange?: { from: Date; to: Date }) {
  return useQuery<AnalyticsData>({
    queryKey: ["/api/analytics", dateRange],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (dateRange) {
        params.append("from", dateRange.from.toISOString());
        params.append("to", dateRange.to.toISOString());
      }
      
      const response = await fetch(`/api/analytics?${params}`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch analytics data");
      }
      
      return response.json();
    },
    refetchInterval: 300000, // Refresh every 5 minutes
  });
}

export function useSalesMetrics() {
  return useQuery({
    queryKey: ["/api/analytics/sales-metrics"],
    queryFn: async () => {
      const response = await fetch("/api/analytics/sales-metrics", {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch sales metrics");
      }
      
      return response.json();
    },
  });
}

export function useProductAnalytics(productId?: string) {
  return useQuery({
    queryKey: ["/api/analytics/products", productId],
    queryFn: async () => {
      const url = productId 
        ? `/api/analytics/products/${productId}`
        : "/api/analytics/products";
        
      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch product analytics");
      }
      
      return response.json();
    },
  });
}
