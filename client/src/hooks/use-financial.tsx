import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthHeaders, apiCall } from "@/lib/api";

// Updated types to match backend schema
export interface Transaction {
  id: string;
  orderId?: string;
  customerId?: string;
  type: 'payment' | 'refund' | 'fee' | 'adjustment';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  amount: string;
  currency: string;
  paymentMethod: string;
  paymentProvider?: string;
  reference: string;
  externalReference?: string;
  gatewayResponse?: any;
  fees: string;
  netAmount?: string;
  notes?: string;
  failureReason?: string;
  refundedAmount: string;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Receipt {
  id: string;
  transactionId: string;
  orderId: string;
  customerId: string;
  receiptNumber: string;
  status: 'generated' | 'sent' | 'viewed';
  receiptData: any;
  pdfPath?: string;
  emailSentAt?: string;
  viewedAt?: string;
  printedAt?: string;
  createdAt: string;
}

export interface TaxRecord {
  id: string;
  period: string;
  taxType: 'VAT' | 'Income Tax' | 'PAYE' | 'NHIL' | 'GETFUND';
  status: string;
  amount: string;
  paidAmount: string;
  dueDate: string;
  filedDate?: string;
  paidDate?: string;
  taxCalculation?: any;
  filingReference?: string;
  notes?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FinancialSummary {
  totalRevenue: number;
  totalTransactions: number;
  successfulPayments: number;
  failedPayments: number;
  totalFees: number;
  netRevenue: number;
  averageOrderValue: number;
  paymentMethodBreakdown: Array<{
    method: string;
    count: number;
    amount: number;
  }>;
}

export interface TransactionFilters {
  startDate?: Date;
  endDate?: Date;
  status?: string;
  paymentMethod?: string;
  customerId?: string;
  orderId?: string;
}

export interface ReceiptFilters {
  startDate?: Date;
  endDate?: Date;
  status?: string;
  customerId?: string;
  orderId?: string;
}

// Transactions
export function useTransactions(limit?: number, offset?: number, filters?: TransactionFilters) {
  return useQuery<Transaction[]>({
    queryKey: ["/api/financial/transactions", { limit, offset, filters }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (limit) params.append("limit", limit.toString());
      if (offset) params.append("offset", offset.toString());
      if (filters?.startDate) params.append("startDate", filters.startDate.toISOString());
      if (filters?.endDate) params.append("endDate", filters.endDate.toISOString());
      if (filters?.status) params.append("status", filters.status);
      if (filters?.paymentMethod) params.append("paymentMethod", filters.paymentMethod);
      if (filters?.customerId) params.append("customerId", filters.customerId);
      if (filters?.orderId) params.append("orderId", filters.orderId);
      
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

export function useTransaction(id: string) {
  return useQuery<Transaction>({
    queryKey: ["/api/financial/transactions", id],
    queryFn: async () => {
      const response = await fetch(`/api/financial/transactions/${id}`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch transaction");
      }
      
      return response.json();
    },
    enabled: !!id,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (transactionData: Partial<Transaction>) => {
      return apiCall("/api/financial/transactions", {
        method: "POST",
        body: JSON.stringify(transactionData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/financial/transactions"] });
    },
  });
}

export function useUpdateTransactionStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status, failureReason }: { 
      id: string; 
      status: string; 
      failureReason?: string; 
    }) => {
      return apiCall(`/api/financial/transactions/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status, failureReason }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/financial/transactions"] });
    },
  });
}

// Receipts
export function useReceipts(limit?: number, offset?: number, filters?: ReceiptFilters) {
  return useQuery<Receipt[]>({
    queryKey: ["/api/financial/receipts", { limit, offset, filters }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (limit) params.append("limit", limit.toString());
      if (offset) params.append("offset", offset.toString());
      if (filters?.startDate) params.append("startDate", filters.startDate.toISOString());
      if (filters?.endDate) params.append("endDate", filters.endDate.toISOString());
      if (filters?.status) params.append("status", filters.status);
      if (filters?.customerId) params.append("customerId", filters.customerId);
      if (filters?.orderId) params.append("orderId", filters.orderId);
      
      const response = await fetch(`/api/financial/receipts?${params}`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch receipts");
      }
      
      return response.json();
    },
  });
}

export function useReceipt(id: string) {
  return useQuery<Receipt>({
    queryKey: ["/api/financial/receipts", id],
    queryFn: async () => {
      const response = await fetch(`/api/financial/receipts/${id}`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch receipt");
      }
      
      return response.json();
    },
    enabled: !!id,
  });
}

export function useReceiptByTransaction(transactionId: string) {
  return useQuery<Receipt>({
    queryKey: ["/api/financial/receipts/transaction", transactionId],
    queryFn: async () => {
      const response = await fetch(`/api/financial/receipts/transaction/${transactionId}`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch receipt for transaction");
      }
      
      return response.json();
    },
    enabled: !!transactionId,
  });
}

export function useMarkReceiptViewed() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (receiptId: string) => {
      return apiCall(`/api/financial/receipts/${receiptId}/viewed`, {
        method: "PUT",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/financial/receipts"] });
    },
  });
}

// Tax Records
export function useTaxRecords(period?: string, taxType?: string) {
  return useQuery<TaxRecord[]>({
    queryKey: ["/api/financial/tax-records", { period, taxType }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (period) params.append("period", period);
      if (taxType) params.append("taxType", taxType);
      
      const response = await fetch(`/api/financial/tax-records?${params}`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch tax records");
      }
      
      return response.json();
    },
  });
}

export function useCreateTaxRecord() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (taxRecordData: Partial<TaxRecord>) => {
      return apiCall("/api/financial/tax-records", {
        method: "POST",
        body: JSON.stringify(taxRecordData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/financial/tax-records"] });
    },
  });
}

// Financial Summary
export function useFinancialSummary(startDate?: Date, endDate?: Date) {
  return useQuery<FinancialSummary>({
    queryKey: ["/api/financial/summary", { startDate, endDate }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate.toISOString());
      if (endDate) params.append("endDate", endDate.toISOString());
      
      const response = await fetch(`/api/financial/summary?${params}`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch financial summary");
      }
      
      return response.json();
    },
  });
}

// Legacy hook for backward compatibility
export function useFinancialMetrics(dateRange?: { from: Date; to: Date }) {
  return useFinancialSummary(dateRange?.from, dateRange?.to);
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
