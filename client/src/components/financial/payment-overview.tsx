import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from "recharts";
import { CreditCard, DollarSign, TrendingUp, AlertCircle } from "lucide-react";

interface PaymentOverviewProps {
  metrics: {
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
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function PaymentOverview({ metrics }: PaymentOverviewProps) {
  const successRate = metrics.completedTransactions / 
    (metrics.completedTransactions + metrics.failedTransactions) * 100;

  return (
    <div className="space-y-6" data-testid="payment-overview">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">GHS {metrics.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">From completed transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              GHS {metrics.pendingPayments.toLocaleString()}
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
            <div className="text-2xl font-bold text-green-600">{successRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {metrics.completedTransactions} of {metrics.completedTransactions + metrics.failedTransactions} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">GHS {metrics.averageOrderValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Per completed transaction</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics.paymentMethodBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ method, percentage }) => `${method}: ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {metrics.paymentMethodBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`GHS ${value}`, 'Amount']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {metrics.paymentMethodBreakdown.map((method, index) => (
                <div key={method.method} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm">{method.method}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">GHS {method.amount.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">{method.count} transactions</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.revenueByPeriod}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      `GHS ${value}`,
                      name === 'revenue' ? 'Revenue' : 'Transactions'
                    ]}
                  />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Status Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction Status Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{metrics.completedTransactions}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
              <Badge className="mt-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                Success
              </Badge>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {Math.round(metrics.pendingPayments / metrics.averageOrderValue)}
              </div>
              <div className="text-sm text-muted-foreground">Pending</div>
              <Badge className="mt-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                Processing
              </Badge>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{metrics.failedTransactions}</div>
              <div className="text-sm text-muted-foreground">Failed</div>
              <Badge className="mt-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                Error
              </Badge>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{metrics.refunds}</div>
              <div className="text-sm text-muted-foreground">Refunds</div>
              <Badge className="mt-1 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">
                Refunded
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
