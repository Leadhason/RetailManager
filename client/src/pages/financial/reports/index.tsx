import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { CalendarIcon, Download, BarChart3, TrendingUp, DollarSign, FileText, PieChart } from "lucide-react";

interface ReportData {
  id: string;
  name: string;
  description: string;
  category: 'revenue' | 'expenses' | 'profit' | 'tax' | 'inventory';
  lastGenerated: string;
  size: string;
}

export default function FinancialReportsIndex() {
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  });
  const [reportPeriod, setReportPeriod] = useState("monthly");
  const { toast } = useToast();

  const [availableReports] = useState<ReportData[]>([
    {
      id: "1",
      name: "Revenue Report",
      description: "Comprehensive overview of all revenue streams",
      category: "revenue",
      lastGenerated: "2024-01-15",
      size: "2.3 MB"
    },
    {
      id: "2",
      name: "Expense Report",
      description: "Detailed breakdown of business expenses",
      category: "expenses",
      lastGenerated: "2024-01-15",
      size: "1.8 MB"
    },
    {
      id: "3",
      name: "Profit & Loss Statement",
      description: "P&L statement with income and expense analysis",
      category: "profit",
      lastGenerated: "2024-01-14",
      size: "3.1 MB"
    },
    {
      id: "4",
      name: "Tax Report",
      description: "Tax calculations and VAT summary",
      category: "tax",
      lastGenerated: "2024-01-10",
      size: "1.2 MB"
    },
    {
      id: "5",
      name: "Inventory Valuation",
      description: "Current inventory value and cost analysis",
      category: "inventory",
      lastGenerated: "2024-01-12",
      size: "2.7 MB"
    }
  ]);

  // Sample financial data
  const financialSummary = {
    totalRevenue: 125000,
    totalExpenses: 78000,
    grossProfit: 47000,
    netProfit: 35000,
    taxLiability: 8500,
    inventoryValue: 45000
  };

  const monthlyData = [
    { month: "Oct", revenue: 18000, expenses: 12000, profit: 6000 },
    { month: "Nov", revenue: 22000, expenses: 14000, profit: 8000 },
    { month: "Dec", revenue: 28000, expenses: 16000, profit: 12000 },
    { month: "Jan", revenue: 31000, expenses: 18000, profit: 13000 }
  ];

  const handleGenerateReport = (report: ReportData) => {
    toast({
      title: "Generating Report",
      description: `${report.name} is being generated (feature coming soon)`,
    });
  };

  const handleDownloadReport = (report: ReportData) => {
    toast({
      title: "Download Started",
      description: `Downloading ${report.name}`,
    });
  };

  const handleExportData = (format: string) => {
    toast({
      title: "Export Started",
      description: `Exporting financial data as ${format.toUpperCase()}`,
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'revenue':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'expenses':
        return <BarChart3 className="w-4 h-4 text-red-500" />;
      case 'profit':
        return <DollarSign className="w-4 h-4 text-blue-500" />;
      case 'tax':
        return <FileText className="w-4 h-4 text-purple-500" />;
      case 'inventory':
        return <PieChart className="w-4 h-4 text-orange-500" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6" data-testid="financial-reports-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Reports</h1>
          <p className="text-muted-foreground">
            Generate comprehensive financial reports and export data
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => handleExportData('csv')}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => handleExportData('pdf')}>
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button>
            <FileText className="w-4 h-4 mr-2" />
            Custom Report
          </Button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              GHS {financialSummary.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">This period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <BarChart3 className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              GHS {financialSummary.totalExpenses.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Operating costs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gross Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              GHS {financialSummary.grossProfit.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Before expenses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              GHS {financialSummary.netProfit.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">After all costs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tax Liability</CardTitle>
            <FileText className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              GHS {financialSummary.taxLiability.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Estimated tax</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <PieChart className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              GHS {financialSummary.inventoryValue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Current stock</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="reports">Available Reports</TabsTrigger>
          <TabsTrigger value="custom">Custom Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Performance</CardTitle>
                <CardDescription>Revenue, expenses, and profit trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {monthlyData.map((data, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded">
                      <div className="font-medium">{data.month}</div>
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="text-green-600">
                          Rev: GHS {data.revenue.toLocaleString()}
                        </div>
                        <div className="text-red-600">
                          Exp: GHS {data.expenses.toLocaleString()}
                        </div>
                        <div className="text-blue-600 font-medium">
                          Profit: GHS {data.profit.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Key Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Key Financial Metrics</CardTitle>
                <CardDescription>Important ratios and performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Profit Margin</span>
                    <span className="text-sm font-bold text-green-600">
                      {((financialSummary.netProfit / financialSummary.totalRevenue) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Expense Ratio</span>
                    <span className="text-sm font-bold text-red-600">
                      {((financialSummary.totalExpenses / financialSummary.totalRevenue) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Tax Rate</span>
                    <span className="text-sm font-bold text-purple-600">
                      {((financialSummary.taxLiability / financialSummary.grossProfit) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Inventory Turnover</span>
                    <span className="text-sm font-bold text-blue-600">2.8x</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Available Reports</CardTitle>
              <CardDescription>Pre-built financial reports ready for generation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {availableReports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      {getCategoryIcon(report.category)}
                      <div>
                        <h4 className="font-medium">{report.name}</h4>
                        <p className="text-sm text-muted-foreground">{report.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                          <span>Last generated: {report.lastGenerated}</span>
                          <span>•</span>
                          <span>Size: {report.size}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadReport(report)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleGenerateReport(report)}
                      >
                        Generate
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Custom Report Builder</CardTitle>
              <CardDescription>Create custom financial reports with specific criteria</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Date Range Selector */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Report Period</label>
                  <div className="flex items-center space-x-4">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-[300px] justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange?.from ? (
                            dateRange.to ? (
                              <>
                                {format(dateRange.from, "LLL dd, y")} -{" "}
                                {format(dateRange.to, "LLL dd, y")}
                              </>
                            ) : (
                              format(dateRange.from, "LLL dd, y")
                            )
                          ) : (
                            <span>Pick a date range</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          initialFocus
                          mode="range"
                          defaultMonth={dateRange?.from}
                          numberOfMonths={2}
                        />
                      </PopoverContent>
                    </Popover>

                    <Select value={reportPeriod} onValueChange={setReportPeriod}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Report Components */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Include in Report</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      {[
                        { id: 'revenue', label: 'Revenue Analysis' },
                        { id: 'expenses', label: 'Expense Breakdown' },
                        { id: 'profit', label: 'Profit & Loss' }
                      ].map((item) => (
                        <label key={item.id} className="flex items-center space-x-2">
                          <input type="checkbox" defaultChecked className="rounded" />
                          <span className="text-sm">{item.label}</span>
                        </label>
                      ))}
                    </div>
                    <div className="space-y-2">
                      {[
                        { id: 'tax', label: 'Tax Summary' },
                        { id: 'inventory', label: 'Inventory Valuation' },
                        { id: 'cashflow', label: 'Cash Flow Analysis' }
                      ].map((item) => (
                        <label key={item.id} className="flex items-center space-x-2">
                          <input type="checkbox" defaultChecked className="rounded" />
                          <span className="text-sm">{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline">
                    Preview Report
                  </Button>
                  <Button>
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Custom Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}