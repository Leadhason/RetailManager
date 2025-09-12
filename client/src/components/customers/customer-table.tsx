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
import { Search, MoreHorizontal, Edit, Eye, Trash2, Mail } from "lucide-react";
import type { Customer } from "@shared/schema";

interface CustomerTableProps {
  customers: Customer[];
  onView?: (customer: Customer) => void;
  onEdit?: (customer: Customer) => void;
  onDelete?: (customer: Customer) => void;
  onEmail?: (customer: Customer) => void;
  isLoading?: boolean;
}

const getCustomerTypeColor = (type: string) => {
  switch (type) {
    case 'retail':
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    case 'wholesale':
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
    case 'vip':
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  }
};

export default function CustomerTable({ 
  customers, 
  onView, 
  onEdit, 
  onDelete,
  onEmail,
  isLoading 
}: CustomerTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCustomers = customers.filter(customer =>
    customer.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-4" data-testid="customer-table-loading">
        <div className="flex justify-between items-center">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search customers..."
              className="pl-10"
              disabled
            />
          </div>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><div className="h-4 bg-muted rounded w-32 animate-pulse" /></TableCell>
                  <TableCell><div className="h-4 bg-muted rounded w-40 animate-pulse" /></TableCell>
                  <TableCell><div className="h-4 bg-muted rounded w-24 animate-pulse" /></TableCell>
                  <TableCell><div className="h-6 bg-muted rounded w-16 animate-pulse" /></TableCell>
                  <TableCell><div className="h-4 bg-muted rounded w-16 animate-pulse" /></TableCell>
                  <TableCell><div className="h-4 bg-muted rounded w-12 animate-pulse" /></TableCell>
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
    <div className="space-y-4" data-testid="customer-table">
      {/* Search */}
      <div className="flex justify-between items-center">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="search-customers"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredCustomers.length} of {customers.length} customers
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Total Spent (GHS)</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-12">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => (
                <TableRow key={customer.id} data-testid={`customer-row-${customer.id}`}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {[customer.firstName, customer.lastName].filter(Boolean).join(' ') || 'No Name'}
                      </div>
                      {customer.phone && (
                        <div className="text-sm text-muted-foreground">
                          {customer.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {customer.email || "—"}
                  </TableCell>
                  <TableCell>
                    {customer.company || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge className={getCustomerTypeColor(customer.customerType)}>
                      {customer.customerType}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {Number(customer.totalSpent).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {customer.orderCount}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(customer.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          data-testid={`customer-actions-${customer.id}`}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {onView && (
                          <DropdownMenuItem onClick={() => onView(customer)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Profile
                          </DropdownMenuItem>
                        )}
                        {onEdit && (
                          <DropdownMenuItem onClick={() => onEdit(customer)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Customer
                          </DropdownMenuItem>
                        )}
                        {onEmail && customer.email && (
                          <DropdownMenuItem onClick={() => onEmail(customer)}>
                            <Mail className="mr-2 h-4 w-4" />
                            Send Email
                          </DropdownMenuItem>
                        )}
                        {onDelete && (
                          <DropdownMenuItem 
                            onClick={() => onDelete(customer)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="text-muted-foreground">
                    {searchTerm ? "No customers found matching your search" : "No customers available"}
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
