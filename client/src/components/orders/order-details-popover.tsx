import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useOrder } from "@/hooks/use-orders";
import { CalendarDays, CreditCard, MapPin, Package, Truck, User } from "lucide-react";
import type { Order } from "@shared/schema";

interface OrderDetailsPopoverProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case 'processing':
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    case 'shipped':
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
    case 'delivered':
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case 'cancelled':
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    case 'refunded':
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  }
};

const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case 'paid':
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case 'pending':
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case 'failed':
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    case 'refunded':
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  }
};

export default function OrderDetailsPopover({ 
  order, 
  open, 
  onOpenChange 
}: OrderDetailsPopoverProps) {
  const { data: detailedOrder, isLoading } = useOrder(order?.id || "");

  if (!order) return null;

  const orderToShow = detailedOrder || order;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="order-details-popover">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">
              Order Details
            </DialogTitle>
            <div className="flex items-center gap-3">
              <Badge className={getStatusColor(orderToShow.status || 'pending')}>
                {orderToShow.status || 'pending'}
              </Badge>
              <Badge className={getPaymentStatusColor(orderToShow.paymentStatus || 'pending')}>
                {orderToShow.paymentStatus || 'pending'}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <div className="h-24 bg-muted rounded-lg animate-pulse" />
            <div className="h-32 bg-muted rounded-lg animate-pulse" />
            <div className="h-24 bg-muted rounded-lg animate-pulse" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Package className="h-5 w-5 text-blue-500" />
                    Order Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Order Number</span>
                    <span className="font-mono font-medium">{orderToShow.orderNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Date Placed</span>
                    <span className="text-sm">{orderToShow.createdAt ? new Date(orderToShow.createdAt).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Amount</span>
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">
                      GHS {Number(orderToShow.totalAmount || 0).toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="h-5 w-5 text-green-500" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Customer</span>
                    <span className="text-sm">Guest Customer</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Email</span>
                    <span className="text-sm">{orderToShow.customerEmail || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Phone</span>
                    <span className="text-sm">{orderToShow.customerPhone || 'Not provided'}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Shipping & Payment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-l-4 border-l-purple-500">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MapPin className="h-5 w-5 text-purple-500" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    <p>{orderToShow.shippingAddress?.street || 'Address not provided'}</p>
                    {orderToShow.shippingAddress?.city && (
                      <p>{orderToShow.shippingAddress.city}, {orderToShow.shippingAddress.state} {orderToShow.shippingAddress.zipCode}</p>
                    )}
                    {orderToShow.shippingAddress?.country && (
                      <p>{orderToShow.shippingAddress.country}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-orange-500">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CreditCard className="h-5 w-5 text-orange-500" />
                    Payment Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Payment Method</span>
                    <span className="text-sm">{orderToShow.paymentMethod || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Payment Status</span>
                    <Badge className={getPaymentStatusColor(orderToShow.paymentStatus || 'pending')}>
                      {orderToShow.paymentStatus || 'pending'}
                    </Badge>
                  </div>
                  {orderToShow.transactionId && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Transaction ID</span>
                      <span className="text-sm font-mono">{orderToShow.transactionId}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Order Items */}
            {detailedOrder?.items && detailedOrder.items.length > 0 && (
              <Card className="border-l-4 border-l-indigo-500">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Package className="h-5 w-5 text-indigo-500" />
                    Order Items ({detailedOrder.items.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {detailedOrder.items.map((item: any, index: number) => (
                      <div key={index}>
                        <div className="flex justify-between items-center py-2">
                          <div className="flex-1">
                            <p className="font-medium">{item.productName || `Item ${index + 1}`}</p>
                            <p className="text-sm text-muted-foreground">
                              Quantity: {item.quantity} × GHS {Number(item.unitPrice || 0).toFixed(2)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">GHS {Number(item.totalPrice || 0).toFixed(2)}</p>
                          </div>
                        </div>
                        {index < detailedOrder.items.length - 1 && <Separator />}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Order Timeline */}
            {orderToShow.notes && (
              <Card className="border-l-4 border-l-gray-500">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CalendarDays className="h-5 w-5 text-gray-500" />
                    Order Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{orderToShow.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}