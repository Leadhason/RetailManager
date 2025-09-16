import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthHeaders, apiCall } from "@/lib/api";
import type { Inventory, Location } from "@shared/schema";

export function useInventory(locationId?: string) {
  const queryKey = locationId 
    ? ["/api/inventory", `locationId=${locationId}`] 
    : ["/api/inventory"];
  
  return useQuery<Inventory[]>({
    queryKey,
  });
}

export function useLowStockItems(threshold?: number) {
  const queryKey = threshold 
    ? ["/api/inventory/low-stock", `threshold=${threshold}`] 
    : ["/api/inventory/low-stock"];
  
  return useQuery<Inventory[]>({
    queryKey,
  });
}

export function useLocations() {
  return useQuery<Location[]>({
    queryKey: ["/api/locations"],
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
  });
}
