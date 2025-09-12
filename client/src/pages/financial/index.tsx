import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTransactions, useFinancialMetrics, useProcessRefund } from "@/hooks/use-financial";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { CalendarIcon, DollarSign, CreditCard, TrendingUp, Download, RefreshCw, AlertCircle } from "lucide-react";
import TransactionTable from "@/components/financial/transaction-table";
import PaymentOverview from "@/components/financial/payment-overview";

export default function FinancialIndex() {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  });
  const [activeTab, setActiveTab] = useState("overview");
  
  const { data: transactions = [], isLoading: transactionsLoading, error: transactionsError, refetch } = useTransactions();
  const { data: financialMetrics, isLoading: metricsLoading, error: metricsError } = useFinancialMetrics(dateRange);
  const processRefund = useProcessRefund();
  const { toast } = useToast();

  const handleViewTransaction = (transaction: any) => {
    toast({
      title: "Transaction Details",
      description: `Viewing details for transaction ${transaction.reference}`,
    });
  };

  const handleProcessRefund = async (transaction: any) => {
    try {
      await processRefund.mutateAsync({
        transactionId: transaction.id,
        amount: transaction.amount,
        reason: "Customer request"
      });
      toast({
        title: "Refund Processed",
        description: `Refund of ${transaction.currency} ${transaction.amount} has been processed`,
      });
    } catch (error) {
      toast({
        title: "Refund Failed",
        description: "Failed to process refund. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExportTransactions = () => {
    toast({
      title: "Export Started",
      description: "Transaction data export is being prepared",
    });
  };

  const handleRefreshData = () => {
    refetch();
    toast({
      title: "Data Refreshed",
      description: "Financial data has been updated",
    });
  };

  if (transactionsError || metricsError) {
    return (
      <div className="space-y-6" data-testid="financial-error">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Financial</h1>
            <p className="text-muted-foreground">Payment processing and financial management</p>
          </div>
        </div>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to load financial data</h3>
            <p className="text-muted-foreground text-center mb-4">
              {(transactionsError || metricsError) instanceof Error 
                ? (transactionsError || metricsError)?.message 
                : "An unexpected error occurred"}
            </p>
            <Button onClick={handleRefreshData} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Sample financial metrics for display
  const sampleMetrics = {
    totalRevenue: 125000,
    pendingPayments: 5400,
    completedTransactions: 1247,
    failedTransactions: 23,
    refunds: 12000,
    averageOrderValue: 127.50,
    paymentMethodBreakdown: [
      { method: "Credit Card", count: 856, amount: 95000 },
      { method: "Mobile Money", count: 245, amount: 20000 },
      { method: "Bank Transfer", count: 146, amount: 10000 }
    ],
    revenueByPeriod: [
      { period: "Jan", revenue: 15000, transactions: 120 },
      { period: "Feb", revenue: 18000, transactions: 145 },
      { period: "Mar", revenue: 22000, transactions: 178 },
      { period: "Apr", revenue: 19000, transactions: 156 },
      { period: "May", revenue: 25000, transactions: 201 },
      { period: "Jun", revenue: 26000, transactions: 215 }
    ]
  };

  // Sample transactions for display
  const sampleTransactions = [
    {
      id: "1",
      type: "payment" as const,
      amount: 127.50,
      currency: "GHS",
      status: "completed" as const,
      orderId: "ORD-2024-001",
      paymentMethod: "Credit Card",
      reference: "TXN-001",
      createdAt: new Date().toISOString()
    },
    {
      id: "2", 
      type: "payment" as const,
      amount: 89.99,
      currency: "GHS",
      status: "pending" as const,
      orderId: "ORD-2024-002",
      paymentMethod: "Mobile Money",
      reference: "TXN-002",
      createdAt: new Date().toISOString()
    },
    {
      id: "3",
      type: "refund" as const,
      amount: 45.00,
      currency: "GHS", 
      status: "completed" as const,
      orderId: "ORD-2024-003",
      paymentMethod: "Credit Card",
      reference: "TXN-003",
      createdAt: new Date().toISOString()
    }
  ];

  return (
    <div className="space-y-6" data-testid="financial-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial</h1>
          <p className="text-muted-foreground">
            Payment processing, transactions, and financial reporting
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleRefreshData} data-testid="refresh-financial">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleExportTransactions} data-testid="export-financial">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">GHS {sampleMetrics.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12.5%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              GHS {sampleMetrics.pendingPayments.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {((sampleMetrics.completedTransactions / (sampleMetrics.completedTransactions + sampleMetrics.failedTransactions)) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {sampleMetrics.completedTransactions} of {sampleMetrics.completedTransactions + sampleMetrics.failedTransactions} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">GHS {sampleMetrics.averageOrderValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+4.1%</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Date Range Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Date Range</CardTitle>
          <CardDescription>Select the time period for financial data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className="w-[300px] justify-start text-left font-normal"
                  data-testid="date-range-picker"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="payments">Payment Methods</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <PaymentOverview metrics={financialMetrics || sampleMetrics} />
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                View and manage all payment transactions and refunds
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TransactionTable
                transactions={transactions.length > 0 ? transactions : sampleTransactions}
                onView={handleViewTransaction}
                onRefund={handleProcessRefund}
                onExport={handleExportTransactions}
                isLoading={transactionsLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Configure and manage payment processing options</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-2 border-primary">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center">
                        <CreditCard className="mr-2 h-5 w-5" />
                        Credit Cards
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">Accept Visa, Mastercard, and more</p>
                      <div className="text-2xl font-bold text-green-600">Active</div>
                      <Button variant="outline" size="sm" className="mt-3" data-testid="configure-cards">
                        Configure
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center">
                        <DollarSign className="mr-2 h-5 w-5" />
                        Mobile Money
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">MTN, Vodafone, AirtelTigo</p>
                      <div className="text-2xl font-bold text-green-600">Active</div>
                      <Button variant="outline" size="sm" className="mt-3" data-testid="configure-mobile">
                        Configure
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center">
                        <TrendingUp className="mr-2 h-5 w-5" />
                        Bank Transfer
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">Direct bank transfers</p>
                      <div className="text-2xl font-bold text-yellow-600">Pending</div>
                      <Button variant="outline" size="sm" className="mt-3" data-testid="configure-bank">
                        Configure
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Payment Processing</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-2">Transaction Fees</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Credit Cards</span>
                            <span>2.9% + GHS 0.30</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Mobile Money</span>
                            <span>1.5%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Bank Transfer</span>
                            <span>GHS 2.00</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Settlement</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Settlement Period</span>
                            <span>T+2 days</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Next Settlement</span>
                            <span>Tomorrow</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Pending Settlement</span>
                            <span>GHS 12,450</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Financial Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button variant="outline" className="w-full justify-start" data-testid="revenue-report">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Revenue Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start" data-testid="transaction-report">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Transaction Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start" data-testid="refund-report">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refund Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start" data-testid="tax-report">
                    <DollarSign className="mr-2 h-4 w-4" />
                    Tax Report
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Export Options</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button variant="outline" className="w-full justify-start" data-testid="export-csv">
                    <Download className="mr-2 h-4 w-4" />
                    Export to CSV
                  </Button>
                  <Button variant="outline" className="w-full justify-start" data-testid="export-pdf">
                    <Download className="mr-2 h-4 w-4" />
                    Export to PDF
                  </Button>
                  <Button variant="outline" className="w-full justify-start" data-testid="export-excel">
                    <Download className="mr-2 h-4 w-4" />
                    Export to Excel
                  </Button>
                  <Button variant="outline" className="w-full justify-start" data-testid="schedule-report">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    Schedule Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
