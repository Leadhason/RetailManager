import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, RefreshCw, Shield, Globe, Mail, Database } from "lucide-react";

interface SystemSettingsProps {
  settings: any;
  onUpdateSettings: (data: any) => void;
  isLoading?: boolean;
}

const settingsSchema = z.object({
  // General Settings
  siteName: z.string().min(1, "Site name is required"),
  siteDescription: z.string().optional(),
  contactEmail: z.string().email("Invalid email address"),
  supportPhone: z.string().optional(),
  timezone: z.string().min(1, "Timezone is required"),
  
  // Email Settings
  emailFromName: z.string().min(1, "From name is required"),
  emailFromAddress: z.string().email("Invalid email address"),
  emailHost: z.string().optional(),
  emailPort: z.string().optional(),
  
  // Security Settings
  enableTwoFactor: z.boolean(),
  sessionTimeout: z.number().min(15).max(480),
  maxLoginAttempts: z.number().min(3).max(10),
  passwordMinLength: z.number().min(6).max(50),
  
  // Business Settings
  defaultCurrency: z.string().min(1, "Currency is required"),
  taxRate: z.number().min(0).max(100),
  lowStockThreshold: z.number().min(1),
  orderPrefix: z.string().min(1, "Order prefix is required"),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export default function SystemSettings({ 
  settings, 
  onUpdateSettings, 
  isLoading 
}: SystemSettingsProps) {
  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      siteName: settings?.siteName || "EDMAX E-Commerce",
      siteDescription: settings?.siteDescription || "",
      contactEmail: settings?.contactEmail || "admin@edmax.com",
      supportPhone: settings?.supportPhone || "",
      timezone: settings?.timezone || "UTC",
      emailFromName: settings?.emailFromName || "EDMAX Support",
      emailFromAddress: settings?.emailFromAddress || "noreply@edmax.com",
      emailHost: settings?.emailHost || "",
      emailPort: settings?.emailPort || "",
      enableTwoFactor: settings?.enableTwoFactor || false,
      sessionTimeout: settings?.sessionTimeout || 120,
      maxLoginAttempts: settings?.maxLoginAttempts || 5,
      passwordMinLength: settings?.passwordMinLength || 8,
      defaultCurrency: settings?.defaultCurrency || "GHS",
      taxRate: settings?.taxRate || 0,
      lowStockThreshold: settings?.lowStockThreshold || 10,
      orderPrefix: settings?.orderPrefix || "ORD-",
    },
  });

  const handleSubmit = async (data: SettingsFormData) => {
    try {
      await onUpdateSettings(data);
    } catch (error) {
      console.error("Error updating settings:", error);
    }
  };

  return (
    <div className="space-y-6" data-testid="system-settings">
      <Card>
        <CardHeader>
          <CardTitle>System Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general" className="flex items-center space-x-2">
                <Globe className="w-4 h-4" />
                <span>General</span>
              </TabsTrigger>
              <TabsTrigger value="email" className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>Email</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>Security</span>
              </TabsTrigger>
              <TabsTrigger value="business" className="flex items-center space-x-2">
                <Database className="w-4 h-4" />
                <span>Business</span>
              </TabsTrigger>
            </TabsList>

            <form onSubmit={form.handleSubmit(handleSubmit)}>
              <TabsContent value="general" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Site Name *</Label>
                    <Input
                      id="siteName"
                      {...form.register("siteName")}
                      data-testid="input-site-name"
                    />
                    {form.formState.errors.siteName && (
                      <p className="text-sm text-destructive">{form.formState.errors.siteName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email *</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      {...form.register("contactEmail")}
                      data-testid="input-contact-email"
                    />
                    {form.formState.errors.contactEmail && (
                      <p className="text-sm text-destructive">{form.formState.errors.contactEmail.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="supportPhone">Support Phone</Label>
                    <Input
                      id="supportPhone"
                      {...form.register("supportPhone")}
                      data-testid="input-support-phone"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone *</Label>
                    <Input
                      id="timezone"
                      {...form.register("timezone")}
                      placeholder="UTC"
                      data-testid="input-timezone"
                    />
                    {form.formState.errors.timezone && (
                      <p className="text-sm text-destructive">{form.formState.errors.timezone.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Site Description</Label>
                  <Textarea
                    id="siteDescription"
                    {...form.register("siteDescription")}
                    rows={3}
                    data-testid="textarea-site-description"
                  />
                </div>
              </TabsContent>

              <TabsContent value="email" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="emailFromName">From Name *</Label>
                    <Input
                      id="emailFromName"
                      {...form.register("emailFromName")}
                      data-testid="input-email-from-name"
                    />
                    {form.formState.errors.emailFromName && (
                      <p className="text-sm text-destructive">{form.formState.errors.emailFromName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emailFromAddress">From Address *</Label>
                    <Input
                      id="emailFromAddress"
                      type="email"
                      {...form.register("emailFromAddress")}
                      data-testid="input-email-from-address"
                    />
                    {form.formState.errors.emailFromAddress && (
                      <p className="text-sm text-destructive">{form.formState.errors.emailFromAddress.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emailHost">SMTP Host</Label>
                    <Input
                      id="emailHost"
                      {...form.register("emailHost")}
                      placeholder="smtp.example.com"
                      data-testid="input-email-host"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emailPort">SMTP Port</Label>
                    <Input
                      id="emailPort"
                      {...form.register("emailPort")}
                      placeholder="587"
                      data-testid="input-email-port"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="security" className="space-y-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">
                        Require 2FA for admin users
                      </p>
                    </div>
                    <Switch
                      checked={form.watch("enableTwoFactor")}
                      onCheckedChange={(checked) => form.setValue("enableTwoFactor", checked)}
                      data-testid="switch-two-factor"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                      <Input
                        id="sessionTimeout"
                        type="number"
                        {...form.register("sessionTimeout", { valueAsNumber: true })}
                        data-testid="input-session-timeout"
                      />
                      {form.formState.errors.sessionTimeout && (
                        <p className="text-sm text-destructive">{form.formState.errors.sessionTimeout.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                      <Input
                        id="maxLoginAttempts"
                        type="number"
                        {...form.register("maxLoginAttempts", { valueAsNumber: true })}
                        data-testid="input-max-login-attempts"
                      />
                      {form.formState.errors.maxLoginAttempts && (
                        <p className="text-sm text-destructive">{form.formState.errors.maxLoginAttempts.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="passwordMinLength">Min Password Length</Label>
                      <Input
                        id="passwordMinLength"
                        type="number"
                        {...form.register("passwordMinLength", { valueAsNumber: true })}
                        data-testid="input-password-min-length"
                      />
                      {form.formState.errors.passwordMinLength && (
                        <p className="text-sm text-destructive">{form.formState.errors.passwordMinLength.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="business" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="defaultCurrency">Default Currency *</Label>
                    <Input
                      id="defaultCurrency"
                      {...form.register("defaultCurrency")}
                      placeholder="GHS"
                      data-testid="input-default-currency"
                    />
                    {form.formState.errors.defaultCurrency && (
                      <p className="text-sm text-destructive">{form.formState.errors.defaultCurrency.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="taxRate">Default Tax Rate (%)</Label>
                    <Input
                      id="taxRate"
                      type="number"
                      step="0.01"
                      {...form.register("taxRate", { valueAsNumber: true })}
                      data-testid="input-tax-rate"
                    />
                    {form.formState.errors.taxRate && (
                      <p className="text-sm text-destructive">{form.formState.errors.taxRate.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
                    <Input
                      id="lowStockThreshold"
                      type="number"
                      {...form.register("lowStockThreshold", { valueAsNumber: true })}
                      data-testid="input-low-stock-threshold"
                    />
                    {form.formState.errors.lowStockThreshold && (
                      <p className="text-sm text-destructive">{form.formState.errors.lowStockThreshold.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="orderPrefix">Order Number Prefix</Label>
                    <Input
                      id="orderPrefix"
                      {...form.register("orderPrefix")}
                      placeholder="ORD-"
                      data-testid="input-order-prefix"
                    />
                    {form.formState.errors.orderPrefix && (
                      <p className="text-sm text-destructive">{form.formState.errors.orderPrefix.message}</p>
                    )}
                  </div>
                </div>
              </TabsContent>

              <div className="flex justify-end space-x-2 pt-6 border-t">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => form.reset()}
                  data-testid="button-reset"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  data-testid="button-save"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? "Saving..." : "Save Settings"}
                </Button>
              </div>
            </form>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
