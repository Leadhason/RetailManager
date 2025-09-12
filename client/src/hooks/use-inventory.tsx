import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthHeaders, apiCall } from "@/lib/api";
import type { Inventory, Location } from "@shared/schema";

export function useInventory(locationId?: string) {
  return useQuery<Inventory[]>({
    queryKey: ["/api/inventory", { locationId }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (locationId) params.append("locationId", locationId);
      
      const response = await fetch(`/api/inventory?${params}`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch inventory");
      }
      
      return response.json();
    },
  });
}

export function useLowStockItems(threshold?: number) {
  return useQuery<Inventory[]>({
    queryKey: ["/api/inventory/low-stock", { threshold }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (threshold) params.append("threshold", threshold.toString());
      
      const response = await fetch(`/api/inventory/low-stock?${params}`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch low stock items");
      }
      
      return response.json();
    },
  });
}

export function useLocations() {
  return useQuery<Location[]>({
    queryKey: ["/api/locations"],
    queryFn: async () => {
      const response = await fetch("/api/locations", {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch locations");
      }
      
      return response.json();
    },
  });
}

export function useUpdateInventory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      productId, 
      locationId, 
      updates 
    }: { 
      productId: string; 
      locationId: string; 
      updates: any; 
    }) => {
      return apiCall(`/api/inventory/${productId}/${locationId}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
    },
  });
}

export function useInventoryMetrics() {
  return useQuery({
    queryKey: ["/api/inventory/metrics"],
    queryFn: async () => {
      const response = await fetch("/api/inventory/metrics", {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch inventory metrics");
      }
      
      return response.json();
    },
  });
}
