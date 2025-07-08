"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Trash } from 'lucide-react';

export function DataManagementForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleClearHistory = () => {
    setIsLoading(true);
    try {
      localStorage.removeItem('recentScans');
      // Dispatch a storage event to notify other components (like RecentScans) to update.
      window.dispatchEvent(new Event('storage'));
      toast({ title: "Scan History Cleared", description: "Your scan history has been successfully removed." });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not clear scan history.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Management</CardTitle>
        <CardDescription>Manage your application data, such as scan history.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h3 className="text-lg font-medium">Clear Scan History</h3>
            <p className="text-sm text-muted-foreground">This will permanently delete all your saved crop scan data.</p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isLoading}>
                <Trash className="mr-2 h-4 w-4" />
                {isLoading ? 'Clearing...' : 'Clear History'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your scan history from this device.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearHistory}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
