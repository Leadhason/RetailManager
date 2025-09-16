import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useOrders, useUpdateOrderStatus } from "@/hooks/use-orders";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, Clock, Truck, CheckCircle } from "lucide-react";
import OrderTable from "@/components/orders/order-table";
import OrderDetailsPopover from "@/components/orders/order-details-popover";
import type { Order } from "@shared/schema";

export default function OrdersIndex() {
  const { data: orders = [], isLoading, error, refetch } = useOrders();
  const updateOrderStatus = useUpdateOrderStatus();
  const { toast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const handleRowClick = (order: Order) => {
    setSelectedOrder(order);
    setIsPopoverOpen(true);
  };

  const handleView = (order: Order) => {
    handleRowClick(order);
  };

  const handleEdit = (order: Order) => {
    toast({
      title: "Edit Order",
      description: `Editing ${order.orderNumber} (feature coming soon)`,
    });
  };

  const handleUpdateStatus = async (order: Order) => {
    // Simple status progression for demo
    const statusFlow = {
      'pending': 'processing',
      'processing': 'shipped',
      'shipped': 'delivered'
    };

    const nextStatus = statusFlow[order.status as keyof typeof statusFlow];
    
    if (nextStatus) {
      try {
        await updateOrderStatus.mutateAsync({
          id: order.id,
          status: nextStatus,
          comment: `Status updated to ${nextStatus}`
        });
        toast({
          title: "Success",
          description: `Order status updated to ${nextStatus}`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update order status",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Info",
        description: "No further status updates available for this order",
      });
    }
  };

  if (error) {
    return (
      <div className="space-y-6" data-testid="orders-error">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
            <p className="text-muted-foreground">Manage your customer orders</p>
          </div>
        </div>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to load orders</h3>
            <p className="text-muted-foreground text-center mb-4">
              {error instanceof Error ? error.message : "An unexpected error occurred"}
            </p>
            <Button onClick={() => refetch()} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const processingOrders = orders.filter(o => o.status === 'processing').length;
  const shippedOrders = orders.filter(o => o.status === 'shipped').length;
  const deliveredOrders = orders.filter(o => o.status === 'delivered').length;

  return (
    <div className="space-y-6" data-testid="orders-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">
            Track and manage all customer orders from your online store
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrders}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting processing
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{processingOrders}</div>
            <p className="text-xs text-muted-foreground">
              Currently being prepared
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shipped</CardTitle>
            <Truck className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shippedOrders}</div>
            <p className="text-xs text-muted-foreground">
              Out for delivery
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deliveredOrders}</div>
            <p className="text-xs text-muted-foreground">
              Successfully completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
          <CardDescription>
            View and manage customer orders with real-time status updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OrderTable
            orders={orders}
            onView={handleView}
            onEdit={handleEdit}
            onUpdateStatus={handleUpdateStatus}
            onRowClick={handleRowClick}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Order Details Popover */}
      <OrderDetailsPopover
        order={selectedOrder}
        open={isPopoverOpen}
        onOpenChange={setIsPopoverOpen}
      />
    </div>
  );
}
