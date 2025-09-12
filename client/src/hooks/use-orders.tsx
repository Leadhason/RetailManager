import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthHeaders, apiCall } from "@/lib/api";
import type { Order } from "@shared/schema";

export function useOrders(limit?: number, offset?: number) {
  return useQuery<Order[]>({
    queryKey: ["/api/orders", { limit, offset }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (limit) params.append("limit", limit.toString());
      if (offset) params.append("offset", offset.toString());
      
      const response = await fetch(`/api/orders?${params}`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }
      
      return response.json();
    },
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ["/api/orders", id],
    queryFn: async () => {
      const response = await fetch(`/api/orders/${id}`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch order");
      }
      
      return response.json();
    },
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (orderData: { order: any; items: any[] }) => {
      return apiCall("/api/orders", {
        method: "POST",
        body: JSON.stringify(orderData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      status, 
      comment 
    }: { 
      id: string; 
      status: string; 
      comment?: string; 
    }) => {
      return apiCall(`/api/orders/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status, comment }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    },
  });
}
