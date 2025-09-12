import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthHeaders, apiCall } from "@/lib/api";
import type { Supplier } from "@shared/schema";

export function useSuppliers() {
  return useQuery<Supplier[]>({
    queryKey: ["/api/suppliers"],
    queryFn: async () => {
      const response = await fetch("/api/suppliers", {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch suppliers");
      }
      
      return response.json();
    },
  });
}

export function useSupplier(id: string) {
  return useQuery<Supplier>({
    queryKey: ["/api/suppliers", id],
    queryFn: async () => {
      const response = await fetch(`/api/suppliers/${id}`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch supplier");
      }
      
      return response.json();
    },
    enabled: !!id,
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (supplierData: any) => {
      return apiCall("/api/suppliers", {
        method: "POST",
        body: JSON.stringify(supplierData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/suppliers"] });
    },
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      return apiCall(`/api/suppliers/${id}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/suppliers"] });
    },
  });
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      return apiCall(`/api/suppliers/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/suppliers"] });
    },
  });
}
