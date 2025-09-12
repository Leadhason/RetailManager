import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { FileText, Calculator, Calendar, AlertCircle, CheckCircle, Download, Upload } from "lucide-react";

interface TaxRecord {
  id: string;
  period: string;
  type: 'VAT' | 'Income Tax' | 'PAYE' | 'NHIL';
  status: 'pending' | 'filed' | 'paid' | 'overdue';
  amount: number;
  dueDate: string;
  filedDate?: string;
  paidDate?: string;
}

interface TaxSummary {
  totalTaxLiability: number;
  paidTaxes: number;
  pendingTaxes: number;
  vatCollected: number;
  vatPaid: number;
  netVat: number;
  incomeTax: number;
}

export default function TaxManagementIndex() {
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();

  const [taxRecords] = useState<TaxRecord[]>([
    {
      id: "1",
      period: "January 2024",
      type: "VAT",
      status: "paid",
      amount: 8750.00,
      dueDate: "2024-02-15",
      filedDate: "2024-02-10",
      paidDate: "2024-02-12"
    },
    {
      id: "2",
      period: "January 2024",
      type: "PAYE",
      status: "filed",
      amount: 12500.00,
      dueDate: "2024-02-15",
      filedDate: "2024-02-14"
    },
    {
      id: "3",
      period: "February 2024",
      type: "VAT",
      status: "pending",
      amount: 9200.00,
      dueDate: "2024-03-15"
    },
    {
      id: "4",
      period: "Q4 2023",
      type: "Income Tax",
      status: "overdue",
      amount: 15000.00,
      dueDate: "2024-01-31"
    }
  ]);

  const taxSummary: TaxSummary = {
    totalTaxLiability: 45450.00,
    paidTaxes: 21250.00,
    pendingTaxes: 24200.00,
    vatCollected: 18500.00,
    vatPaid: 2300.00,
    netVat: 16200.00,
    incomeTax: 15000.00
  };

  const handleFileTaxReturn = (record: TaxRecord) => {
    toast({
      title: "File Tax Return",
      description: `Filing ${record.type} return for ${record.period} (feature coming soon)`,
    });
  };

  const handlePayTax = (record: TaxRecord) => {
    toast({
      title: "Process Tax Payment",
      description: `Processing payment of GHS ${record.amount.toLocaleString()} for ${record.type}`,
    });
  };

  const handleCalculateTax = () => {
    toast({
      title: "Tax Calculation",
      description: "Calculating current tax liability (feature coming soon)",
    });
  };

  const handleExportTaxData = () => {
    toast({
      title: "Export Tax Data",
      description: "Exporting tax records for accounting software",
    });
  };

  const handleUploadDocuments = () => {
    toast({
      title: "Upload Documents",
      description: "Upload tax-related documents (feature coming soon)",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return "bg-green-100 text-green-800";
      case 'filed':
        return "bg-blue-100 text-blue-800";
      case 'pending':
        return "bg-yellow-100 text-yellow-800";
      case 'overdue':
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'filed':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'pending':
        return <Calendar className="w-4 h-4 text-yellow-500" />;
      case 'overdue':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const getTaxTypeColor = (type: string) => {
    switch (type) {
      case 'VAT':
        return "bg-blue-100 text-blue-800";
      case 'Income Tax':
        return "bg-purple-100 text-purple-800";
      case 'PAYE':
        return "bg-green-100 text-green-800";
      case 'NHIL':
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const complianceRate = ((taxRecords.filter(t => t.status === 'paid' || t.status === 'filed').length / taxRecords.length) * 100);
  const overdueCount = taxRecords.filter(t => t.status === 'overdue').length;

  return (
    <div className="space-y-6" data-testid="tax-management-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tax Management</h1>
          <p className="text-muted-foreground">
            Manage tax calculations, filings, and compliance requirements
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleUploadDocuments}>
            <Upload className="w-4 h-4 mr-2" />
            Upload Documents
          </Button>
          <Button variant="outline" onClick={handleExportTaxData}>
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          <Button onClick={handleCalculateTax}>
            <Calculator className="w-4 h-4 mr-2" />
            Calculate Tax
          </Button>
        </div>
      </div>

      {/* Tax Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tax Liability</CardTitle>
            <Calculator className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              GHS {taxSummary.totalTaxLiability.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Current period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Taxes</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              GHS {taxSummary.paidTaxes.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {((taxSummary.paidTaxes / taxSummary.totalTaxLiability) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Taxes</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              GHS {taxSummary.pendingTaxes.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {((taxSummary.pendingTaxes / taxSummary.totalTaxLiability) * 100).toFixed(1)}% remaining
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {complianceRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">On-time filings</p>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Alert */}
      {overdueCount > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <div>
                <h4 className="font-medium text-red-800">Attention Required</h4>
                <p className="text-sm text-red-700">
                  You have {overdueCount} overdue tax obligation{overdueCount > 1 ? 's' : ''} that need immediate attention.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="filings">Tax Filings</TabsTrigger>
          <TabsTrigger value="vat">VAT Management</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tax Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Tax Breakdown</CardTitle>
                <CardDescription>Current tax liabilities by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">VAT (Net)</span>
                    <span className="text-sm font-bold">GHS {taxSummary.netVat.toLocaleString()}</span>
                  </div>
                  <Progress value={(taxSummary.netVat / taxSummary.totalTaxLiability) * 100} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Income Tax</span>
                    <span className="text-sm font-bold">GHS {taxSummary.incomeTax.toLocaleString()}</span>
                  </div>
                  <Progress value={(taxSummary.incomeTax / taxSummary.totalTaxLiability) * 100} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">PAYE</span>
                    <span className="text-sm font-bold">GHS 12,500</span>
                  </div>
                  <Progress value={(12500 / taxSummary.totalTaxLiability) * 100} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Other Taxes</span>
                    <span className="text-sm font-bold">GHS 5,750</span>
                  </div>
                  <Progress value={(5750 / taxSummary.totalTaxLiability) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Deadlines */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Deadlines</CardTitle>
                <CardDescription>Tax obligations due soon</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {taxRecords
                    .filter(record => record.status === 'pending' || record.status === 'overdue')
                    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                    .map((record) => (
                      <div key={record.id} className="flex items-center justify-between p-3 bg-muted/50 rounded">
                        <div>
                          <div className="font-medium">{record.type} - {record.period}</div>
                          <div className="text-sm text-muted-foreground">
                            Due: {record.dueDate}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">GHS {record.amount.toLocaleString()}</div>
                          <Badge className={getStatusColor(record.status)}>
                            {record.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="filings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tax Filings & Returns</CardTitle>
              <CardDescription>Manage all tax filing obligations and payment status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {taxRecords.map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(record.status)}
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{record.period}</h4>
                          <Badge className={getTaxTypeColor(record.type)}>
                            {record.type}
                          </Badge>
                          <Badge className={getStatusColor(record.status)}>
                            {record.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Due: {record.dueDate}
                          {record.filedDate && (
                            <span> • Filed: {record.filedDate}</span>
                          )}
                          {record.paidDate && (
                            <span> • Paid: {record.paidDate}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="font-bold">GHS {record.amount.toLocaleString()}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {record.status === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleFileTaxReturn(record)}
                          >
                            File Return
                          </Button>
                        )}
                        {(record.status === 'filed' || record.status === 'overdue') && (
                          <Button
                            size="sm"
                            onClick={() => handlePayTax(record)}
                          >
                            Pay Tax
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vat" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>VAT Management</CardTitle>
              <CardDescription>Value Added Tax collection and payment tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    GHS {taxSummary.vatCollected.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">VAT Collected</div>
                  <div className="text-xs text-muted-foreground mt-1">From sales</div>
                </div>
                
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    GHS {taxSummary.vatPaid.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">VAT Paid</div>
                  <div className="text-xs text-muted-foreground mt-1">On purchases</div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    GHS {taxSummary.netVat.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Net VAT Due</div>
                  <div className="text-xs text-muted-foreground mt-1">To be paid</div>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-medium mb-3">VAT Filing History</h4>
                <div className="space-y-2">
                  {taxRecords
                    .filter(record => record.type === 'VAT')
                    .map((record) => (
                      <div key={record.id} className="flex items-center justify-between p-3 bg-muted/50 rounded">
                        <div>
                          <div className="font-medium">{record.period}</div>
                          <div className="text-sm text-muted-foreground">
                            Due: {record.dueDate}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <div className="font-bold">GHS {record.amount.toLocaleString()}</div>
                          </div>
                          <Badge className={getStatusColor(record.status)}>
                            {record.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tax Documents</CardTitle>
              <CardDescription>Upload and manage tax-related documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Document Management</h3>
                <p className="text-muted-foreground mb-4">
                  Upload receipts, invoices, and other tax documents for record keeping
                </p>
                <Button onClick={handleUploadDocuments}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Documents
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}