import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  useUsers, 
  useCreateUser, 
  useUpdateUser, 
  useDeleteUser,
  useSystemSettings,
  useUpdateSystemSettings 
} from "@/hooks/use-settings";
import { useToast } from "@/hooks/use-toast";
import { Settings, Users, Globe, Shield, Database, RefreshCw } from "lucide-react";
import UserManagement from "@/components/settings/user-management";
import SystemSettings from "@/components/settings/system-settings";

export default function SettingsIndex() {
  const [activeTab, setActiveTab] = useState("users");
  
  const { data: users = [], isLoading: usersLoading, error: usersError, refetch } = useUsers();
  const { data: systemSettings, isLoading: settingsLoading, error: settingsError } = useSystemSettings();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  const updateSystemSettings = useUpdateSystemSettings();
  const { toast } = useToast();

  const handleCreateUser = async (userData: any) => {
    try {
      await createUser.mutateAsync(userData);
      toast({
        title: "Success",
        description: "User created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create user",
        variant: "destructive",
      });
    }
  };

  const handleUpdateUser = async (id: string, userData: any) => {
    try {
      await updateUser.mutateAsync({ id, updates: userData });
      toast({
        title: "Success",
        description: "User updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update user",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await deleteUser.mutateAsync(id);
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const handleUpdateSettings = async (settingsData: any) => {
    try {
      await updateSystemSettings.mutateAsync(settingsData);
      toast({
        title: "Success",
        description: "Settings updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update settings",
        variant: "destructive",
      });
    }
  };

  if (usersError || settingsError) {
    return (
      <div className="space-y-6" data-testid="settings-error">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">System configuration and user management</p>
          </div>
        </div>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Settings className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to load settings</h3>
            <p className="text-muted-foreground text-center mb-4">
              {(usersError || settingsError) instanceof Error 
                ? (usersError || settingsError)?.message 
                : "An unexpected error occurred"}
            </p>
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="settings-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Configure system settings, manage users, and control access
          </p>
        </div>
      </div>

      {/* Settings Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">System users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.filter(u => u.isActive).length}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Shield className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.role === 'super_admin' || u.role === 'store_manager').length}
            </div>
            <p className="text-xs text-muted-foreground">Admin users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Database className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Healthy</div>
            <p className="text-xs text-muted-foreground">All systems operational</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="users" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Users</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center space-x-2">
            <Globe className="w-4 h-4" />
            <span>System</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center space-x-2">
            <Shield className="w-4 h-4" />
            <span>Security</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center space-x-2">
            <Database className="w-4 h-4" />
            <span>Integrations</span>
          </TabsTrigger>
          <TabsTrigger value="backup" className="flex items-center space-x-2">
            <RefreshCw className="w-4 h-4" />
            <span>Backup</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <UserManagement
            users={users}
            onCreateUser={handleCreateUser}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
            isLoading={usersLoading}
          />
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <SystemSettings
            settings={systemSettings}
            onUpdateSettings={handleUpdateSettings}
            isLoading={settingsLoading || updateSystemSettings.isPending}
          />
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure security policies and access controls</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Password Policy</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Minimum Length</span>
                          <span>8 characters</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Require Numbers</span>
                          <span className="text-green-600">Enabled</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Require Symbols</span>
                          <span className="text-green-600">Enabled</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Password Expiry</span>
                          <span>90 days</span>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full mt-4" data-testid="edit-password-policy">
                        Edit Policy
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Session Management</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Session Timeout</span>
                          <span>120 minutes</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Max Concurrent Sessions</span>
                          <span>3</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Remember Me Duration</span>
                          <span>30 days</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Force Logout</span>
                          <span className="text-yellow-600">Manual</span>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full mt-4" data-testid="edit-session-settings">
                        Edit Settings
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Access Logs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-sm text-muted-foreground">
                        Recent login attempts and security events
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <span className="font-medium">Successful login</span>
                            <span className="text-sm text-muted-foreground ml-2">admin@edmax.com</span>
                          </div>
                          <span className="text-sm text-muted-foreground">2 hours ago</span>
                        </div>
                        <div className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <span className="font-medium">Failed login attempt</span>
                            <span className="text-sm text-red-600 ml-2">unknown@example.com</span>
                          </div>
                          <span className="text-sm text-muted-foreground">5 hours ago</span>
                        </div>
                      </div>
                      <Button variant="outline" data-testid="view-full-logs">
                        View Full Logs
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Third-party Integrations</CardTitle>
              <CardDescription>Configure external services and API connections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <Globe className="mr-2 h-5 w-5" />
                        Payment Gateway
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span>Paystack</span>
                          <span className="text-green-600 font-medium">Connected</span>
                        </div>
                        <Button variant="outline" size="sm" data-testid="configure-paystack">
                          Configure
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <Settings className="mr-2 h-5 w-5" />
                        Email Service
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span>SendGrid</span>
                          <span className="text-green-600 font-medium">Connected</span>
                        </div>
                        <Button variant="outline" size="sm" data-testid="configure-sendgrid">
                          Configure
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <Database className="mr-2 h-5 w-5" />
                        Analytics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span>Google Analytics</span>
                          <span className="text-yellow-600 font-medium">Pending</span>
                        </div>
                        <Button variant="outline" size="sm" data-testid="configure-analytics">
                          Configure
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <RefreshCw className="mr-2 h-5 w-5" />
                        SMS Service
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span>Twilio</span>
                          <span className="text-gray-600 font-medium">Not Connected</span>
                        </div>
                        <Button variant="outline" size="sm" data-testid="configure-sms">
                          Configure
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Backup & Recovery</CardTitle>
              <CardDescription>Manage data backups and system recovery options</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Automatic Backups</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Frequency</span>
                          <span className="font-medium">Daily</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Retention</span>
                          <span className="font-medium">30 days</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Last Backup</span>
                          <span className="font-medium">2 hours ago</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Status</span>
                          <span className="text-green-600 font-medium">Active</span>
                        </div>
                        <Button variant="outline" className="w-full" data-testid="backup-settings">
                          Backup Settings
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Manual Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <Button className="w-full" data-testid="create-backup">
                          <Database className="mr-2 h-4 w-4" />
                          Create Backup Now
                        </Button>
                        <Button variant="outline" className="w-full" data-testid="restore-backup">
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Restore from Backup
                        </Button>
                        <Button variant="outline" className="w-full" data-testid="download-backup">
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Download Backup
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Backup History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <div className="font-medium">Daily Backup</div>
                          <div className="text-sm text-muted-foreground">Complete system backup</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">2 hours ago</div>
                          <div className="text-sm text-green-600">Success</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <div className="font-medium">Daily Backup</div>
                          <div className="text-sm text-muted-foreground">Complete system backup</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">Yesterday</div>
                          <div className="text-sm text-green-600">Success</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
