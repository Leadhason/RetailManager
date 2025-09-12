import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import type { DashboardMetrics } from "@/types";

interface RecentOrdersProps {
  orders: DashboardMetrics['recentOrders'];
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'shipped':
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case 'processing':
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    case 'pending':
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case 'delivered':
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300";
    case 'cancelled':
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  }
};

export default function RecentOrders({ orders }: RecentOrdersProps) {
  return (
    <Card data-testid="recent-orders">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Orders</CardTitle>
          <Link href="/orders">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-sm font-medium text-muted-foreground">Order ID</th>
                  <th className="text-left py-2 text-sm font-medium text-muted-foreground">Customer</th>
                  <th className="text-left py-2 text-sm font-medium text-muted-foreground">Amount</th>
                  <th className="text-left py-2 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-2 text-sm font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-border" data-testid={`order-row-${order.id}`}>
                    <td className="py-3 text-sm font-medium">{order.orderNumber}</td>
                    <td className="py-3 text-sm">{order.customerName}</td>
                    <td className="py-3 text-sm font-medium">GHS {order.totalAmount.toLocaleString()}</td>
                    <td className="py-3">
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No orders found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
