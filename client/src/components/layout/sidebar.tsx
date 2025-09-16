import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ChartLine,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Megaphone,
  Truck,
  Warehouse,
  DollarSign,
  Settings,
  ChevronDown,
  Bolt,
  Menu
} from "lucide-react";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onLinkClick?: () => void;
}

interface NavItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  children?: NavItem[];
  badge?: string;
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    icon: ChartLine,
    href: "/dashboard"
  },
  {
    title: "Products",
    icon: Package,
    children: [
      { title: "Product Catalog", icon: Package, href: "/products" },
      { title: "Add Product", icon: Package, href: "/products/add" },
      { title: "Categories", icon: Package, href: "/categories" },
      { title: "Inventory", icon: Package, href: "/inventory" }
    ]
  },
  {
    title: "Orders",
    icon: ShoppingCart,
    href: "/orders",
    badge: "12"
  },
  {
    title: "Customers",
    icon: Users,
    href: "/customers"
  },
  {
    title: "Analytics",
    icon: BarChart3,
    href: "/analytics"
  },
  {
    title: "Marketing",
    icon: Megaphone,
    children: [
      { title: "Email Campaigns", icon: Megaphone, href: "/marketing/email" },
      { title: "Promotions", icon: Megaphone, href: "/marketing/promotions" },
      { title: "SEO Tools", icon: Megaphone, href: "/marketing/seo" }
    ]
  },
  {
    title: "Suppliers",
    icon: Truck,
    href: "/suppliers"
  },
  {
    title: "Warehouse",
    icon: Warehouse,
    href: "/warehouse"
  },
  {
    title: "Financial",
    icon: DollarSign,
    children: [
      { title: "Payments", icon: DollarSign, href: "/financial/payments" },
      { title: "Reports", icon: DollarSign, href: "/financial/reports" },
      { title: "Tax Management", icon: DollarSign, href: "/financial/tax" }
    ]
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/settings"
  }
];

function NavItemComponent({ 
  item, 
  collapsed, 
  isActive, 
  onItemClick,
  onLinkClick
}: { 
  item: NavItem; 
  collapsed: boolean; 
  isActive: boolean;
  onItemClick: () => void;
  onLinkClick?: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  const handleClick = () => {
    if (hasChildren && !collapsed) {
      setIsExpanded(!isExpanded);
    } else if (item.href) {
      onItemClick();
    }
  };

  const ItemContent = () => (
    <div 
      className={cn(
        "flex items-center justify-between w-full p-3 rounded-lg cursor-pointer transition-colors",
        isActive 
          ? "bg-primary text-primary-foreground" 
          : "hover:bg-accent text-muted-foreground hover:text-foreground"
      )}
      onClick={handleClick}
      data-testid={`nav-item-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="flex items-center space-x-3">
        <item.icon className="w-5 h-5" />
        {!collapsed && <span className="font-medium">{item.title}</span>}
      </div>
      {!collapsed && (
        <>
          {item.badge && (
            <span className="bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded-full">
              {item.badge}
            </span>
          )}
          {hasChildren && (
            <ChevronDown 
              className={cn(
                "w-4 h-4 transition-transform",
                isExpanded && "rotate-180"
              )} 
            />
          )}
        </>
      )}
    </div>
  );

  return (
    <div>
      {item.href ? (
        <Link href={item.href}>
          <ItemContent />
        </Link>
      ) : (
        <ItemContent />
      )}
      
      {hasChildren && !collapsed && isExpanded && (
        <div className="ml-8 mt-1 space-y-1">
          {item.children!.map((child) => (
            <Link key={child.href} href={child.href!}>
              <div 
                className="flex items-center space-x-3 p-3 rounded hover:bg-accent cursor-pointer text-sm text-muted-foreground hover:text-foreground"
                onClick={onLinkClick}
              >
                <span>{child.title}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ collapsed, onToggle, onLinkClick }: SidebarProps) {
  const [location] = useLocation();

  return (
    <aside 
      className={cn(
        "bg-card border-r border-border flex-shrink-0 transition-all duration-300 ease-in-out h-full",
        collapsed ? "w-16" : "w-64"
      )}
      data-testid="sidebar"
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Bolt className="w-4 h-4 text-primary-foreground" />
              </div>
              {!collapsed && <span className="font-bold text-lg">EDMAX</span>}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              data-testid="sidebar-toggle"
            >
              <Menu className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavItemComponent
              key={item.title}
              item={item}
              collapsed={collapsed}
              isActive={location === item.href}
              onItemClick={onLinkClick || (() => {})}
              onLinkClick={onLinkClick}
            />
          ))}
        </nav>

        {/* User Profile */}
        {!collapsed && (
          <div className="p-4 border-t border-border">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground text-sm font-medium">JD</span>
              </div>
              <div>
                <div className="text-sm font-medium">John Doe</div>
                <div className="text-xs text-muted-foreground">Store Manager</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
