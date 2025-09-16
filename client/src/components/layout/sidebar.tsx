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
  ChevronLeft,
  ChevronRight,
  Bolt
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

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
  const [location] = useLocation();
  
  // Check if any child is active
  const isChildActive = hasChildren && item.children?.some(child => location === child.href);
  const shouldHighlight = isActive || isChildActive;

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
        "flex items-center justify-between w-full p-3 rounded-lg cursor-pointer transition-all duration-200",
        shouldHighlight 
          ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm" 
          : "hover:bg-sidebar-accent text-sidebar-foreground/70 hover:text-sidebar-foreground"
      )}
      onClick={handleClick}
      data-testid={`nav-item-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="flex items-center space-x-3 min-w-0">
        <item.icon className="w-5 h-5 flex-shrink-0" />
        {!collapsed && (
          <span className="font-medium truncate transition-opacity duration-200">
            {item.title}
          </span>
        )}
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
        <div className="ml-8 mt-1 space-y-1 animate-in slide-in-from-top-1 duration-200">
          {item.children!.map((child) => {
            const isChildItemActive = location === child.href;
            return (
              <Link key={child.href} href={child.href!}>
                <div 
                  className={cn(
                    "flex items-center space-x-3 p-2 px-3 rounded transition-all duration-200 text-sm cursor-pointer",
                    isChildItemActive
                      ? "bg-sidebar-primary/10 text-sidebar-primary border-l-2 border-sidebar-primary"
                      : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                  )}
                  onClick={onLinkClick}
                >
                  <span className="truncate">{child.title}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ collapsed, onToggle, onLinkClick }: SidebarProps) {
  const [location] = useLocation();
  const { user } = useAuth();

  return (
    <aside 
      className={cn(
        "bg-sidebar border-r border-sidebar-border flex-shrink-0 transition-all duration-300 ease-in-out h-full shadow-lg",
        collapsed ? "w-16" : "w-64"
      )}
      data-testid="sidebar"
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <Bolt className="w-5 h-5 text-sidebar-primary-foreground" />
              </div>
              {!collapsed && (
                <span className="font-bold text-lg text-sidebar-foreground truncate transition-opacity duration-200">
                  EDMAX
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="text-sidebar-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent flex-shrink-0"
              data-testid="sidebar-toggle"
            >
              {collapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-sidebar-border">
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
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-8 h-8 bg-sidebar-primary rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sidebar-primary-foreground text-sm font-medium">
                {user?.firstName?.[0] || user?.email?.[0] || 'U'}
              </span>
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-sidebar-foreground truncate">
                  {user?.firstName && user?.lastName 
                    ? `${user.firstName} ${user.lastName}`
                    : user?.email || 'User'
                  }
                </div>
                <div className="text-xs text-sidebar-foreground/60 truncate">
                  {user?.role || 'Store Manager'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
