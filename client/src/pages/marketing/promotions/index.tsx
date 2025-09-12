import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Percent, Calendar, Target, TrendingUp, Gift, Edit, Trash2 } from "lucide-react";

interface Promotion {
  id: string;
  name: string;
  code: string;
  type: 'percentage' | 'fixed' | 'bogo' | 'free-shipping';
  value: number;
  minOrderValue?: number;
  maxDiscount?: number;
  status: 'active' | 'scheduled' | 'expired' | 'disabled';
  startDate: string;
  endDate: string;
  usageLimit?: number;
  usageCount: number;
  applicableTo: 'all' | 'category' | 'product';
}

export default function PromotionsIndex() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPromotion, setNewPromotion] = useState({
    name: "",
    code: "",
    type: "percentage" as const,
    value: 0,
    minOrderValue: 0,
    startDate: "",
    endDate: "",
    usageLimit: 100,
    applicableTo: "all" as const
  });
  const { toast } = useToast();

  const [promotions] = useState<Promotion[]>([
    {
      id: "1",
      name: "New Year Sale",
      code: "NEWYEAR2024",
      type: "percentage",
      value: 15,
      minOrderValue: 200,
      status: "active",
      startDate: "2024-01-01",
      endDate: "2024-01-31",
      usageLimit: 500,
      usageCount: 127,
      applicableTo: "all"
    },
    {
      id: "2",
      name: "Tool Bundle Deal",
      code: "TOOLBUNDLE",
      type: "bogo",
      value: 1,
      status: "active",
      startDate: "2024-01-15",
      endDate: "2024-02-15",
      usageLimit: 100,
      usageCount: 23,
      applicableTo: "category"
    },
    {
      id: "3",
      name: "Free Shipping Promo",
      code: "FREESHIP",
      type: "free-shipping",
      value: 0,
      minOrderValue: 150,
      status: "scheduled",
      startDate: "2024-02-01",
      endDate: "2024-02-28",
      usageLimit: 1000,
      usageCount: 0,
      applicableTo: "all"
    },
    {
      id: "4",
      name: "Christmas Special",
      code: "XMAS2023",
      type: "fixed",
      value: 50,
      minOrderValue: 300,
      maxDiscount: 50,
      status: "expired",
      startDate: "2023-12-01",
      endDate: "2023-12-31",
      usageLimit: 200,
      usageCount: 198,
      applicableTo: "all"
    }
  ]);

  const handleCreatePromotion = () => {
    toast({
      title: "Promotion Created",
      description: `${newPromotion.name} has been created successfully.`,
    });
    setIsCreateDialogOpen(false);
    setNewPromotion({
      name: "",
      code: "",
      type: "percentage",
      value: 0,
      minOrderValue: 0,
      startDate: "",
      endDate: "",
      usageLimit: 100,
      applicableTo: "all"
    });
  };

  const handleEditPromotion = (promotion: Promotion) => {
    toast({
      title: "Edit Promotion",
      description: `Editing ${promotion.name} (feature coming soon)`,
    });
  };

  const handleDeletePromotion = (promotion: Promotion) => {
    toast({
      title: "Delete Promotion",
      description: `Are you sure you want to delete ${promotion.name}? (feature coming soon)`,
      variant: "destructive",
    });
  };

  const handleToggleStatus = (promotion: Promotion) => {
    const newStatus = promotion.status === 'active' ? 'disabled' : 'active';
    toast({
      title: "Status Updated",
      description: `${promotion.name} is now ${newStatus}`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return "bg-green-100 text-green-800";
      case 'scheduled':
        return "bg-blue-100 text-blue-800";
      case 'expired':
        return "bg-gray-100 text-gray-800";
      case 'disabled':
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'percentage':
        return <Percent className="w-4 h-4" />;
      case 'fixed':
        return <Target className="w-4 h-4" />;
      case 'bogo':
        return <Gift className="w-4 h-4" />;
      case 'free-shipping':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Percent className="w-4 h-4" />;
    }
  };

  const getTypeDisplay = (promotion: Promotion) => {
    switch (promotion.type) {
      case 'percentage':
        return `${promotion.value}% off`;
      case 'fixed':
        return `GHS ${promotion.value} off`;
      case 'bogo':
        return "Buy 1 Get 1";
      case 'free-shipping':
        return "Free Shipping";
      default:
        return `${promotion.value}% off`;
    }
  };

  const activePromotions = promotions.filter(p => p.status === 'active').length;
  const scheduledPromotions = promotions.filter(p => p.status === 'scheduled').length;
  const totalUsage = promotions.reduce((sum, p) => sum + p.usageCount, 0);

  return (
    <div className="space-y-6" data-testid="promotions-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Promotions & Discounts</h1>
          <p className="text-muted-foreground">
            Create and manage discount codes, promotional offers, and special deals
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Promotion
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Promotion</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label htmlFor="promo-name">Promotion Name</Label>
                <Input
                  id="promo-name"
                  placeholder="Enter promotion name"
                  value={newPromotion.name}
                  onChange={(e) => setNewPromotion(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="promo-code">Promo Code</Label>
                <Input
                  id="promo-code"
                  placeholder="Enter discount code"
                  value={newPromotion.code}
                  onChange={(e) => setNewPromotion(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                />
              </div>
              <div>
                <Label htmlFor="promo-type">Discount Type</Label>
                <Select 
                  value={newPromotion.type} 
                  onValueChange={(value) => setNewPromotion(prev => ({ ...prev, type: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select discount type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage Off</SelectItem>
                    <SelectItem value="fixed">Fixed Amount Off</SelectItem>
                    <SelectItem value="bogo">Buy One Get One</SelectItem>
                    <SelectItem value="free-shipping">Free Shipping</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {(newPromotion.type !== 'free-shipping' && newPromotion.type !== 'bogo') && (
                <div>
                  <Label htmlFor="promo-value">
                    {newPromotion.type === 'percentage' ? 'Percentage' : newPromotion.type === 'fixed' ? 'Amount' : 'Value'} ({newPromotion.type === 'percentage' ? '%' : 'GHS'})
                  </Label>
                  <Input
                    id="promo-value"
                    type="number"
                    placeholder={newPromotion.type === 'percentage' ? "15" : "50"}
                    value={newPromotion.value}
                    onChange={(e) => setNewPromotion(prev => ({ ...prev, value: Number(e.target.value) }))}
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={newPromotion.startDate}
                    onChange={(e) => setNewPromotion(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={newPromotion.endDate}
                    onChange={(e) => setNewPromotion(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreatePromotion}>Create Promotion</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Promotions</CardTitle>
            <Target className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePromotions}</div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scheduledPromotions}</div>
            <p className="text-xs text-muted-foreground">Upcoming promotions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsage}</div>
            <p className="text-xs text-muted-foreground">Times redeemed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Promotions</CardTitle>
            <Gift className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{promotions.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Promotions List */}
      <Card>
        <CardHeader>
          <CardTitle>All Promotions</CardTitle>
          <CardDescription>Manage your promotional offers and discount codes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {promotions.map((promotion) => (
              <div key={promotion.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {getTypeIcon(promotion.type)}
                    <h4 className="font-medium">{promotion.name}</h4>
                    <Badge className={getStatusColor(promotion.status)}>
                      {promotion.status}
                    </Badge>
                    <Badge variant="outline">
                      Code: {promotion.code}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                    <span className="font-medium text-primary">
                      {getTypeDisplay(promotion)}
                    </span>
                    {promotion.minOrderValue && (
                      <>
                        <span>•</span>
                        <span>Min order: GHS {promotion.minOrderValue}</span>
                      </>
                    )}
                    <span>•</span>
                    <span>{promotion.startDate} to {promotion.endDate}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>Usage: {promotion.usageCount}</span>
                    {promotion.usageLimit && (
                      <>
                        <span>/ {promotion.usageLimit}</span>
                        <span>•</span>
                        <span>{((promotion.usageCount / promotion.usageLimit) * 100).toFixed(1)}% used</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditPromotion(promotion)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleStatus(promotion)}
                  >
                    {promotion.status === 'active' ? 'Disable' : 'Enable'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeletePromotion(promotion)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {promotions.length === 0 && (
            <div className="text-center py-12">
              <Gift className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Promotions</h3>
              <p className="text-muted-foreground mb-4">
                Create your first promotional offer to attract more customers
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Promotion
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}