import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCustomers, useDeleteCustomer } from "@/hooks/use-customers";
import { useToast } from "@/hooks/use-toast";
import { Plus, Users, UserCheck, Building, Crown } from "lucide-react";
import CustomerTable from "@/components/customers/customer-table";
import type { Customer } from "@shared/schema";

export default function CustomersIndex() {
  const { data: customers = [], isLoading, error, refetch } = useCustomers();
  const deleteCustomer = useDeleteCustomer();
  const { toast } = useToast();

  const handleDelete = async (customer: Customer) => {
    if (window.confirm(`Are you sure you want to delete customer "${customer.firstName} ${customer.lastName}"?`)) {
      try {
        await deleteCustomer.mutateAsync(customer.id);
        toast({
          title: "Success",
          description: "Customer deleted successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete customer",
          variant: "destructive",
        });
      }
    }
  };

  const handleView = (customer: Customer) => {
    toast({
      title: "Customer Profile",
      description: `Viewing profile for ${customer.firstName} ${customer.lastName}`,
    });
  };

  const handleEdit = (customer: Customer) => {
    toast({
      title: "Edit Customer",
      description: `Editing ${customer.firstName} ${customer.lastName} (feature coming soon)`,
    });
  };

  const handleEmail = (customer: Customer) => {
    toast({
      title: "Send Email",
      description: `Opening email composer for ${customer.email}`,
    });
  };

  if (error) {
    return (
      <div className="space-y-6" data-testid="customers-error">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
            <p className="text-muted-foreground">Manage your customer relationships</p>
          </div>
        </div>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to load customers</h3>
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

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.isActive).length;
  const retailCustomers = customers.filter(c => c.customerType === 'retail').length;
  const wholesaleCustomers = customers.filter(c => c.customerType === 'wholesale').length;
  const vipCustomers = customers.filter(c => c.customerType === 'vip').length;

  return (
    <div className="space-y-6" data-testid="customers-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">
            Manage customer relationships and track engagement
          </p>
        </div>
        <Button data-testid="add-customer-button">
          <Plus className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              All registered customers
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCustomers}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retail</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{retailCustomers}</div>
            <p className="text-xs text-muted-foreground">
              Individual customers
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wholesale</CardTitle>
            <Building className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{wholesaleCustomers}</div>
            <p className="text-xs text-muted-foreground">
              Business customers
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">VIP</CardTitle>
            <Crown className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vipCustomers}</div>
            <p className="text-xs text-muted-foreground">
              Premium customers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Database</CardTitle>
          <CardDescription>
            View and manage all customer information and interactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CustomerTable
            customers={customers}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onEmail={handleEmail}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
