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
import { Search, MoreHorizontal, Eye, RefreshCw, Download } from "lucide-react";

interface Transaction {
  id: string;
  type: 'payment' | 'refund' | 'fee';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  orderId?: string;
  paymentMethod: string;
  reference: string;
  createdAt: string;
}

interface TransactionTableProps {
  transactions: Transaction[];
  onView?: (transaction: Transaction) => void;
  onRefund?: (transaction: Transaction) => void;
  onExport?: () => void;
  isLoading?: boolean;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case 'pending':
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case 'failed':
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'payment':
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    case 'refund':
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
    case 'fee':
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  }
};

export default function TransactionTable({ 
  transactions, 
  onView, 
  onRefund,
  onExport,
  isLoading 
}: TransactionTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTransactions = transactions.filter(transaction =>
    transaction.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-4" data-testid="transaction-table-loading">
        <div className="flex justify-between items-center">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search transactions..."
              className="pl-10"
              disabled
            />
          </div>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><div className="h-4 bg-muted rounded w-24 animate-pulse" /></TableCell>
                  <TableCell><div className="h-6 bg-muted rounded w-16 animate-pulse" /></TableCell>
                  <TableCell><div className="h-4 bg-muted rounded w-20 animate-pulse" /></TableCell>
                  <TableCell><div className="h-6 bg-muted rounded w-16 animate-pulse" /></TableCell>
                  <TableCell><div className="h-4 bg-muted rounded w-20 animate-pulse" /></TableCell>
                  <TableCell><div className="h-4 bg-muted rounded w-20 animate-pulse" /></TableCell>
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
    <div className="space-y-4" data-testid="transaction-table">
      {/* Search and Export */}
      <div className="flex justify-between items-center">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="search-transactions"
          />
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-sm text-muted-foreground">
            {filteredTransactions.length} of {transactions.length} transactions
          </div>
          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport} data-testid="export-transactions">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reference</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Order ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-12">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id} data-testid={`transaction-row-${transaction.id}`}>
                  <TableCell className="font-mono text-sm">
                    {transaction.reference}
                  </TableCell>
                  <TableCell>
                    <Badge className={getTypeColor(transaction.type)}>
                      {transaction.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {transaction.currency} {transaction.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(transaction.status)}>
                      {transaction.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{transaction.paymentMethod}</TableCell>
                  <TableCell className="font-mono text-sm">
                    {transaction.orderId || "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          data-testid={`transaction-actions-${transaction.id}`}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {onView && (
                          <DropdownMenuItem onClick={() => onView(transaction)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                        )}
                        {onRefund && transaction.type === 'payment' && transaction.status === 'completed' && (
                          <DropdownMenuItem onClick={() => onRefund(transaction)}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Process Refund
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
                    {searchTerm ? "No transactions found matching your search" : "No transactions available"}
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
