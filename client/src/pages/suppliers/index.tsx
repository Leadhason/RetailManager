import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSuppliers, useDeleteSupplier } from "@/hooks/use-suppliers";
import { useToast } from "@/hooks/use-toast";
import { Plus, Truck, Star, Clock, CheckCircle } from "lucide-react";
import SupplierTable from "@/components/suppliers/supplier-table";
import type { Supplier } from "@shared/schema";

export default function SuppliersIndex() {
  const { data: suppliers = [], isLoading, error, refetch } = useSuppliers();
  const deleteSupplier = useDeleteSupplier();
  const { toast } = useToast();

  const handleDelete = async (supplier: Supplier) => {
    if (window.confirm(`Are you sure you want to delete supplier "${supplier.name}"?`)) {
      try {
        await deleteSupplier.mutateAsync(supplier.id);
        toast({
          title: "Success",
          description: "Supplier deleted successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete supplier",
          variant: "destructive",
        });
      }
    }
  };

  const handleView = (supplier: Supplier) => {
    toast({
      title: "Supplier Details",
      description: `Viewing details for ${supplier.name}`,
    });
  };

  const handleEdit = (supplier: Supplier) => {
    toast({
      title: "Edit Supplier",
      description: `Editing ${supplier.name} (feature coming soon)`,
    });
  };

  if (error) {
    return (
      <div className="space-y-6" data-testid="suppliers-error">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Suppliers</h1>
            <p className="text-muted-foreground">Manage your supplier relationships</p>
          </div>
        </div>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Truck className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to load suppliers</h3>
            <p className="text-muted-foreground text-center mb-4">
              {error instanceof Error ? error.message : "An unexpected error occurred"}
            </p>
            <Button onClick={() => refetch()} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalSuppliers = suppliers.length;
  const activeSuppliers = suppliers.filter(s => s.isActive).length;
  const avgRating = suppliers.filter(s => s.rating).reduce((acc, s) => acc + Number(s.rating), 0) / suppliers.filter(s => s.rating).length || 0;
  const avgLeadTime = suppliers.filter(s => s.leadTime).reduce((acc, s) => acc + s.leadTime!, 0) / suppliers.filter(s => s.leadTime).length || 0;

  return (
    <div className="space-y-6" data-testid="suppliers-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Suppliers</h1>
          <p className="text-muted-foreground">
            Manage supplier relationships and track performance
          </p>
        </div>
        <Button data-testid="add-supplier-button">
          <Plus className="mr-2 h-4 w-4" />
          Add Supplier
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Suppliers</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSuppliers}</div>
            <p className="text-xs text-muted-foreground">
              All registered suppliers
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Suppliers</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSuppliers}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Out of 5.0 stars
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Lead Time</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgLeadTime.toFixed(0)} days</div>
            <p className="text-xs text-muted-foreground">
              Average delivery time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Suppliers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Supplier Directory</CardTitle>
          <CardDescription>
            View and manage all supplier information and performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SupplierTable
            suppliers={suppliers}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
