import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Search, DollarSign, CreditCard, Banknote, TrendingUp, CheckCircle, Clock, XCircle, RefreshCw } from "lucide-react";

interface Payment {
  id: string;
  orderId: string;
  customerName: string;
  amount: number;
  method: 'card' | 'bank-transfer' | 'mobile-money' | 'cash';
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  date: string;
  transactionId?: string;
  fees: number;
}

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
  const [dateRange, setDateRange] = useState("7days");
  const { toast } = useToast();

  const [payments] = useState<Payment[]>([
    {
      id: "1",
      orderId: "ORD-001",
      customerName: "John Doe",
      amount: 450.00,
      method: "card",
      status: "completed",
      date: "2024-01-15",
      transactionId: "txn_12345",
      fees: 13.50
    },
    {
      id: "2",
      orderId: "ORD-002",
      customerName: "Jane Smith",
      amount: 280.00,
      method: "mobile-money",
      status: "pending",
      date: "2024-01-15",
      transactionId: "momo_67890",
      fees: 8.40
    },
    {
      id: "3",
      orderId: "ORD-003",
      customerName: "Mike Johnson",
      amount: 750.00,
      method: "bank-transfer",
      status: "failed",
      date: "2024-01-14",
      transactionId: "bank_54321",
      fees: 0.00
    },
    {
      id: "4",
      orderId: "ORD-004",
      customerName: "Sarah Wilson",
      amount: 125.00,
      method: "cash",
      status: "completed",
      date: "2024-01-14",
      fees: 0.00
    }
  ]);

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

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.orderId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return "bg-green-100 text-green-800";
      case 'pending':
        return "bg-yellow-100 text-yellow-800";
      case 'failed':
        return "bg-red-100 text-red-800";
      case 'refunded':
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
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
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'refunded':
        return <RefreshCw className="w-4 h-4 text-gray-500" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const handleRefund = (payment: Payment) => {
    toast({
      title: "Process Refund",
      description: `Processing refund for ${payment.orderId} (feature coming soon)`,
    });
  };

  const handleRetryPayment = (payment: Payment) => {
    toast({
      title: "Retry Payment",
      description: `Retrying payment for ${payment.orderId} (feature coming soon)`,
    });
  };

  const handleToggleMethod = (method: PaymentMethod) => {
    toast({
      title: "Payment Method Updated",
      description: `${method.name} has been ${method.isActive ? 'disabled' : 'enabled'}`,
    });
  };

  // Calculate summary metrics
  const totalAmount = payments.reduce((sum, p) => sum + (p.status === 'completed' ? p.amount : 0), 0);
  const completedPayments = payments.filter(p => p.status === 'completed').length;
  const pendingPayments = payments.filter(p => p.status === 'pending').length;
  const totalFees = payments.reduce((sum, p) => sum + (p.status === 'completed' ? p.fees : 0), 0);

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
            <div className="text-2xl font-bold">GHS {totalAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedPayments}</div>
            <p className="text-xs text-muted-foreground">Successful payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingPayments}</div>
            <p className="text-xs text-muted-foreground">Awaiting processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing Fees</CardTitle>
            <CreditCard className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">GHS {totalFees.toFixed(2)}</div>
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
                {filteredPayments.length} of {payments.length} transactions
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
                      {filteredPayments.map((payment) => (
                        <tr key={payment.id} className="border-b hover:bg-muted/50">
                          <td className="p-3">
                            <div className="font-medium">{payment.orderId}</div>
                            {payment.transactionId && (
                              <div className="text-sm text-muted-foreground">
                                {payment.transactionId}
                              </div>
                            )}
                          </td>
                          <td className="p-3">{payment.customerName}</td>
                          <td className="p-3">
                            <div className="font-medium">GHS {payment.amount.toFixed(2)}</div>
                            {payment.fees > 0 && (
                              <div className="text-sm text-muted-foreground">
                                Fee: GHS {payment.fees.toFixed(2)}
                              </div>
                            )}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center space-x-2">
                              {getMethodIcon(payment.method)}
                              <span className="capitalize">{payment.method.replace('-', ' ')}</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(payment.status)}
                              <Badge className={getStatusColor(payment.status)}>
                                {payment.status}
                              </Badge>
                            </div>
                          </td>
                          <td className="p-3">{payment.date}</td>
                          <td className="p-3">
                            <div className="flex items-center space-x-1">
                              {payment.status === 'completed' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRefund(payment)}
                                >
                                  Refund
                                </Button>
                              )}
                              {payment.status === 'failed' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRetryPayment(payment)}
                                >
                                  Retry
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
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