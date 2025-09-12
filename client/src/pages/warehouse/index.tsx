import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  useInventory, 
  useLowStockItems, 
  useLocations, 
  useUpdateInventory,
  useInventoryMetrics 
} from "@/hooks/use-inventory";
import { useToast } from "@/hooks/use-toast";
import { Package, Warehouse, AlertTriangle, BarChart3, MapPin, TrendingDown } from "lucide-react";
import InventoryTable from "@/components/warehouse/inventory-table";
import StockAlerts from "@/components/warehouse/stock-alerts";

export default function WarehouseIndex() {
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("inventory");
  
  const { data: inventory = [], isLoading: inventoryLoading, error: inventoryError } = useInventory(selectedLocation === "all" ? "" : selectedLocation);
  const { data: lowStockItems = [], isLoading: lowStockLoading } = useLowStockItems(10);
  const { data: locations = [], isLoading: locationsLoading } = useLocations();
  const { data: inventoryMetrics, isLoading: metricsLoading } = useInventoryMetrics();
  const updateInventory = useUpdateInventory();
  const { toast } = useToast();

  // Transform inventory data for the table component
  const inventoryTableData = inventory.map(item => ({
    id: item.id,
    productId: item.productId,
    productName: "Product Name", // Would come from joined data
    sku: "SKU-001", // Would come from joined data  
    locationName: locations.find(l => l.id === item.locationId)?.name || "Unknown",
    quantityOnHand: item.quantityOnHand,
    quantityReserved: item.quantityReserved,
    quantityAvailable: item.quantityOnHand - item.quantityReserved,
    reorderLevel: item.reorderLevel || 10,
    reorderQuantity: item.reorderQuantity || 50,
    lastCountedAt: item.lastCountedAt ? item.lastCountedAt.toISOString() : null
  }));

  // Transform low stock items for alerts component
  const stockAlerts = lowStockItems.map(item => ({
    id: item.id,
    productName: "Product Name", // Would come from joined data
    sku: "SKU-001", // Would come from joined data
    locationName: locations.find(l => l.id === item.locationId)?.name || "Unknown",
    currentStock: item.quantityOnHand - item.quantityReserved,
    reorderLevel: item.reorderLevel || 10,
    reorderQuantity: item.reorderQuantity || 50,
    daysUntilStockout: Math.max(0, Math.floor((item.quantityOnHand - item.quantityReserved) / 2)), // Estimated
    severity: (item.quantityOnHand - item.quantityReserved) <= 0 ? 'critical' as const : 
             (item.quantityOnHand - item.quantityReserved) <= (item.reorderLevel || 10) * 0.5 ? 'warning' as const : 'low' as const
  }));

  const handleInventoryAdjust = (item: any) => {
    toast({
      title: "Inventory Adjustment",
      description: `Adjusting stock for ${item.productName} (feature coming soon)`,
    });
  };

  const handleInventoryEdit = (item: any) => {
    toast({
      title: "Edit Inventory Settings",
      description: `Editing settings for ${item.productName} (feature coming soon)`,
    });
  };

  const handleReorder = (alert: any) => {
    toast({
      title: "Reorder Initiated",
      description: `Reordering ${alert.reorderQuantity} units of ${alert.productName}`,
    });
  };

  const handleAdjustLevel = (alert: any) => {
    toast({
      title: "Adjust Reorder Level",
      description: `Adjusting reorder level for ${alert.productName} (feature coming soon)`,
    });
  };

  if (inventoryError) {
    return (
      <div className="space-y-6" data-testid="warehouse-error">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Warehouse</h1>
            <p className="text-muted-foreground">Inventory and warehouse management</p>
          </div>
        </div>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Warehouse className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to load warehouse data</h3>
            <p className="text-muted-foreground text-center mb-4">
              {inventoryError instanceof Error ? inventoryError.message : "An unexpected error occurred"}
            </p>
            <Button variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Sample metrics for display
  const sampleMetrics = {
    totalItems: inventory.length,
    lowStockItems: lowStockItems.length,
    totalLocations: locations.length,
    inventoryValue: 125000,
    turnoverRate: 4.2
  };

  return (
    <div className="space-y-6" data-testid="warehouse-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Warehouse</h1>
          <p className="text-muted-foreground">
            Manage inventory, stock levels, and warehouse operations
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="w-[200px]" data-testid="location-filter">
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map((location) => (
                <SelectItem key={location.id} value={location.id}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sampleMetrics.totalItems}</div>
            <p className="text-xs text-muted-foreground">Inventory items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{sampleMetrics.lowStockItems}</div>
            <p className="text-xs text-muted-foreground">Items need reorder</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Locations</CardTitle>
            <MapPin className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sampleMetrics.totalLocations}</div>
            <p className="text-xs text-muted-foreground">Warehouse locations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <BarChart3 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">GHS {sampleMetrics.inventoryValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total stock value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Turnover Rate</CardTitle>
            <TrendingDown className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sampleMetrics.turnoverRate}x</div>
            <p className="text-xs text-muted-foreground">Times per year</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="alerts">Stock Alerts</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Management</CardTitle>
              <CardDescription>
                Track stock levels, manage quantities, and monitor inventory across all locations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InventoryTable
                inventory={inventoryTableData}
                onEdit={handleInventoryEdit}
                onAdjust={handleInventoryAdjust}
                isLoading={inventoryLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <StockAlerts
            alerts={stockAlerts}
            onReorder={handleReorder}
            onAdjustLevel={handleAdjustLevel}
          />
        </TabsContent>

        <TabsContent value="locations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Warehouse Locations</CardTitle>
              <CardDescription>Manage warehouse locations and their settings</CardDescription>
            </CardHeader>
            <CardContent>
              {locationsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                  ))}
                </div>
              ) : locations.length > 0 ? (
                <div className="space-y-4">
                  {locations.map((location) => (
                    <div key={location.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{location.name}</h4>
                        <p className="text-sm text-muted-foreground">Code: {location.code}</p>
                        <p className="text-sm text-muted-foreground">Type: {location.type}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" data-testid={`edit-location-${location.id}`}>
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Locations</h3>
                  <p className="text-muted-foreground mb-4">Add your first warehouse location to get started</p>
                  <Button data-testid="add-location">
                    <MapPin className="mr-2 h-4 w-4" />
                    Add Location
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Inventory Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button variant="outline" className="w-full justify-start" data-testid="stock-report">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Stock Level Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start" data-testid="movement-report">
                    <TrendingDown className="mr-2 h-4 w-4" />
                    Inventory Movement Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start" data-testid="valuation-report">
                    <Package className="mr-2 h-4 w-4" />
                    Inventory Valuation Report
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Items Out of Stock</span>
                    <span className="font-medium text-red-600">
                      {inventory.filter(i => (i.quantityOnHand - i.quantityReserved) <= 0).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Items Below Reorder Level</span>
                    <span className="font-medium text-orange-600">{lowStockItems.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Stock Units</span>
                    <span className="font-medium">
                      {inventory.reduce((sum, item) => sum + item.quantityOnHand, 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Available Units</span>
                    <span className="font-medium">
                      {inventory.reduce((sum, item) => sum + (item.quantityOnHand - item.quantityReserved), 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
