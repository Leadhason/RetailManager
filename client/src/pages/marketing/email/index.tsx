import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Send, Mail, Users, Eye, Edit, Trash2, BarChart3 } from "lucide-react";

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused';
  recipients: number;
  openRate: number;
  clickRate: number;
  sentDate?: string;
  scheduledDate?: string;
}

export default function EmailCampaignsIndex() {
  const [activeTab, setActiveTab] = useState("campaigns");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    subject: "",
    content: "",
    audienceType: "all"
  });
  const { toast } = useToast();

  const [campaigns] = useState<EmailCampaign[]>([
    {
      id: "1",
      name: "New Product Launch",
      subject: "Introducing Our Latest Power Tool Collection",
      status: "sent",
      recipients: 2450,
      openRate: 24.5,
      clickRate: 3.2,
      sentDate: "2024-01-15"
    },
    {
      id: "2", 
      name: "Weekly Newsletter",
      subject: "This Week's Best Deals on Construction Supplies",
      status: "scheduled",
      recipients: 3200,
      openRate: 0,
      clickRate: 0,
      scheduledDate: "2024-01-20"
    },
    {
      id: "3",
      name: "Customer Retention",
      subject: "We Miss You! Special Offer Inside",
      status: "draft",
      recipients: 850,
      openRate: 0,
      clickRate: 0
    }
  ]);

  const handleCreateCampaign = () => {
    toast({
      title: "Campaign Created",
      description: `${newCampaign.name} has been created as a draft.`,
    });
    setIsCreateDialogOpen(false);
    setNewCampaign({ name: "", subject: "", content: "", audienceType: "all" });
  };

  const handleSendCampaign = (campaign: EmailCampaign) => {
    toast({
      title: "Campaign Sent",
      description: `${campaign.name} has been sent to ${campaign.recipients} recipients.`,
    });
  };

  const handleEditCampaign = (campaign: EmailCampaign) => {
    toast({
      title: "Edit Campaign",
      description: `Opening editor for ${campaign.name} (feature coming soon)`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return "bg-green-100 text-green-800";
      case 'scheduled':
        return "bg-blue-100 text-blue-800";
      case 'sending':
        return "bg-yellow-100 text-yellow-800";
      case 'draft':
        return "bg-gray-100 text-gray-800";
      case 'paused':
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const totalSent = campaigns.filter(c => c.status === 'sent').length;
  const avgOpenRate = campaigns.filter(c => c.status === 'sent')
    .reduce((sum, c) => sum + c.openRate, 0) / Math.max(totalSent, 1);
  const totalRecipients = campaigns.reduce((sum, c) => sum + c.recipients, 0);

  return (
    <div className="space-y-6" data-testid="email-campaigns-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Email Campaigns</h1>
          <p className="text-muted-foreground">
            Create, manage, and track your email marketing campaigns
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Email Campaign</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label htmlFor="campaign-name">Campaign Name</Label>
                <Input
                  id="campaign-name"
                  placeholder="Enter campaign name"
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="campaign-subject">Email Subject</Label>
                <Input
                  id="campaign-subject"
                  placeholder="Enter email subject line"
                  value={newCampaign.subject}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, subject: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="campaign-audience">Audience</Label>
                <Select 
                  value={newCampaign.audienceType} 
                  onValueChange={(value) => setNewCampaign(prev => ({ ...prev, audienceType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select audience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Customers</SelectItem>
                    <SelectItem value="new">New Customers</SelectItem>
                    <SelectItem value="active">Active Customers</SelectItem>
                    <SelectItem value="inactive">Inactive Customers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="campaign-content">Email Content</Label>
                <Textarea
                  id="campaign-content"
                  placeholder="Enter email content..."
                  value={newCampaign.content}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, content: e.target.value }))}
                  rows={4}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateCampaign}>Create Campaign</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaigns.length}</div>
            <p className="text-xs text-muted-foreground">Active campaigns</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sent Campaigns</CardTitle>
            <Send className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSent}</div>
            <p className="text-xs text-muted-foreground">Successfully delivered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recipients</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRecipients.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Email subscribers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Open Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgOpenRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Email engagement</p>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns List */}
      <Card>
        <CardHeader>
          <CardTitle>Email Campaigns</CardTitle>
          <CardDescription>Manage your email marketing campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-medium">{campaign.name}</h4>
                    <Badge className={getStatusColor(campaign.status)}>
                      {campaign.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Subject: {campaign.subject}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>{campaign.recipients.toLocaleString()} recipients</span>
                    {campaign.status === 'sent' && (
                      <>
                        <span>•</span>
                        <span>{campaign.openRate}% open rate</span>
                        <span>•</span>
                        <span>{campaign.clickRate}% click rate</span>
                      </>
                    )}
                    {campaign.sentDate && (
                      <>
                        <span>•</span>
                        <span>Sent {campaign.sentDate}</span>
                      </>
                    )}
                    {campaign.scheduledDate && (
                      <>
                        <span>•</span>
                        <span>Scheduled for {campaign.scheduledDate}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditCampaign(campaign)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  {campaign.status === 'draft' && (
                    <Button
                      size="sm"
                      onClick={() => handleSendCampaign(campaign)}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toast({ title: "View Analytics", description: "Opening campaign analytics (feature coming soon)" })}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {campaigns.length === 0 && (
            <div className="text-center py-12">
              <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Email Campaigns</h3>
              <p className="text-muted-foreground mb-4">
                Start engaging with your customers by creating your first email campaign
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Campaign
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}