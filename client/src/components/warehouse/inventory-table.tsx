import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, MoreHorizontal, Edit, AlertTriangle, Package } from "lucide-react";

interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  locationName: string;
  quantityOnHand: number;
  quantityReserved: number;
  quantityAvailable: number;
  reorderLevel: number;
  reorderQuantity: number;
  lastCountedAt: string | null;
}

interface InventoryTableProps {
  inventory: InventoryItem[];
  onEdit?: (item: InventoryItem) => void;
  onAdjust?: (item: InventoryItem) => void;
  isLoading?: boolean;
}

const getStockStatus = (available: number, reorderLevel: number) => {
  if (available <= 0) {
    return { label: "Out of Stock", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" };
  } else if (available <= reorderLevel) {
    return { label: "Low Stock", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" };
  } else {
    return { label: "In Stock", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" };
  }
};

export default function InventoryTable({ 
  inventory, 
  onEdit, 
  onAdjust,
  isLoading 
}: InventoryTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredInventory = inventory.filter(item =>
    item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.locationName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-4" data-testid="inventory-table-loading">
        <div className="flex justify-between items-center">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search inventory..."
              className="pl-10"
              disabled
            />
          </div>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>On Hand</TableHead>
                <TableHead>Available</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><div className="h-4 bg-muted rounded w-32 animate-pulse" /></TableCell>
                  <TableCell><div className="h-4 bg-muted rounded w-24 animate-pulse" /></TableCell>
                  <TableCell><div className="h-4 bg-muted rounded w-12 animate-pulse" /></TableCell>
                  <TableCell><div className="h-4 bg-muted rounded w-12 animate-pulse" /></TableCell>
                  <TableCell><div className="h-6 bg-muted rounded w-16 animate-pulse" /></TableCell>
                  <TableCell><div className="h-8 bg-muted rounded w-8 animate-pulse" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="inventory-table">
      {/* Search */}
      <div className="flex justify-between items-center">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search inventory..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="search-inventory"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredInventory.length} of {inventory.length} items
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>On Hand</TableHead>
              <TableHead>Reserved</TableHead>
              <TableHead>Available</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reorder Level</TableHead>
              <TableHead>Last Counted</TableHead>
              <TableHead className="w-12">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInventory.length > 0 ? (
              filteredInventory.map((item) => {
                const status = getStockStatus(item.quantityAvailable, item.reorderLevel);
                return (
                  <TableRow key={item.id} data-testid={`inventory-row-${item.id}`}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.productName}</div>
                        <div className="text-sm text-muted-foreground font-mono">{item.sku}</div>
                      </div>
                    </TableCell>
                    <TableCell>{item.locationName}</TableCell>
                    <TableCell className="font-medium">{item.quantityOnHand}</TableCell>
                    <TableCell className="text-muted-foreground">{item.quantityReserved}</TableCell>
                    <TableCell className="font-medium">{item.quantityAvailable}</TableCell>
                    <TableCell>
                      <Badge className={status.color}>
                        {item.quantityAvailable <= item.reorderLevel && (
                          <AlertTriangle className="w-3 h-3 mr-1" />
                        )}
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.reorderLevel}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {item.lastCountedAt 
                        ? new Date(item.lastCountedAt).toLocaleDateString()
                        : "Never"
                      }
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            data-testid={`inventory-actions-${item.id}`}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {onAdjust && (
                            <DropdownMenuItem onClick={() => onAdjust(item)}>
                              <Package className="mr-2 h-4 w-4" />
                              Adjust Stock
                            </DropdownMenuItem>
                          )}
                          {onEdit && (
                            <DropdownMenuItem onClick={() => onEdit(item)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Settings
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <div className="text-muted-foreground">
                    {searchTerm ? "No inventory found matching your search" : "No inventory items available"}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
