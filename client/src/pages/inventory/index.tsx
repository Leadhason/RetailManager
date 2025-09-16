import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search, Download, Upload, Package, AlertTriangle, TrendingUp, Barcode } from "lucide-react";

interface InventoryItem {
  id: string;
  sku: string;
  productName: string;
  category: string;
  currentStock: number;
  reorderLevel: number;
  reorderQuantity: number;
  unitCost: number;
  totalValue: number;
  supplier: string;
  location: string;
  lastUpdated: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'discontinued';
}

export default function InventoryIndex() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { toast } = useToast();

  // Sample inventory data
  const [inventory] = useState<InventoryItem[]>([
    {
      id: "1",
      sku: "PWR-001",
      productName: "Professional Drill Set",
      category: "Power Tools",
      currentStock: 45,
      reorderLevel: 20,
      reorderQuantity: 50,
      unitCost: 85.00,
      totalValue: 3825.00,
      supplier: "ToolCorp Ltd",
      location: "Warehouse A",
      lastUpdated: "2024-01-15",
      status: "in-stock"
    },
    {
      id: "2", 
      sku: "LED-002",
      productName: "LED Work Light",
      category: "Electrical",
      currentStock: 12,
      reorderLevel: 15,
      reorderQuantity: 30,
      unitCost: 25.00,
      totalValue: 300.00,
      supplier: "ElectriCorp",
      location: "Warehouse B",
      lastUpdated: "2024-01-14",
      status: "low-stock"
    },
    {
      id: "3",
      sku: "SAF-003",
      productName: "Safety Equipment Kit",
      category: "Safety",
      currentStock: 0,
      reorderLevel: 10,
      reorderQuantity: 25,
      unitCost: 120.00,
      totalValue: 0.00,
      supplier: "SafeTech Inc",
      location: "Warehouse A",
      lastUpdated: "2024-01-13",
      status: "out-of-stock"
    }
  ]);

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-stock':
        return "bg-green-100 text-green-800";
      case 'low-stock':
        return "bg-yellow-100 text-yellow-800";
      case 'out-of-stock':
        return "bg-red-100 text-red-800";
      case 'discontinued':
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleBulkImport = () => {
    toast({
      title: "Bulk Import",
      description: "Import inventory from CSV/Excel (feature coming soon)",
    });
  };

  const handleBulkExport = () => {
    toast({
      title: "Bulk Export",
      description: "Export inventory data to CSV (feature coming soon)",
    });
  };

  const handleStockAdjustment = (item: InventoryItem) => {
    toast({
      title: "Stock Adjustment",
      description: `Adjusting stock for ${item.productName} (feature coming soon)`,
    });
  };

  // Calculate summary metrics
  const totalItems = inventory.length;
  const lowStockItems = inventory.filter(item => item.status === 'low-stock').length;
  const outOfStockItems = inventory.filter(item => item.status === 'out-of-stock').length;
  const totalValue = inventory.reduce((sum, item) => sum + item.totalValue, 0);

  return (
    <div className="space-y-6" data-testid="inventory-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground">
            Track stock levels, manage quantities, and monitor inventory across locations
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleBulkImport}>
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" onClick={handleBulkExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button>
            <Package className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">Active inventory items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{lowStockItems}</div>
            <p className="text-xs text-muted-foreground">Items need reordering</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{outOfStockItems}</div>
            <p className="text-xs text-muted-foreground">Items unavailable</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">GHS {totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Inventory value</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center space-x-4 space-y-2">
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by product name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="search-inventory"
              />
            </div>


            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Power Tools">Power Tools</SelectItem>
                <SelectItem value="Electrical">Electrical</SelectItem>
                <SelectItem value="Safety">Safety</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
          <CardDescription>
            {filteredInventory.length} of {totalItems} items
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="p-3 font-medium">SKU</th>
                    <th className="p-3 font-medium">Product</th>
                    <th className="p-3 font-medium">Category</th>
                    <th className="p-3 font-medium">Stock</th>
                    <th className="p-3 font-medium">Status</th>
                    <th className="p-3 font-medium">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-muted/50">
                      <td className="p-3">
                        <div className="flex items-center space-x-2">
                          <Barcode className="w-4 h-4 text-muted-foreground" />
                          <span className="font-mono text-sm">{item.sku}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div>
                          <div className="font-medium">{item.productName}</div>
                          <div className="text-sm text-muted-foreground">
                            Reorder: {item.reorderLevel} units
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline">{item.category}</Badge>
                      </td>
                      <td className="p-3">
                        <div className="font-medium">{item.currentStock}</div>
                        <div className="text-sm text-muted-foreground">
                          Min: {item.reorderLevel}
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge className={getStatusColor(item.status)}>
                          {item.status.replace('-', ' ')}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="font-medium">GHS {item.totalValue.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">
                          Unit: GHS {item.unitCost.toFixed(2)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredInventory.length === 0 && (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Inventory Items</h3>
                <p className="text-muted-foreground">
                  {searchTerm || selectedCategory !== "all" 
                    ? "No items match your current filters"
                    : "Start by adding your first inventory item"
                  }
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}