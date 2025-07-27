
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lightbulb, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/context/auth-provider';
import { generateAnalyticsReport } from '@/ai/flows/generate-analytics-report';
import { Button } from '@/components/ui/button';

export function AnalyticsReport() {
    const [reportHtml, setReportHtml] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user, loading: authLoading } = useAuth();

    const fetchReport = async () => {
        if (!user) {
            setError("You must be logged in to generate a report.");
            return;
        }

        setLoading(true);
        setError(null);
        setReportHtml(null);
        
        try {
            const idToken = await user.getIdToken();
            const result = await generateAnalyticsReport(undefined, {
                auth: {
                    uid: user.uid,
                    idToken
                }
            });
            setReportHtml(result);
        } catch (e: any) {
            const errorMessage = e.message || "An unknown error occurred while generating the report.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };
    
    // Automatically fetch report on initial load if user is logged in.
    useEffect(() => {
        if (user && !authLoading) {
            fetchReport();
        }
    }, [user, authLoading]);

    const renderContent = () => {
        if (authLoading) {
            return (
                <div className="space-y-4">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                </div>
            );
        }
        
        if (!user) {
             return (
                <div className="text-center text-muted-foreground">
                    Please log in to view your personalized analytics.
                </div>
            )
        }

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
                    <AlertDescription>
                        {error}
                        <Button variant="link" onClick={fetchReport} className="p-0 h-auto ml-2">Try again</Button>
                    </AlertDescription>
                </Alert>
            );
        }

        if (reportHtml) {
            return (
                <div 
                    className="prose prose-sm dark:prose-invert text-card-foreground" 
                    dangerouslySetInnerHTML={{ __html: reportHtml }}
                ></div>
            );
        }

        return (
             <div className="text-center">
                <p className="text-muted-foreground mb-4">Click the button to generate your analytics report.</p>
                <Button onClick={fetchReport} disabled={loading}>
                    {loading ? 'Generating...' : 'Generate Report'}
                </Button>
            </div>
        );
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-6 h-6 text-yellow-500" />
                    AI-Powered Analytics
                </CardTitle>
                <CardDescription>
                    An automated summary of your scan history, highlighting trends and key insights. Click the button to generate or refresh your report.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {renderContent()}
            </CardContent>
        </Card>
    );
}
