import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Package, TrendingDown } from "lucide-react";

interface StockAlert {
  id: string;
  productName: string;
  sku: string;
  locationName: string;
  currentStock: number;
  reorderLevel: number;
  reorderQuantity: number;
  daysUntilStockout: number;
  severity: 'critical' | 'warning' | 'low';
}

interface StockAlertsProps {
  alerts: StockAlert[];
  onReorder?: (alert: StockAlert) => void;
  onAdjustLevel?: (alert: StockAlert) => void;
}

const getSeverityConfig = (severity: string) => {
  switch (severity) {
    case 'critical':
      return {
        color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
        icon: AlertTriangle,
        iconColor: "text-red-500"
      };
    case 'warning':
      return {
        color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
        icon: TrendingDown,
        iconColor: "text-yellow-500"
      };
    case 'low':
      return {
        color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
        icon: Package,
        iconColor: "text-blue-500"
      };
    default:
      return {
        color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
        icon: Package,
        iconColor: "text-gray-500"
      };
  }
};

export default function StockAlerts({ alerts, onReorder, onAdjustLevel }: StockAlertsProps) {
  const criticalAlerts = alerts.filter(a => a.severity === 'critical');
  const warningAlerts = alerts.filter(a => a.severity === 'warning');
  const lowStockAlerts = alerts.filter(a => a.severity === 'low');

  return (
    <div className="space-y-6" data-testid="stock-alerts">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalAlerts.length}</div>
            <p className="text-xs text-muted-foreground">Immediate attention required</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warning Alerts</CardTitle>
            <TrendingDown className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{warningAlerts.length}</div>
            <p className="text-xs text-muted-foreground">Action needed soon</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{lowStockAlerts.length}</div>
            <p className="text-xs text-muted-foreground">Monitor closely</p>
          </CardContent>
        </Card>
      </div>

      {/* Alert List */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          {alerts.length > 0 ? (
            <div className="space-y-4">
              {alerts.map((alert) => {
                const config = getSeverityConfig(alert.severity);
                const Icon = config.icon;

                return (
                  <div 
                    key={alert.id} 
                    className="flex items-center justify-between p-4 border rounded-lg"
                    data-testid={`alert-${alert.id}`}
                  >
                    <div className="flex items-center space-x-4">
                      <Icon className={`h-5 w-5 ${config.iconColor}`} />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{alert.productName}</h4>
                          <Badge className={config.color}>
                            {alert.severity.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          SKU: {alert.sku} • Location: {alert.locationName}
                        </p>
                        <div className="text-sm text-muted-foreground mt-1">
                          Current: {alert.currentStock} units • Reorder at: {alert.reorderLevel} units
                          {alert.daysUntilStockout > 0 && (
                            <span className="text-orange-600 font-medium ml-2">
                              • {alert.daysUntilStockout} days until stockout
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {onReorder && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => onReorder(alert)}
                          data-testid={`reorder-${alert.id}`}
                        >
                          Reorder ({alert.reorderQuantity} units)
                        </Button>
                      )}
                      {onAdjustLevel && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => onAdjustLevel(alert)}
                          data-testid={`adjust-${alert.id}`}
                        >
                          Adjust Level
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Stock Alerts</h3>
              <p className="text-muted-foreground">All inventory levels are healthy!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
