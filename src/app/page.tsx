import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatsCard } from "@/components/dashboard/stats-card"
import { DiseaseChart } from "@/components/dashboard/disease-chart"
import { CropChart } from "@/components/dashboard/crop-chart"
import { RecentScans } from "@/components/dashboard/recent-scans"
import { Activity, Leaf, Bug, Wheat } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="Total Scans"
          value="1,254"
          description="+20.1% from last month"
          icon={<Activity className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard 
          title="Crops Identified"
          value="32"
          description="4 new types this week"
          icon={<Leaf className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard 
          title="Diseases Detected"
          value="89"
          description="+12 from last month"
          icon={<Bug className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard 
          title="Healthy Yields"
          value="92%"
          description="Trending upwards"
          icon={<Wheat className="h-4 w-4 text-muted-foreground" />}
        />
      </div>
      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="col-span-1 lg:col-span-4">
          <CardHeader>
            <CardTitle>Disease Frequency</CardTitle>
            <CardDescription>An overview of detected diseases in the last 30 days.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <DiseaseChart />
          </CardContent>
        </Card>
        <Card className="col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle>Crop Distribution</CardTitle>
            <CardDescription>Distribution of all scanned crop types.</CardDescription>
          </CardHeader>
          <CardContent>
            <CropChart />
          </CardContent>
        </Card>
      </div>
      <RecentScans />
    </div>
  )
}
