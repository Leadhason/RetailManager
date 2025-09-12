import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  PlusCircle,
  ShoppingCart,
  UserPlus,
  BarChart3,
  Package,
  Megaphone
} from "lucide-react";

interface QuickAction {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
}

const quickActions: QuickAction[] = [
  {
    title: "Add Product",
    icon: PlusCircle,
    href: "/products/add",
    color: "text-blue-600"
  },
  {
    title: "Process Order",
    icon: ShoppingCart,
    href: "/orders",
    color: "text-green-600"
  },
  {
    title: "Add Customer",
    icon: UserPlus,
    href: "/customers",
    color: "text-purple-600"
  },
  {
    title: "Generate Report",
    icon: BarChart3,
    href: "/analytics",
    color: "text-orange-600"
  },
  {
    title: "Manage Inventory",
    icon: Package,
    href: "/warehouse",
    color: "text-red-600"
  },
  {
    title: "Create Campaign",
    icon: Megaphone,
    href: "/marketing",
    color: "text-indigo-600"
  }
];

export default function QuickActions() {
  return (
    <Card data-testid="quick-actions">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickActions.map((action) => (
            <Link key={action.title} href={action.href}>
              <Button
                variant="outline"
                className="flex flex-col items-center p-4 h-auto space-y-2 hover:bg-accent transition-colors"
                data-testid={`quick-action-${action.title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <action.icon className={`w-6 h-6 ${action.color}`} />
                <span className="text-sm font-medium text-center">{action.title}</span>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
