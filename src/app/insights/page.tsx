import { RecentScans } from "@/components/dashboard/recent-scans";

export default function InsightsPage() {
  return (
    <div className="space-y-8">
        <div>
            <h1 className="text-3xl font-bold">Insights</h1>
            <p className="text-muted-foreground">A log of all your crop analyses.</p>
        </div>
        <RecentScans showAll={true} />
    </div>
  );
}
