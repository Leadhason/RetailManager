import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Info, CheckCircle } from "lucide-react";

interface Alert {
  id: string;
  type: 'warning' | 'info' | 'success';
  title: string;
  message: string;
  time: string;
}

export default function Alerts() {
  // Sample alerts - in a real app, this would come from props or API
  const alerts: Alert[] = [
    {
      id: "1",
      type: "warning",
      title: "Low Stock Alert",
      message: "Professional Drill Set is running low (5 units left)",
      time: "2 hours ago"
    },
    {
      id: "2",
      type: "info",
      title: "New Order Received",
      message: "Order #ORD-2024-004 for GHS 156.99 requires review",
      time: "15 minutes ago"
    },
    {
      id: "3",
      type: "success",
      title: "Payment Received",
      message: "Payment for Order #ORD-2024-001 has been processed",
      time: "1 hour ago"
    }
  ];

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
          {alerts.map((alert) => (
            <div 
              key={alert.id} 
              className={`p-3 border rounded-lg ${getAlertBg(alert.type)}`}
              data-testid={`alert-${alert.id}`}
            >
              <div className="flex items-start space-x-2">
                {getAlertIcon(alert.type)}
                <div className="flex-1">
                  <p className={`text-sm font-medium ${getAlertTextColor(alert.type)}`}>
                    {alert.title}
                  </p>
                  <p className={`text-xs ${getAlertTextColor(alert.type)} opacity-80`}>
                    {alert.message}
                  </p>
                  <p className={`text-xs ${getAlertTextColor(alert.type)} opacity-60 mt-1`}>
                    {alert.time}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <Button variant="outline" className="w-full mt-4" data-testid="view-all-notifications">
          View All Notifications
        </Button>
      </CardContent>
    </Card>
  );
}
