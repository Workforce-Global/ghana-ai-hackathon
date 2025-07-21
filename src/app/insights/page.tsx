import { RecentScans } from "@/components/dashboard/recent-scans";
import { AnalyticsReport } from "@/components/insights/analytics-report";

export default function InsightsPage() {
  return (
    <div className="space-y-8">
        <div>
            <h1 className="text-3xl font-bold">Insights</h1>
            <p className="text-muted-foreground">AI-powered analytics and a complete log of all your crop analyses.</p>
        </div>
        <AnalyticsReport />
        <RecentScans showAll={true} />
    </div>
  );
}
