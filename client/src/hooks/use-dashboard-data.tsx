import { useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/lib/api";
import type { DashboardMetrics } from "@/types";

export function useDashboardData() {
  return useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard/metrics"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/metrics", {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard metrics");
      }
      
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}
