import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

interface RevenueChartProps {
  data: Array<{
    date: string;
    revenue: number;
    orders: number;
    customers: number;
  }>;
  type?: 'line' | 'area' | 'bar';
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function RevenueChart({ data, type = 'area' }: RevenueChartProps) {
  const [chartType, setChartType] = React.useState(type);
  const [metric, setMetric] = React.useState<'revenue' | 'orders' | 'customers'>('revenue');

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => [
                metric === 'revenue' ? `GHS ${value}` : value,
                name === 'revenue' ? 'Revenue' : name === 'orders' ? 'Orders' : 'Customers'
              ]}
            />
            <Line 
              type="monotone" 
              dataKey={metric} 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              dot={{ fill: "hsl(var(--primary))" }}
            />
          </LineChart>
        );
      
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => [
                metric === 'revenue' ? `GHS ${value}` : value,
                name === 'revenue' ? 'Revenue' : name === 'orders' ? 'Orders' : 'Customers'
              ]}
            />
            <Area 
              type="monotone" 
              dataKey={metric} 
              stroke="hsl(var(--primary))" 
              fill="hsl(var(--primary))"
              fillOpacity={0.3}
            />
          </AreaChart>
        );
      
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => [
                metric === 'revenue' ? `GHS ${value}` : value,
                name === 'revenue' ? 'Revenue' : name === 'orders' ? 'Orders' : 'Customers'
              ]}
            />
            <Bar 
              dataKey={metric} 
              fill="hsl(var(--primary))"
            />
          </BarChart>
        );
      
      default:
        return null;
    }
  };

  return (
    <Card data-testid="revenue-chart">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Revenue Analytics</CardTitle>
          <div className="flex space-x-2">
            <Select value={metric} onValueChange={(value) => setMetric(value as any)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="revenue">Revenue</SelectItem>
                <SelectItem value="orders">Orders</SelectItem>
                <SelectItem value="customers">Customers</SelectItem>
              </SelectContent>
            </Select>
            <Select value={chartType} onValueChange={(value) => setChartType(value as any)}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="area">Area</SelectItem>
                <SelectItem value="line">Line</SelectItem>
                <SelectItem value="bar">Bar</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
