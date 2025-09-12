import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface SalesChartProps {
  data: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
}

export default function SalesChart({ data }: SalesChartProps) {
  // Generate sample data if empty
  const chartData = data.length > 0 ? data : [
    { date: "Jan", revenue: 4000, orders: 24 },
    { date: "Feb", revenue: 3000, orders: 19 },
    { date: "Mar", revenue: 5000, orders: 32 },
    { date: "Apr", revenue: 4500, orders: 28 },
    { date: "May", revenue: 6000, orders: 38 },
    { date: "Jun", revenue: 5500, orders: 35 },
    { date: "Jul", revenue: 7000, orders: 42 }
  ];

  return (
    <Card data-testid="sales-chart">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Sales Analytics</CardTitle>
          <Select defaultValue="7days">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 3 months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'revenue' ? `GHS ${value}` : value,
                  name === 'revenue' ? 'Revenue' : 'Orders'
                ]}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))" }}
              />
              <Line 
                type="monotone" 
                dataKey="orders" 
                stroke="hsl(var(--secondary))" 
                strokeWidth={2}
                dot={{ fill: "hsl(var(--secondary))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
