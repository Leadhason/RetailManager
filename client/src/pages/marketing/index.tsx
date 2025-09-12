import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEmailCampaigns, useCreateEmailCampaign, useSendCampaign, useMarketingMetrics } from "@/hooks/use-marketing";
import { useToast } from "@/hooks/use-toast";
import { Plus, Mail, Send, BarChart3, Megaphone, Target, Users } from "lucide-react";
import EmailCampaignForm from "@/components/marketing/email-campaign-form";
import CampaignTable from "@/components/marketing/campaign-table";
import type { EmailCampaign } from "@shared/schema";

export default function MarketingIndex() {
  const [activeTab, setActiveTab] = useState("campaigns");
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const { data: campaigns = [], isLoading: campaignsLoading, error: campaignsError, refetch } = useEmailCampaigns();
  const { data: marketingMetrics, isLoading: metricsLoading, error: metricsError } = useMarketingMetrics();
  const createCampaign = useCreateEmailCampaign();
  const sendCampaign = useSendCampaign();
  const { toast } = useToast();

  const handleCreateCampaign = async (data: any) => {
    try {
      await createCampaign.mutateAsync(data);
      toast({
        title: "Success",
        description: "Email campaign created successfully",
      });
      setShowCreateForm(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create campaign",
        variant: "destructive",
      });
    }
  };

  const handleSendCampaign = async (campaign: EmailCampaign) => {
    if (window.confirm(`Are you sure you want to send "${campaign.name}" to all recipients?`)) {
      try {
        await sendCampaign.mutateAsync(campaign.id);
        toast({
          title: "Success",
          description: "Campaign sent successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to send campaign",
          variant: "destructive",
        });
      }
    }
  };

  const handleViewCampaign = (campaign: EmailCampaign) => {
    toast({
      title: "Campaign Details",
      description: `Viewing details for "${campaign.name}"`,
    });
  };

  const handleEditCampaign = (campaign: EmailCampaign) => {
    toast({
      title: "Edit Campaign",
      description: `Editing "${campaign.name}" (feature coming soon)`,
    });
  };

  const handleDeleteCampaign = (campaign: EmailCampaign) => {
    if (window.confirm(`Are you sure you want to delete "${campaign.name}"?`)) {
      toast({
        title: "Delete Campaign",
        description: "Campaign deletion (feature coming soon)",
      });
    }
  };

  const handleViewAnalytics = (campaign: EmailCampaign) => {
    toast({
      title: "Campaign Analytics",
      description: `Viewing analytics for "${campaign.name}"`,
    });
  };

  if (campaignsError || metricsError) {
    return (
      <div className="space-y-6" data-testid="marketing-error">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Marketing</h1>
            <p className="text-muted-foreground">Manage campaigns and promotions</p>
          </div>
        </div>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Megaphone className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to load marketing data</h3>
            <p className="text-muted-foreground text-center mb-4">
              {(campaignsError || metricsError) instanceof Error 
                ? (campaignsError || metricsError)?.message 
                : "An unexpected error occurred"}
            </p>
            <Button onClick={() => refetch()} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Sample marketing metrics for display
  const sampleMetrics = {
    totalCampaigns: campaigns.length,
    activeCampaigns: campaigns.filter(c => c.status === 'sent').length,
    totalSubscribers: 1247,
    averageOpenRate: 24.5,
    averageClickRate: 3.2,
    recentCampaigns: campaigns.slice(0, 5)
  };

  return (
    <div className="space-y-6" data-testid="marketing-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Marketing</h1>
          <p className="text-muted-foreground">
            Manage email campaigns, promotions, and customer engagement
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} data-testid="create-campaign-button">
          <Plus className="mr-2 h-4 w-4" />
          Create Campaign
        </Button>
      </div>

      {/* Marketing Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sampleMetrics.totalCampaigns}</div>
            <p className="text-xs text-muted-foreground">All time campaigns</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <Send className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sampleMetrics.activeCampaigns}</div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscribers</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sampleMetrics.totalSubscribers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Email subscribers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Open Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sampleMetrics.averageOpenRate}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+2.1%</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="campaigns">Email Campaigns</TabsTrigger>
          <TabsTrigger value="promotions">Promotions</TabsTrigger>
          <TabsTrigger value="seo">SEO Tools</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-6">
          {showCreateForm ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Create Email Campaign</h2>
                <Button 
                  variant="outline" 
                  onClick={() => setShowCreateForm(false)}
                  data-testid="cancel-create-campaign"
                >
                  Cancel
                </Button>
              </div>
              <EmailCampaignForm
                onSubmit={handleCreateCampaign}
                isLoading={createCampaign.isPending}
              />
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Email Campaigns</CardTitle>
                <CardDescription>
                  Manage your email marketing campaigns and track their performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CampaignTable
                  campaigns={campaigns}
                  onView={handleViewCampaign}
                  onEdit={handleEditCampaign}
                  onSend={handleSendCampaign}
                  onDelete={handleDeleteCampaign}
                  onViewAnalytics={handleViewAnalytics}
                  isLoading={campaignsLoading}
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="promotions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Promotions & Discounts</CardTitle>
              <CardDescription>Create and manage promotional campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Promotions Management</h3>
                <p className="text-muted-foreground mb-4">
                  Create discount codes, flash sales, and promotional campaigns
                </p>
                <Button data-testid="create-promotion">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Promotion
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SEO Tools</CardTitle>
              <CardDescription>Optimize your content for search engines</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">SEO Optimization</h3>
                <p className="text-muted-foreground mb-4">
                  Manage meta tags, keywords, and search engine optimization
                </p>
                <Button data-testid="seo-settings">
                  <Target className="mr-2 h-4 w-4" />
                  SEO Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average Open Rate</span>
                    <span className="font-medium">{sampleMetrics.averageOpenRate}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average Click Rate</span>
                    <span className="font-medium">{sampleMetrics.averageClickRate}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Unsubscribe Rate</span>
                    <span className="font-medium">0.8%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Bounce Rate</span>
                    <span className="font-medium">2.1%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performing Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaigns.slice(0, 3).map((campaign, index) => (
                    <div key={campaign.id} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{campaign.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {campaign.sentCount || 0} sent
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {campaign.sentCount && campaign.openCount 
                            ? `${((campaign.openCount / campaign.sentCount) * 100).toFixed(1)}%`
                            : "0%"
                          }
                        </div>
                        <div className="text-sm text-muted-foreground">open rate</div>
                      </div>
                    </div>
                  ))}
                  {campaigns.length === 0 && (
                    <div className="text-center text-muted-foreground py-4">
                      No campaigns available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
