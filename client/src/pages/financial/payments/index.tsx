import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Search, DollarSign, CreditCard, Banknote, TrendingUp, CheckCircle, Clock, XCircle, RefreshCw, Receipt, Eye, Loader2 } from "lucide-react";
import { 
  useTransactions, 
  useFinancialSummary, 
  useReceiptByTransaction, 
  useMarkReceiptViewed,
  Transaction,
  TransactionFilters 
} from "@/hooks/use-financial";

interface PaymentMethod {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
  fees: number;
  processingTime: string;
}

export default function PaymentsIndex() {
  const [activeTab, setActiveTab] = useState("transactions");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all");
  const [dateRange, setDateRange] = useState("7days");
  const { toast } = useToast();

  // Calculate date range for filtering
  const dateFilter = useMemo(() => {
    const endDate = new Date();
    let startDate = new Date();
    
    switch (dateRange) {
      case "today":
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        break;
      case "7days":
        startDate.setDate(endDate.getDate() - 7);
        break;
      case "30days":
        startDate.setDate(endDate.getDate() - 30);
        break;
      case "90days":
        startDate.setDate(endDate.getDate() - 90);
        break;
      default:
        startDate = new Date(0); // All time
    }
    
    return { startDate, endDate };
  }, [dateRange]);

  // Build filters for API calls
  const filters: TransactionFilters = useMemo(() => {
    const result: TransactionFilters = {
      startDate: dateFilter.startDate,
      endDate: dateFilter.endDate,
    };
    
    if (statusFilter !== "all") result.status = statusFilter;
    if (paymentMethodFilter !== "all") result.paymentMethod = paymentMethodFilter;
    
    return result;
  }, [dateFilter, statusFilter, paymentMethodFilter]);

  // Real data from API
  const { data: transactions = [], isLoading: transactionsLoading, error: transactionsError } = useTransactions(100, 0, filters);
  const { data: financialSummary, isLoading: summaryLoading } = useFinancialSummary(dateFilter.startDate, dateFilter.endDate);
  const markReceiptViewed = useMarkReceiptViewed();

  // Filter transactions by search term
  const filteredTransactions = useMemo(() => {
    if (!searchTerm) return transactions;
    
    return transactions.filter(transaction => 
      transaction.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transaction.orderId && transaction.orderId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      transaction.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [transactions, searchTerm]);

  const [paymentMethods] = useState<PaymentMethod[]>([
    {
      id: "1",
      name: "Visa/Mastercard",
      type: "Credit/Debit Card",
      isActive: true,
      fees: 3.0,
      processingTime: "Instant"
    },
    {
      id: "2",
      name: "MTN Mobile Money",
      type: "Mobile Payment",
      isActive: true,
      fees: 3.0,
      processingTime: "1-5 minutes"
    },
    {
      id: "3",
      name: "Bank Transfer",
      type: "Electronic Transfer",
      isActive: true,
      fees: 1.5,
      processingTime: "1-3 business days"
    },
    {
      id: "4",
      name: "Cash Payment",
      type: "Physical Payment",
      isActive: true,
      fees: 0.0,
      processingTime: "Instant"
    }
  ]);

  // Receipt viewing functionality
  const handleViewReceipt = async (transactionId: string) => {
    try {
      // This will be implemented when receipt data is available
      toast({
        title: "Receipt Viewer",
        description: "Opening receipt for transaction " + transactionId,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load receipt",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case 'processing':
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case 'pending':
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case 'failed':
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case 'cancelled':
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'card':
        return <CreditCard className="w-4 h-4" />;
      case 'mobile-money':
        return <DollarSign className="w-4 h-4" />;
      case 'bank-transfer':
        return <Banknote className="w-4 h-4" />;
      case 'cash':
        return <Banknote className="w-4 h-4" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const handleRefund = (transaction: Transaction) => {
    toast({
      title: "Process Refund",
      description: `Processing refund for transaction ${transaction.reference}`,
    });
  };

  const handleRetryPayment = (transaction: Transaction) => {
    toast({
      title: "Retry Payment", 
      description: `Retrying payment for transaction ${transaction.reference}`,
    });
  };

  const handleToggleMethod = (method: PaymentMethod) => {
    toast({
      title: "Payment Method Updated",
      description: `${method.name} has been ${method.isActive ? 'disabled' : 'enabled'}`,
    });
  };

  // Add payment method filter
  const handlePaymentMethodChange = (value: string) => {
    setPaymentMethodFilter(value);
  };

  return (
    <div className="space-y-6" data-testid="payments-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payment Management</h1>
          <p className="text-muted-foreground">
            Track payments, manage payment methods, and process refunds
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <TrendingUp className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <RefreshCw className="w-4 h-4 mr-2" />
            Sync Payments
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                `GHS ${financialSummary?.totalRevenue?.toLocaleString() || '0'}`
              )}
            </div>
            <p className="text-xs text-muted-foreground">This period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                financialSummary?.successfulPayments || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">Successful payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                financialSummary?.failedPayments || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">Failed payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing Fees</CardTitle>
            <CreditCard className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                `GHS ${financialSummary?.totalFees?.toFixed(2) || '0.00'}`
              )}
            </div>
            <p className="text-xs text-muted-foreground">Total fees paid</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="methods">Payment Methods</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center space-x-4 space-y-2">
                <div className="relative flex-1 min-w-[300px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search by customer or order ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="search-payments"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={paymentMethodFilter} onValueChange={handlePaymentMethodChange}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                    <SelectItem value="mobile-money">Mobile Money</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Date Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="7days">Last 7 days</SelectItem>
                    <SelectItem value="30days">Last 30 days</SelectItem>
                    <SelectItem value="90days">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Transactions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Transactions</CardTitle>
              <CardDescription>
                {transactionsLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                ) : (
                  `${filteredTransactions.length} transactions found`
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr className="text-left">
                        <th className="p-3 font-medium">Order ID</th>
                        <th className="p-3 font-medium">Customer</th>
                        <th className="p-3 font-medium">Amount</th>
                        <th className="p-3 font-medium">Method</th>
                        <th className="p-3 font-medium">Status</th>
                        <th className="p-3 font-medium">Date</th>
                        <th className="p-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactionsLoading ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center">
                            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                            <p className="text-muted-foreground">Loading transactions...</p>
                          </td>
                        </tr>
                      ) : filteredTransactions.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center">
                            <p className="text-muted-foreground">No transactions found</p>
                          </td>
                        </tr>
                      ) : (
                        filteredTransactions.map((transaction) => (
                          <tr key={transaction.id} className="border-b hover:bg-muted/50">
                            <td className="p-3">
                              <div className="font-medium">{transaction.orderId || 'N/A'}</div>
                              <div className="text-sm text-muted-foreground">
                                {transaction.reference}
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="text-sm text-muted-foreground">
                                {transaction.customerId ? `Customer ${transaction.customerId.slice(0, 8)}...` : 'Guest'}
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="font-medium">GHS {parseFloat(transaction.amount || '0').toFixed(2)}</div>
                              {parseFloat(transaction.fees || '0') > 0 && (
                                <div className="text-sm text-muted-foreground">
                                  Fee: GHS {parseFloat(transaction.fees).toFixed(2)}
                                </div>
                              )}
                            </td>
                            <td className="p-3">
                              <div className="flex items-center space-x-2">
                                {getMethodIcon(transaction.paymentMethod)}
                                <span className="capitalize">{transaction.paymentMethod.replace('-', ' ')}</span>
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(transaction.status)}
                                <Badge className={getStatusColor(transaction.status)}>
                                  {transaction.status}
                                </Badge>
                              </div>
                            </td>
                            <td className="p-3">
                              {new Date(transaction.createdAt).toLocaleDateString()}
                            </td>
                            <td className="p-3">
                              <div className="flex items-center space-x-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewReceipt(transaction.id)}
                                  data-testid={`view-receipt-${transaction.id}`}
                                >
                                  <Receipt className="w-4 h-4 mr-1" />
                                  Receipt
                                </Button>
                                {transaction.status === 'completed' && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRefund(transaction)}
                                  >
                                    Refund
                                  </Button>
                                )}
                                {transaction.status === 'failed' && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRetryPayment(transaction)}
                                  >
                                    Retry
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="methods" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Configure available payment options for customers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <CreditCard className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <h4 className="font-medium">{method.name}</h4>
                          <p className="text-sm text-muted-foreground">{method.type}</p>
                        </div>
                      </div>
                      <Badge variant={method.isActive ? "default" : "secondary"}>
                        {method.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right text-sm">
                        <div>Fee: {method.fees}%</div>
                        <div className="text-muted-foreground">{method.processingTime}</div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleMethod(method)}
                      >
                        {method.isActive ? "Disable" : "Enable"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Analytics</CardTitle>
              <CardDescription>Insights into payment patterns and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Payment Analytics Coming Soon</h3>
                <p className="text-muted-foreground">
                  Detailed payment insights and trends will be available here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}