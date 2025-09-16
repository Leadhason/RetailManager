import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Search, Download, Upload, Package, AlertTriangle, TrendingUp, Barcode, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useInventory, useLowStockItems, useLocations } from "@/hooks/use-inventory";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { getAuthHeaders, apiCall } from "@/lib/api";
import { insertProductSchema, insertInventorySchema, type Product, type Inventory, type Location, type Category } from "@shared/schema";
import * as z from "zod";

// Extended interface for inventory display with product details
interface InventoryWithProduct extends Inventory {
  product?: Product;
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'discontinued';
}

// Add item form schema based on shared schemas
const addItemSchema = insertProductSchema.pick({
  name: true,
  sku: true,
  description: true,
  categoryId: true,
  costPrice: true,
  sellingPrice: true
}).extend({
  currentStock: z.number().min(0, "Current stock must be positive"),
  reorderLevel: z.number().min(0, "Reorder level must be positive"),
  reorderQuantity: z.number().min(0, "Reorder quantity must be positive"),
  locationId: z.string().min(1, "Location is required")
});

type AddItemFormData = z.infer<typeof addItemSchema>;

export default function InventoryIndex() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  const queryClient = useQueryClient();
  const addItemForm = useForm<AddItemFormData>({
    resolver: zodResolver(addItemSchema),
    defaultValues: {
      name: "",
      sku: "",
      description: "",
      categoryId: "",
      costPrice: 0,
      sellingPrice: 0,
      currentStock: 0,
      reorderLevel: 10,
      reorderQuantity: 50,
      locationId: ""
    }
  });

  // Fetch real inventory data
  const { data: inventory = [], isLoading: inventoryLoading } = useInventory();
  const { data: lowStockItems = [] } = useLowStockItems();
  const { data: locations = [] } = useLocations();
  
  // Fetch categories for the form
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });
  
  // Transform inventory data to include computed fields and status
  const inventoryWithStatus: InventoryWithProduct[] = inventory.map(item => {
    const isLowStock = lowStockItems.some(low => low.id === item.id);
    const status = item.quantityOnHand === 0 ? 'out-of-stock' : 
                   isLowStock ? 'low-stock' : 'in-stock';
    
    return {
      ...item,
      status
    };
  });

  const filteredInventory = inventoryWithStatus.filter(item => {
    // For now, filter by basic properties until we have product data joined
    const matchesSearch = searchTerm === "" || (item.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.product?.sku?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || item.product?.categoryId === selectedCategory;
    
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
    // Create a file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          toast({
            title: "Import Error",
            description: "CSV file must contain header row and at least one data row",
            variant: "destructive"
          });
          return;
        }

        // Parse CSV data
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const inventoryItems = [];

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
          if (values.length < 3) continue; // Skip incomplete rows

          const item = {
            sku: values[headers.indexOf('sku')] || values[0],
            locationCode: values[headers.indexOf('locationCode')] || 'MAIN',
            quantity: parseInt(values[headers.indexOf('quantity')] || values[1]) || 0
          };

          if (item.sku && !isNaN(item.quantity)) {
            inventoryItems.push(item);
          }
        }

        if (inventoryItems.length === 0) {
          toast({
            title: "Import Error", 
            description: "No valid inventory items found in CSV",
            variant: "destructive"
          });
          return;
        }

        // Send to backend API with authentication
        const result = await apiCall('/api/inventory/bulk-import/inventory', {
          method: 'POST',
          body: JSON.stringify({ inventoryItems })
        });

        toast({
          title: "Import Successful",
          description: `Imported ${result.success} inventory items successfully`,
        });
        
        // Invalidate cache to refresh inventory data
        queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      } catch (error) {
        console.error('Import error:', error);
        toast({
          title: "Import Error",
          description: "Failed to process CSV file",
          variant: "destructive"
        });
      }
    };
    input.click();
  };

  const handleBulkExport = async () => {
    try {
      // Use current inventory data for export since there's no dedicated export endpoint
      const data = inventoryWithStatus;
      
      // Convert to CSV format with correct field names
      const csvHeaders = ['SKU', 'Product Name', 'Current Stock', 'Reserved Stock', 'Reorder Level', 'Reorder Quantity', 'Location', 'Status', 'Last Updated'];
      const csvRows = data.map((item: InventoryWithProduct) => [
        item.product?.sku || '',
        item.product?.name || '',
        item.quantityOnHand || 0,
        item.quantityReserved || 0,
        item.reorderLevel || 0,
        item.reorderQuantity || 0,
        item.locationId || '',
        item.status || '',
        item.updatedAt || ''
      ]);

      // Create CSV content
      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(field => `"${field}"`).join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `inventory-export-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      toast({
        title: "Export Successful",
        description: `Exported ${data.length} inventory items to CSV`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export inventory data",
        variant: "destructive"
      });
    }
  };

  const addItemMutation = useMutation({
    mutationFn: async (data: AddItemFormData) => {
      // First create the product using shared schema
      const productData = {
        name: data.name,
        sku: data.sku,
        description: data.description,
        categoryId: data.categoryId,
        costPrice: data.costPrice,
        sellingPrice: data.sellingPrice,
        slug: data.sku.toLowerCase().replace(/[^a-z0-9]/g, '-')
      };
      
      const product = await apiCall('/api/products', {
        method: 'POST',
        body: JSON.stringify(productData)
      });

      // Then create initial inventory record
      const inventoryData = {
        productId: product.id,
        locationId: data.locationId,
        quantityOnHand: data.currentStock,
        reorderLevel: data.reorderLevel,
        reorderQuantity: data.reorderQuantity
      };
      
      // Use inventory adjustment API to set initial stock
      await apiCall('/api/inventory/adjust', {
        method: 'POST',
        body: JSON.stringify({
          productId: product.id,
          locationId: data.locationId,
          quantity: data.currentStock,
          reason: 'Initial stock entry'
        })
      });
      
      return { product, inventory: inventoryData };
    },
    onSuccess: (result) => {
      toast({
        title: "Item Added Successfully",
        description: `${result.product.name} has been added to inventory`,
      });
      
      // Reset form and close dialog
      addItemForm.reset();
      setIsAddDialogOpen(false);
      
      // Invalidate and refetch inventory data
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Add Item",
        description: error.message || "An error occurred",
        variant: "destructive"
      });
    }
  });
  
  const handleAddItem = (data: AddItemFormData) => {
    addItemMutation.mutate(data);

  };

  const handleStockAdjustment = (item: InventoryWithProduct) => {
    toast({
      title: "Stock Adjustment",
      description: `Adjusting stock for ${item.product?.name || 'Item'} (feature coming soon)`,
    });
  };

  // Calculate summary metrics
  const totalItems = inventoryWithStatus.length;
  const lowStockCount = inventoryWithStatus.filter(item => item.status === 'low-stock').length;
  const outOfStockCount = inventoryWithStatus.filter(item => item.status === 'out-of-stock').length;
  const totalValue = inventoryWithStatus.reduce((sum, item) => {
    const unitCost = item.product?.costPrice || 0;
    return sum + (Number(unitCost) * item.quantityOnHand);
  }, 0);

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
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-item">
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Inventory Item</DialogTitle>
                <DialogDescription>
                  Create a new product and set initial inventory levels.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...addItemForm}>
                <form onSubmit={addItemForm.handleSubmit(handleAddItem)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={addItemForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter product name" {...field} data-testid="input-product-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={addItemForm.control}
                      name="sku"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SKU</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter SKU" {...field} data-testid="input-sku" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={addItemForm.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-category">
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={addItemForm.control}
                      name="locationId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-location">
                                <SelectValue placeholder="Select a location" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {locations.map((location) => (
                                <SelectItem key={location.id} value={location.id}>
                                  {location.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={addItemForm.control}
                      name="costPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cost Price (GHS)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              placeholder="0.00" 
                              {...field} 
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              data-testid="input-cost-price"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={addItemForm.control}
                      name="sellingPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Selling Price (GHS)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              placeholder="0.00" 
                              {...field} 
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              data-testid="input-selling-price"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={addItemForm.control}
                      name="currentStock"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Initial Stock</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              data-testid="input-current-stock"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={addItemForm.control}
                      name="reorderLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reorder Level</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="10" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              data-testid="input-reorder-level"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={addItemForm.control}
                      name="reorderQuantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reorder Quantity</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="50" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              data-testid="input-reorder-quantity"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={addItemForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter product description" 
                            {...field} 
                            data-testid="input-description"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" data-testid="button-save-item">
                      Add Item
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
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
            <div className="text-2xl font-bold text-orange-600">{lowStockCount}</div>
            <p className="text-xs text-muted-foreground">Items need reordering</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{outOfStockCount}</div>
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
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Items */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
          <CardDescription>
            {filteredInventory.length} of {totalItems} items
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredInventory.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Inventory Items</h3>
              <p className="text-muted-foreground">
                {searchTerm || selectedCategory !== "all" 
                  ? "No items match your current filters"
                  : "Start by adding your first inventory item"
                }
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredInventory.map((item) => (
                <Card key={item.id} className="p-6 hover:shadow-md transition-shadow border-l-4 border-l-transparent hover:border-l-primary" data-testid={`inventory-item-${item.id}`}>
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                    {/* SKU & Product Info */}
                    <div className="md:col-span-2">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="p-2 bg-muted rounded-lg">
                          <Barcode className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="font-mono text-sm text-muted-foreground">{item.product?.sku || 'N/A'}</div>
                          <div className="font-semibold text-lg">{item.product?.name || 'Unknown Product'}</div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {categories.find(c => c.id === item.product?.categoryId)?.name || 'Uncategorized'}
                      </Badge>
                    </div>

                    {/* Stock Information */}
                    <div className="flex flex-col">
                      <div className="text-sm text-muted-foreground mb-1">Current Stock</div>
                      <div className="font-bold text-2xl">{item.quantityOnHand}</div>
                      <div className="text-xs text-muted-foreground">Min: {item.reorderLevel}</div>
                    </div>

                    {/* Status */}
                    <div className="flex flex-col items-start">
                      <div className="text-sm text-muted-foreground mb-2">Status</div>
                      <Badge className={getStatusColor(item.status)} data-testid={`status-${item.id}`}>
                        {item.status === 'in-stock' && <Package className="w-3 h-3 mr-1" />}
                        {item.status === 'low-stock' && <AlertTriangle className="w-3 h-3 mr-1" />}
                        {item.status === 'out-of-stock' && <AlertTriangle className="w-3 h-3 mr-1" />}
                        {item.status.replace('-', ' ')}
                      </Badge>
                    </div>

                    {/* Value Information */}
                    <div className="flex flex-col">
                      <div className="text-sm text-muted-foreground mb-1">Total Value</div>
                      <div className="font-semibold text-lg">GHS {((Number(item.product?.costPrice) || 0) * item.quantityOnHand).toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">
                        @ GHS {Number(item.product?.costPrice || 0).toFixed(2)} per unit
                      </div>
                    </div>

                    {/* Reorder Info */}
                    <div className="flex flex-col">
                      <div className="text-sm text-muted-foreground mb-1">Reorder</div>
                      <div className="text-sm">
                        <div className="font-medium">{item.reorderQuantity || 'N/A'} units</div>
                        <div className="text-xs text-muted-foreground">when stock ≤ {item.reorderLevel}</div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Location: {locations.find(l => l.id === item.locationId)?.name || 'Unknown'}
                      </div>
                    </div>
                  </div>

                  {/* Last Updated */}
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="text-xs text-muted-foreground">
                      Last updated: {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}