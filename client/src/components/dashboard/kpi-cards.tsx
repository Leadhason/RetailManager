import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import type { DashboardMetrics } from "@/types";

interface KPICardsProps {
  metrics: DashboardMetrics;
}

export default function KPICards({ metrics }: KPICardsProps) {
  const cards = [
    {
      title: "Total Revenue",
      value: `GHS ${metrics.totalRevenue.toLocaleString()}`,
      change: "+12.5% from last month",
      icon: "💰",
      trend: "up",
      bgColor: "bg-green-100 dark:bg-green-900",
      iconColor: "text-green-600"
    },
    {
      title: "Total Orders",
      value: metrics.totalOrders.toLocaleString(),
      change: "+8.2% from last month",
      icon: "🛒",
      trend: "up",
      bgColor: "bg-blue-100 dark:bg-blue-900",
      iconColor: "text-blue-600"
    },
    {
      title: "Active Customers",
      value: metrics.activeCustomers.toLocaleString(),
      change: "+15.3% from last month",
      icon: "👥",
      trend: "up",
      bgColor: "bg-purple-100 dark:bg-purple-900",
      iconColor: "text-purple-600"
    },
    {
      title: "Low Stock Items",
      value: metrics.lowStockItems.toString(),
      change: "Needs attention",
      icon: "📦",
      trend: "warning",
      bgColor: "bg-orange-100 dark:bg-orange-900",
      iconColor: "text-orange-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card) => (
        <Card key={card.title} data-testid={`kpi-card-${card.title.toLowerCase().replace(/\s+/g, '-')}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                <p className="text-3xl font-bold">{card.value}</p>
                <p className={`text-sm mt-1 flex items-center ${
                  card.trend === "up" ? "text-green-600" : 
                  card.trend === "down" ? "text-red-600" : 
                  "text-orange-600"
                }`}>
                  {card.trend === "up" && <TrendingUp className="w-4 h-4 mr-1" />}
                  {card.trend === "down" && <TrendingDown className="w-4 h-4 mr-1" />}
                  {card.trend === "warning" && <AlertTriangle className="w-4 h-4 mr-1" />}
                  {card.change}
                </p>
              </div>
              <div className={`w-12 h-12 ${card.bgColor} rounded-full flex items-center justify-center`}>
                <span className="text-2xl">{card.icon}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
