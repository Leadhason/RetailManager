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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {cards.map((card) => (
        <Card 
          key={card.title} 
          className="transition-all duration-200 hover:shadow-md border-border/50"
          data-testid={`kpi-card-${card.title.toLowerCase().replace(/\s+/g, '-')}`}
        >
          <CardContent className="p-4 md:p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm font-medium text-muted-foreground mb-1 truncate">
                  {card.title}
                </p>
                <p className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground tracking-tight">
                  {card.value}
                </p>
                <p className={`text-xs md:text-sm mt-2 flex items-center font-medium ${
                  card.trend === "up" ? "text-green-600 dark:text-green-400" : 
                  card.trend === "down" ? "text-red-600 dark:text-red-400" : 
                  "text-orange-600 dark:text-orange-400"
                }`}>
                  {card.trend === "up" && <TrendingUp className="w-3 h-3 md:w-4 md:h-4 mr-1 flex-shrink-0" />}
                  {card.trend === "down" && <TrendingDown className="w-3 h-3 md:w-4 md:h-4 mr-1 flex-shrink-0" />}
                  {card.trend === "warning" && <AlertTriangle className="w-3 h-3 md:w-4 md:h-4 mr-1 flex-shrink-0" />}
                  <span className="truncate">{card.change}</span>
                </p>
              </div>
              <div className={`w-10 h-10 md:w-12 md:h-12 ${card.bgColor} rounded-xl flex items-center justify-center flex-shrink-0 ml-3`}>
                <span className="text-lg md:text-2xl">{card.icon}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
