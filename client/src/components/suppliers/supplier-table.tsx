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
import { Search, MoreHorizontal, Edit, Eye, Trash2, Star } from "lucide-react";
import type { Supplier } from "@shared/schema";

interface SupplierTableProps {
  suppliers: Supplier[];
  onView?: (supplier: Supplier) => void;
  onEdit?: (supplier: Supplier) => void;
  onDelete?: (supplier: Supplier) => void;
  isLoading?: boolean;
}

const getRatingStars = (rating: number) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  for (let i = 0; i < fullStars; i++) {
    stars.push(<Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />);
  }

  if (hasHalfStar) {
    stars.push(<Star key="half" className="w-3 h-3 fill-yellow-400/50 text-yellow-400" />);
  }

  const emptyStars = 5 - Math.ceil(rating);
  for (let i = 0; i < emptyStars; i++) {
    stars.push(<Star key={`empty-${i}`} className="w-3 h-3 text-gray-300" />);
  }

  return stars;
};

export default function SupplierTable({ 
  suppliers, 
  onView, 
  onEdit, 
  onDelete,
  isLoading 
}: SupplierTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-4" data-testid="supplier-table-loading">
        <div className="flex justify-between items-center">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search suppliers..."
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
                <TableHead>Contact Person</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Lead Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><div className="h-4 bg-muted rounded w-32 animate-pulse" /></TableCell>
                  <TableCell><div className="h-4 bg-muted rounded w-24 animate-pulse" /></TableCell>
                  <TableCell><div className="h-4 bg-muted rounded w-40 animate-pulse" /></TableCell>
                  <TableCell><div className="h-4 bg-muted rounded w-24 animate-pulse" /></TableCell>
                  <TableCell><div className="h-4 bg-muted rounded w-20 animate-pulse" /></TableCell>
                  <TableCell><div className="h-4 bg-muted rounded w-16 animate-pulse" /></TableCell>
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
    <div className="space-y-4" data-testid="supplier-table">
      {/* Search */}
      <div className="flex justify-between items-center">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search suppliers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="search-suppliers"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredSuppliers.length} of {suppliers.length} suppliers
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact Person</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Lead Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSuppliers.length > 0 ? (
              filteredSuppliers.map((supplier) => (
                <TableRow key={supplier.id} data-testid={`supplier-row-${supplier.id}`}>
                  <TableCell>
                    <div className="font-medium">{supplier.name}</div>
                    {supplier.paymentTerms && (
                      <div className="text-sm text-muted-foreground">
                        {supplier.paymentTerms}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {supplier.contactPerson || "—"}
                  </TableCell>
                  <TableCell>
                    {supplier.email || "—"}
                  </TableCell>
                  <TableCell>
                    {supplier.phone || "—"}
                  </TableCell>
                  <TableCell>
                    {supplier.rating ? (
                      <div className="flex items-center space-x-1">
                        <div className="flex">
                          {getRatingStars(Number(supplier.rating))}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          ({Number(supplier.rating).toFixed(1)})
                        </span>
                      </div>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>
                    {supplier.leadTime ? `${supplier.leadTime} days` : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={supplier.isActive ? "default" : "secondary"}>
                      {supplier.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          data-testid={`supplier-actions-${supplier.id}`}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {onView && (
                          <DropdownMenuItem onClick={() => onView(supplier)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                        )}
                        {onEdit && (
                          <DropdownMenuItem onClick={() => onEdit(supplier)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Supplier
                          </DropdownMenuItem>
                        )}
                        {onDelete && (
                          <DropdownMenuItem 
                            onClick={() => onDelete(supplier)}
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
                    {searchTerm ? "No suppliers found matching your search" : "No suppliers available"}
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
