import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Info, CheckCircle } from "lucide-react";
import { useNotifications } from "@/contexts/notification-context";

export default function Alerts() {
  const { notifications, addNotification } = useNotifications();
  
  // Add sample notifications on component mount
  useEffect(() => {
    if (notifications.length === 0) {
      // Add some demo notifications
      addNotification({
        type: "warning",
        title: "Low Stock Alert",
        message: "Professional Drill Set is running low (5 units left)",
        persistent: true,
        actionLabel: "View Inventory",
        actionUrl: "/inventory"
      });
      
      addNotification({
        type: "info",
        title: "New Order Received",
        message: "Order #ORD-2024-004 for GHS 156.99 requires review",
        persistent: true,
        actionLabel: "View Order",
        actionUrl: "/orders"
      });
      
      addNotification({
        type: "success",
        title: "Payment Received",
        message: "Payment for Order #ORD-2024-001 has been processed",
        persistent: true
      });
    }
  }, [addNotification, notifications.length]);
  
  // Get recent notifications for dashboard display
  const recentNotifications = notifications.slice(0, 3);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getAlertBg = (type: string) => {
    switch (type) {
      case 'warning':
        return "bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-800";
      case 'info':
        return "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800";
      case 'success':
        return "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800";
      default:
        return "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800";
    }
  };

  const getAlertTextColor = (type: string) => {
    switch (type) {
      case 'warning':
        return "text-orange-800 dark:text-orange-200";
      case 'info':
        return "text-blue-800 dark:text-blue-200";
      case 'success':
        return "text-green-800 dark:text-green-200";
      default:
        return "text-blue-800 dark:text-blue-200";
    }
  };

  return (
    <Card data-testid="alerts-notifications">
      <CardHeader>
        <CardTitle>Alerts & Notifications</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentNotifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`p-3 border rounded-lg ${getAlertBg(notification.type)}`}
              data-testid={`alert-${notification.id}`}
            >
              <div className="flex items-start space-x-2">
                {getAlertIcon(notification.type)}
                <div className="flex-1">
                  <p className={`text-sm font-medium ${getAlertTextColor(notification.type)}`}>
                    {notification.title}
                  </p>
                  <p className={`text-xs ${getAlertTextColor(notification.type)} opacity-80`}>
                    {notification.message}
                  </p>
                  <p className={`text-xs ${getAlertTextColor(notification.type)} opacity-60 mt-1`}>
                    {new Date(notification.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {recentNotifications.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No recent notifications</p>
            </div>
          )}
        </div>
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            Click the notification bell in the header to view all notifications
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
