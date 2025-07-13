import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Info, BellRing, Users, ShieldAlert } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Admin Settings</h1>
        <p className="text-muted-foreground">Configure system-wide settings and preferences.</p>
      </div>

      <Card className="shadow-md rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5 text-primary" /> General Settings</CardTitle>
          <CardDescription>Basic configuration for the SmartServe system.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="facilityName">Facility Name</Label>
            <Input id="facilityName" defaultValue="Main Office Cafeteria" />
          </div>
          <div>
            <Label htmlFor="systemEmail">System Notification Email</Label>
            <Input id="systemEmail" type="email" defaultValue="noreply@smartserve.example.com" />
          </div>
          <div className="flex items-center justify-between space-x-2 p-3 rounded-md border">
            <Label htmlFor="maintenance-mode" className="flex flex-col space-y-1">
              <span>Maintenance Mode</span>
              <span className="font-normal leading-snug text-muted-foreground text-xs">
                Temporarily disable employee check-in and display a maintenance message.
              </span>
            </Label>
            <Switch id="maintenance-mode" />
          </div>
          <Button>Save General Settings</Button>
        </CardContent>
      </Card>

      <Card className="shadow-md rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BellRing className="h-5 w-5 text-primary" /> Notification Preferences (Admin)</CardTitle>
          <CardDescription>Manage how admins receive system alerts.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="flex items-center justify-between space-x-2 p-3 rounded-md border">
            <Label htmlFor="critical-alerts" className="flex flex-col space-y-1">
              <span>Critical System Alerts</span>
              <span className="font-normal leading-snug text-muted-foreground text-xs">
                Receive email for critical system failures or security issues.
              </span>
            </Label>
            <Switch id="critical-alerts" defaultChecked />
          </div>
          <div className="flex items-center justify-between space-x-2 p-3 rounded-md border">
            <Label htmlFor="daily-summary" className="flex flex-col space-y-1">
              <span>Daily Operational Summary</span>
               <span className="font-normal leading-snug text-muted-foreground text-xs">
                Get a daily email digest of check-ins and waste logs.
              </span>
            </Label>
            <Switch id="daily-summary" defaultChecked />
          </div>
          <Button>Save Admin Notifications</Button>
        </CardContent>
      </Card>
      
      <Card className="shadow-md rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> User Roles & Permissions (Placeholder)</CardTitle>
          <CardDescription>Manage admin user roles and their access levels.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground">This section will allow for managing different admin roles (e.g., Super Admin, Kitchen Manager Admin) and their specific permissions within the admin panel.</p>
            <Button variant="outline" className="mt-4" disabled>Manage Roles</Button>
        </CardContent>
      </Card>

      <Card className="shadow-md rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ShieldAlert className="h-5 w-5 text-destructive" /> Security & Audit (Placeholder)</CardTitle>
          <CardDescription>Configure security settings and view audit logs.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">This section will include options for password policies, two-factor authentication (2FA) setup for admins, and access to system audit logs.</p>
            <Button variant="outline" className="mr-2" disabled>Configure Security</Button>
            <Button variant="outline" disabled>View Audit Logs</Button>
        </CardContent>
      </Card>

    </div>
  );
}
