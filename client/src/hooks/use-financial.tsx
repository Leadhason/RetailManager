import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthHeaders, apiCall } from "@/lib/api";

export interface Transaction {
  id: string;
  type: 'payment' | 'refund' | 'fee';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  orderId?: string;
  paymentMethod: string;
  reference: string;
  createdAt: string;
}

export interface FinancialMetrics {
  totalRevenue: number;
  pendingPayments: number;
  completedTransactions: number;
  failedTransactions: number;
  refunds: number;
  averageOrderValue: number;
  paymentMethodBreakdown: Array<{
    method: string;
    count: number;
    amount: number;
  }>;
  revenueByPeriod: Array<{
    period: string;
    revenue: number;
    transactions: number;
  }>;
}

export function useTransactions(limit?: number, offset?: number) {
  return useQuery<Transaction[]>({
    queryKey: ["/api/financial/transactions", { limit, offset }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (limit) params.append("limit", limit.toString());
      if (offset) params.append("offset", offset.toString());
      
      const response = await fetch(`/api/financial/transactions?${params}`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }
      
      return response.json();
    },
  });
}

export function useFinancialMetrics(dateRange?: { from: Date; to: Date }) {
  return useQuery<FinancialMetrics>({
    queryKey: ["/api/financial/metrics", dateRange],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (dateRange) {
        params.append("from", dateRange.from.toISOString());
        params.append("to", dateRange.to.toISOString());
      }
      
      const response = await fetch(`/api/financial/metrics?${params}`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch financial metrics");
      }
      
      return response.json();
    },
  });
}

export function useProcessRefund() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      transactionId, 
      amount, 
      reason 
    }: { 
      transactionId: string; 
      amount: number; 
      reason: string; 
    }) => {
      return apiCall(`/api/financial/transactions/${transactionId}/refund`, {
        method: "POST",
        body: JSON.stringify({ amount, reason }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/financial"] });
    },
  });
}
