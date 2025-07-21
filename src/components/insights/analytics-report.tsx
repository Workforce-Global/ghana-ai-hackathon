
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lightbulb, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/context/auth-provider';
import { generateAnalyticsReport } from '@/ai/flows/generate-analytics-report';

export function AnalyticsReport() {
    const [reportHtml, setReportHtml] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        const fetchReport = async () => {
            if (!user) {
                // If there's no user, we can't fetch a report.
                // We can set loading to false and return.
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);
            
            try {
                const idToken = await user.getIdToken();
                const result = await generateAnalyticsReport(undefined, { auth: { uid: user.uid, idToken } });
                setReportHtml(result);
            } catch (e: any) {
                const errorMessage = e.message || "An unknown error occurred while generating the report.";
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        // We only want to fetch the report if the user is available.
        if (user) {
            fetchReport();
        } else {
            // Handle the case where the user is not logged in yet.
            // For example, you might want to show a message.
            setLoading(false);
            // Optionally set an error or a message
            // setError("Please log in to view your analytics report.");
        }
    }, [user]);

    const renderContent = () => {
        if (loading) {
            return (
                <div className="space-y-4">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                </div>
            );
        }

        if (error) {
            return (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Failed to Generate Report</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            );
        }
        
        if (!user) {
             return (
                <div className="text-center text-muted-foreground">
                    Please log in to view your personalized analytics.
                </div>
            )
        }


        if (reportHtml) {
            return (
                <div 
                    className="prose prose-sm dark:prose-invert text-card-foreground" 
                    dangerouslySetInnerHTML={{ __html: reportHtml }}
                ></div>
            );
        }

        return null;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-6 h-6 text-yellow-500" />
                    AI-Powered Analytics
                </CardTitle>
                <CardDescription>
                    An automated summary of your scan history, highlighting trends and key insights.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {renderContent()}
            </CardContent>
        </Card>
    );
}
