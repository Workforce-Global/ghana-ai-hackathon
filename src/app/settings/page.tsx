import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your application preferences.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize the look and feel of the application.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <Label htmlFor="theme" className="text-lg">Theme</Label>
            <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Light / Dark / System</span>
                <ThemeToggle />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
