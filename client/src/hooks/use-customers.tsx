import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthHeaders, apiCall } from "@/lib/api";
import type { Customer } from "@shared/schema";

export function useCustomers(limit?: number, offset?: number) {
  return useQuery<Customer[]>({
    queryKey: ["/api/customers", { limit, offset }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (limit) params.append("limit", limit.toString());
      if (offset) params.append("offset", offset.toString());
      
      const response = await fetch(`/api/customers?${params}`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch customers");
      }
      
      return response.json();
    },
  });
}

export function useCustomer(id: string) {
  return useQuery<Customer>({
    queryKey: ["/api/customers", id],
    queryFn: async () => {
      const response = await fetch(`/api/customers/${id}`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch customer");
      }
      
      return response.json();
    },
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (customerData: any) => {
      return apiCall("/api/customers", {
        method: "POST",
        body: JSON.stringify(customerData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      return apiCall(`/api/customers/${id}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      return apiCall(`/api/customers/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
    },
  });
}
