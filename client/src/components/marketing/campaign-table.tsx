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
import { Search, MoreHorizontal, Edit, Send, Eye, Trash2, BarChart } from "lucide-react";
import type { EmailCampaign } from "@shared/schema";

interface CampaignTableProps {
  campaigns: EmailCampaign[];
  onView?: (campaign: EmailCampaign) => void;
  onEdit?: (campaign: EmailCampaign) => void;
  onSend?: (campaign: EmailCampaign) => void;
  onDelete?: (campaign: EmailCampaign) => void;
  onViewAnalytics?: (campaign: EmailCampaign) => void;
  isLoading?: boolean;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'draft':
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    case 'scheduled':
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    case 'sending':
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case 'sent':
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case 'failed':
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  }
};

export default function CampaignTable({ 
  campaigns, 
  onView, 
  onEdit, 
  onSend,
  onDelete,
  onViewAnalytics,
  isLoading 
}: CampaignTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-4" data-testid="campaign-table-loading">
        <div className="flex justify-between items-center">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search campaigns..."
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
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Recipients</TableHead>
                <TableHead>Sent</TableHead>
                <TableHead>Open Rate</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><div className="h-4 bg-muted rounded w-32 animate-pulse" /></TableCell>
                  <TableCell><div className="h-4 bg-muted rounded w-40 animate-pulse" /></TableCell>
                  <TableCell><div className="h-6 bg-muted rounded w-16 animate-pulse" /></TableCell>
                  <TableCell><div className="h-4 bg-muted rounded w-12 animate-pulse" /></TableCell>
                  <TableCell><div className="h-4 bg-muted rounded w-12 animate-pulse" /></TableCell>
                  <TableCell><div className="h-4 bg-muted rounded w-16 animate-pulse" /></TableCell>
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
    <div className="space-y-4" data-testid="campaign-table">
      {/* Search */}
      <div className="flex justify-between items-center">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search campaigns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="search-campaigns"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredCampaigns.length} of {campaigns.length} campaigns
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Recipients</TableHead>
              <TableHead>Sent</TableHead>
              <TableHead>Open Rate</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-12">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCampaigns.length > 0 ? (
              filteredCampaigns.map((campaign) => (
                <TableRow key={campaign.id} data-testid={`campaign-row-${campaign.id}`}>
                  <TableCell>
                    <div className="font-medium">{campaign.name}</div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate">{campaign.subject}</div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(campaign.status)}>
                      {campaign.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {campaign.recipientCount || 0}
                  </TableCell>
                  <TableCell>
                    {campaign.sentCount || 0}
                  </TableCell>
                  <TableCell>
                    {campaign.sentCount && campaign.openCount 
                      ? `${((campaign.openCount / campaign.sentCount) * 100).toFixed(1)}%`
                      : "—"
                    }
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(campaign.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          data-testid={`campaign-actions-${campaign.id}`}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {onView && (
                          <DropdownMenuItem onClick={() => onView(campaign)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                        )}
                        {onEdit && campaign.status === 'draft' && (
                          <DropdownMenuItem onClick={() => onEdit(campaign)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Campaign
                          </DropdownMenuItem>
                        )}
                        {onSend && campaign.status === 'draft' && (
                          <DropdownMenuItem onClick={() => onSend(campaign)}>
                            <Send className="mr-2 h-4 w-4" />
                            Send Campaign
                          </DropdownMenuItem>
                        )}
                        {onViewAnalytics && campaign.status === 'sent' && (
                          <DropdownMenuItem onClick={() => onViewAnalytics(campaign)}>
                            <BarChart className="mr-2 h-4 w-4" />
                            View Analytics
                          </DropdownMenuItem>
                        )}
                        {onDelete && (
                          <DropdownMenuItem 
                            onClick={() => onDelete(campaign)}
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
                    {searchTerm ? "No campaigns found matching your search" : "No campaigns available"}
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
