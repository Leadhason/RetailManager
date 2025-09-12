import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthHeaders, apiCall } from "@/lib/api";
import type { EmailCampaign } from "@shared/schema";

export function useEmailCampaigns() {
  return useQuery<EmailCampaign[]>({
    queryKey: ["/api/email-campaigns"],
    queryFn: async () => {
      const response = await fetch("/api/email-campaigns", {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch email campaigns");
      }
      
      return response.json();
    },
  });
}

export function useCreateEmailCampaign() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (campaignData: any) => {
      return apiCall("/api/email-campaigns", {
        method: "POST",
        body: JSON.stringify(campaignData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/email-campaigns"] });
    },
  });
}

export function useSendCampaign() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (campaignId: string) => {
      return apiCall(`/api/email-campaigns/${campaignId}/send`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/email-campaigns"] });
    },
  });
}

export function useMarketingMetrics() {
  return useQuery({
    queryKey: ["/api/marketing/metrics"],
    queryFn: async () => {
      const response = await fetch("/api/marketing/metrics", {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch marketing metrics");
      }
      
      return response.json();
    },
  });
}
