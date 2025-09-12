import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const campaignSchema = z.object({
  name: z.string().min(1, "Campaign name is required"),
  subject: z.string().min(1, "Email subject is required"),
  content: z.string().min(1, "Email content is required"),
  htmlContent: z.string().optional(),
  scheduledAt: z.string().optional(),
});

type CampaignFormData = z.infer<typeof campaignSchema>;

interface EmailCampaignFormProps {
  onSubmit: (data: CampaignFormData) => void;
  initialData?: Partial<CampaignFormData>;
  isLoading?: boolean;
}

export default function EmailCampaignForm({ onSubmit, initialData, isLoading }: EmailCampaignFormProps) {
  const { toast } = useToast();
  
  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: initialData?.name || "",
      subject: initialData?.subject || "",
      content: initialData?.content || "",
      htmlContent: initialData?.htmlContent || "",
      scheduledAt: initialData?.scheduledAt || "",
    },
  });

  const handleSubmit = (data: CampaignFormData) => {
    try {
      onSubmit(data);
    } catch (error) {
      toast({
        title: "Validation Error",
        description: "Please check your input and try again",
        variant: "destructive",
      });
    }
  };

  return (
    <Card data-testid="email-campaign-form">
      <CardHeader>
        <CardTitle>{initialData ? "Edit Campaign" : "Create Email Campaign"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Campaign Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Campaign Name *</Label>
              <Input
                id="name"
                {...form.register("name")}
                placeholder="Enter campaign name"
                data-testid="input-name"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Email Subject *</Label>
              <Input
                id="subject"
                {...form.register("subject")}
                placeholder="Enter email subject"
                data-testid="input-subject"
              />
              {form.formState.errors.subject && (
                <p className="text-sm text-destructive">{form.formState.errors.subject.message}</p>
              )}
            </div>
          </div>

          {/* Schedule */}
          <div className="space-y-2">
            <Label htmlFor="scheduledAt">Schedule (Optional)</Label>
            <Input
              id="scheduledAt"
              type="datetime-local"
              {...form.register("scheduledAt")}
              data-testid="input-scheduled-at"
            />
          </div>

          {/* Content */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="content">Plain Text Content *</Label>
              <Textarea
                id="content"
                {...form.register("content")}
                placeholder="Enter email content in plain text"
                rows={6}
                data-testid="textarea-content"
              />
              {form.formState.errors.content && (
                <p className="text-sm text-destructive">{form.formState.errors.content.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="htmlContent">HTML Content (Optional)</Label>
              <Textarea
                id="htmlContent"
                {...form.register("htmlContent")}
                placeholder="Enter HTML email content"
                rows={8}
                data-testid="textarea-html-content"
              />
              <p className="text-xs text-muted-foreground">
                HTML content will be used if provided, otherwise plain text will be used
              </p>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-2">
            <Button 
              type="submit" 
              disabled={isLoading}
              data-testid="button-submit"
            >
              {isLoading ? "Saving..." : (initialData ? "Update Campaign" : "Create Campaign")}
            </Button>
            <Button 
              type="button" 
              variant="outline"
              onClick={() => form.reset()}
              data-testid="button-reset"
            >
              Reset
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
